import { Message, UIPayload, InsightData, MappingField } from "../types";
import { APP_TOOLS, INSIGHT_SCHEMA } from "./agent/tools";
import { getSystemContext } from "./agent/context";
import { mcpService } from "./mcpService";

// --- CONFIGURATION ---
const GITHUB_TOKEN = ""; // Removed invalid token to force simulation mode
const MODEL_NAME = "gpt-4o"; // GitHub Model name
const API_ENDPOINT = "https://models.inference.ai.azure.com/chat/completions";

// LiveKit Credentials
export const LIVEKIT_CONFIG = {
  url: "wss://bks-j93lugka.livekit.cloud",
  apiKey: "APICsTFD3VC8EET",
  apiSecret: "2xzwfXvcTuv1C0ppPPvWg0WFStyib0w3XuiePqJYh3r"
};

// --- TYPES ---

interface AIResponse {
  text: string;
  uiPayload?: UIPayload;
}

// Export tools for use in ChatContext
export { APP_TOOLS };

// --- LIVEKIT TOKEN GENERATOR (Client Side HACK for Demo) ---
// WARNING: In production, tokens must be generated on a secure backend.
async function generateLiveKitToken(roomName: string, participantName: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    iss: LIVEKIT_CONFIG.apiKey,
    sub: participantName,
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    video: {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    }
  };

  const base64Url = (str: string) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", 
    enc.encode(LIVEKIT_CONFIG.apiSecret), 
    { name: "HMAC", hash: "SHA-256" }, 
    false, 
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC", 
    key, 
    enc.encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export { generateLiveKitToken };


// --- API Functions (Using GitHub Models) ---

export const generateAIResponse = async (
  userMessage: string,
  history: Message[],
  context?: { path: string }
): Promise<AIResponse> => {
  if (!GITHUB_TOKEN) {
    return simulateStructuredResponse(userMessage, context);
  }

  try {
    const currentPath = context?.path || '/';
    
    // 1. Get Dynamic MCP Tools
    const mcpToolsRaw = await mcpService.discoverTools();
    const mcpToolsMapped = mcpToolsRaw.map(mcpService.mapToGeminiTool);
    
    // 2. Merge Internal Tools with MCP Tools
    const allTools = [...APP_TOOLS, ...mcpToolsMapped];
    
    // 3. Build Context
    const systemInstruction = getSystemContext(currentPath);
    const systemWithMCP = `${systemInstruction}\n\nConnected Tools: You have access to external tools via MCP.`;

    // 4. Prepare Messages
    const messages = [
      { role: "system", content: systemWithMCP },
      ...history.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: "user", content: userMessage }
    ];

    // 5. Call GitHub Model API with Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GITHUB_TOKEN}`
      },
      body: JSON.stringify({
        messages,
        model: MODEL_NAME,
        tools: allTools.length > 0 ? allTools : undefined,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorText = await response.text();
      try {
         // Attempt to parse JSON error to be cleaner
         const errorJson = JSON.parse(errorText);
         if (errorJson.error && errorJson.error.message) {
            errorText = errorJson.error.message;
         } else if (errorJson.message) {
            errorText = errorJson.message;
         }
      } catch (e) {
         // If not JSON, check for common HTML error pages or empty
         if (errorText.trim().startsWith('<')) {
            errorText = "Invalid response format from server.";
         }
      }
      throw new Error(`GitHub Model API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    
    if (!choice) throw new Error("No response choice from AI");

    let text = choice.message.content || "";
    let uiPayload: UIPayload | undefined;
    const toolCalls = choice.message.tool_calls;

    // 6. Handle Tool Calls
    if (toolCalls && toolCalls.length > 0) {
      const call = toolCalls[0];
      const funcName = call.function.name;
      const args = JSON.parse(call.function.arguments);

      const isMCPTool = mcpToolsMapped.some((t: any) => t.function.name === funcName);

      if (isMCPTool) {
         const result = await mcpService.executeTool(funcName, args);
         text = `I consulted the external MCP server (${funcName}).\n\nResult:\n${JSON.stringify(result, null, 2)}`;
         uiPayload = { 
           type: 'alert_list', 
           data: Object.entries(result).map(([k, v]) => ({ 
             title: k, 
             description: typeof v === 'string' ? v : JSON.stringify(v), 
             severity: 'info' 
           })) 
         };
      } else {
         // Internal Tools
         if (funcName === 'navigate') {
            uiPayload = { type: 'navigate', data: args };
         } else if (funcName === 'render_chart') {
            uiPayload = { type: 'chart', data: args };
         } else if (funcName === 'show_alerts') {
            uiPayload = { type: 'alert_list', data: args['items'] || [] };
         } else if (funcName === 'request_approval') {
            uiPayload = { type: 'approval', status: 'pending', data: args };
         } else if (funcName === 'generate_report') {
            uiPayload = { 
              type: 'report', 
              data: {
                ...args,
                id: `RPT-${Date.now().toString().slice(-6)}`,
                generatedAt: new Date().toISOString()
              }
            };
         } else if (funcName === 'draft_email') {
            uiPayload = { type: 'email', data: args };
         }
         
         if (!text) {
             text = `I've generated the ${funcName.replace(/_/g, ' ')} you requested.`;
         }
      }
    }

    if (!text && !uiPayload) return { text: "I processed your request but have no output." };

    return { text, uiPayload };

  } catch (error) {
    console.warn("GitHub Model API Error or Timeout, switching to simulation:", error);
    return simulateStructuredResponse(userMessage, context);
  }
};

export const generateInsight = async (prompt: string): Promise<InsightData> => {
   if (!GITHUB_TOKEN) {
     return simulateInsightResponse(prompt);
   }

   try {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 8000);

     const response = await fetch(API_ENDPOINT, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${GITHUB_TOKEN}`
       },
       body: JSON.stringify({
         messages: [{
           role: "user",
           content: `Analyze the following request and provide a strategic insight: "${prompt}". 
           Return ONLY JSON matching this schema: ${JSON.stringify(INSIGHT_SCHEMA)}`
         }],
         model: MODEL_NAME,
         response_format: { type: "json_object" }
       }),
       signal: controller.signal
     });
     
     clearTimeout(timeoutId);

     if (!response.ok) {
        throw new Error(`Insight API Error: ${response.status}`);
     }

     const data = await response.json();
     const content = data.choices?.[0]?.message?.content;
     if (!content) throw new Error("Empty insight response");

     return JSON.parse(content);

   } catch (error) {
     console.error("Insight Error:", error);
     return simulateInsightResponse(prompt);
   }
};

export const analyzeDataMapping = async (headers: string[], fileName: string): Promise<MappingField[]> => {
  if (GITHUB_TOKEN) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GITHUB_TOKEN}`
        },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Act as a Data Engineer. Map these CSV columns: ${JSON.stringify(headers)}
              To System Fields: [property_name, address, monthly_rent, occupancy, status, lease_start, tenant_name].
              Return JSON array: [{ sourceField, targetField, confidence (0-100), issue }].`
          }],
          model: MODEL_NAME,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
             const parsed = JSON.parse(content);
             return Array.isArray(parsed) ? parsed : (parsed.mappings || []);
          }
      }
    } catch (e) {
      console.error("Mapping Error", e);
    }
  }
  
  // Fallback
  return headers.map(header => ({ sourceField: header, targetField: 'unmapped', confidence: 0, sampleValue: '---' }));
};

// --- Fallback Mocks ---

const PAGE_ROUTES: Record<string, string> = {
  'dashboard': '/',
  'portfolio': '/properties',
  'financial': '/financial',
  'leasing': '/leasing',
  'maintenance': '/maintenance',
  'reports': '/reports',
  'settings': '/settings',
};

// Robust Simulation for Offline/Error Modes
const simulateStructuredResponse = async (message: string, context?: { path: string }): Promise<AIResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800)); 
  const lowerMsg = message.toLowerCase();
  
  // 1. Greetings & Voice Activation
  if (lowerMsg.match(/^(hi|hello|sawasdee|greetings)/) || lowerMsg.includes("hi aot") || lowerMsg.includes("sawasdee aot")) {
     return {
        text: "Sawasdee! I am your AOT Assistant. I'm ready to help you analyze your portfolio, track revenue, or manage maintenance. What would you like to do?"
     };
  }

  // 2. Reports
  if (lowerMsg.includes('report')) {
    return {
      text: "I've generated the monthly performance report for you. It highlights a 5% increase in revenue.",
      uiPayload: {
        type: 'report',
        data: {
          id: 'RPT-MOCK-001',
          title: 'Portfolio Performance Report',
          type: 'Financial',
          period: 'November 2024',
          summary: 'Overall portfolio performance remains strong with a 95% occupancy rate.',
          keyMetrics: [{ label: 'Revenue', value: '$2.4M', trend: 'up' }, { label: 'Expenses', value: '$980k', trend: 'down' }],
          generatedAt: new Date().toISOString()
        }
      }
    };
  }

  // 3. Email Drafting
  if (lowerMsg.includes('email') || lowerMsg.includes('draft') || lowerMsg.includes('send')) {
     return {
        text: "I've drafted a lease renewal email for TechCorp based on their upcoming expiry.",
        uiPayload: {
           type: 'email',
           data: {
              recipient: "TechCorp Inc. (contact@techcorp.com)",
              subject: "Lease Renewal Proposal - Unit 5F",
              body: "Dear TechCorp Team,\n\nWe value your tenancy at Suvarnabhumi Residence. As your lease is approaching its expiration on Dec 15, 2025, we would like to propose a renewal for another 12-month term at the rate of ฿8,500/mo.\n\nPlease let us know if you would like to discuss this further.\n\nBest regards,\nAOT Asset Management",
              context: "renewal"
           }
        }
     };
  }

  // 4. Navigation
  const navIntent = Object.keys(PAGE_ROUTES).find(page => lowerMsg.includes(page) && (lowerMsg.includes('go to') || lowerMsg.includes('navigate') || lowerMsg.includes('show')));
  if (navIntent) {
    return {
      text: `Navigating to ${navIntent}...`,
      uiPayload: { type: 'navigate', data: { path: PAGE_ROUTES[navIntent] } }
    };
  }

  // 5. Charts / Revenue Analysis
  if (lowerMsg.includes('revenue') || lowerMsg.includes('chart') || lowerMsg.includes('trend') || lowerMsg.includes('analyze')) {
     return {
        text: "Here is the analysis you requested. Revenue is trending upwards with a projected 12% annual growth.",
        uiPayload: {
           type: 'chart',
           data: {
              title: 'Revenue Analysis (Simulated)',
              chartType: 'area',
              series: [
                 { name: 'Jan', value: 1.2 }, { name: 'Feb', value: 1.3 }, { name: 'Mar', value: 1.4 },
                 { name: 'Apr', value: 1.8 }, { name: 'May', value: 2.0 }, { name: 'Jun', value: 2.4 }
              ]
           }
        }
     };
  }

  // 6. Alerts / Risks
  if (lowerMsg.includes('alert') || lowerMsg.includes('risk') || lowerMsg.includes('attention')) {
     return {
        text: "I've identified a few critical items that need your attention.",
        uiPayload: {
           type: 'alert_list',
           data: [
              { title: 'Tenant Dispute', severity: 'High', location: 'Building A', description: 'Legal action required.' },
              { title: 'Lease Expiry', severity: 'warning', location: 'Unit 304', description: 'Expires in 30 days.' }
           ]
        }
     };
  }

  // Default Offline Message
  return {
    text: "I'm currently operating in offline demo mode (API connection unavailable). \n\nYou can try asking me to 'navigate to reports', 'draft an email', or 'analyze revenue' to see how the interface responds."
  };
};

const simulateInsightResponse = async (prompt: string): Promise<InsightData> => {
   await new Promise(resolve => setTimeout(resolve, 1500));
   return {
     title: "Offline Data Insight",
     explanation: [
         "This is a simulated insight because the live AI service is currently unreachable.",
         "The data indicates a stable trend with minor fluctuations.",
         "Operational metrics are within the expected range."
     ],
     prediction: "Performance is projected to remain stable for the next quarter.",
     suggestions: [
         "Check your network connection.",
         "Verify your API key configuration.",
         "Review the manual reports for detailed data."
     ]
   };
};