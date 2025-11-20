
import { GoogleGenAI } from "@google/genai";
import { Message, UIPayload, InsightData, MappingField } from "../types";
import { APP_TOOLS, INSIGHT_SCHEMA } from "./agent/tools";
import { getSystemContext } from "./agent/context";
import { mcpService } from "./mcpService";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

interface AIResponse {
  text: string;
  uiPayload?: UIPayload;
}

// Export tools for use in ChatContext (Voice API)
export { APP_TOOLS };

// --- API Functions ---

export const generateAIResponse = async (
  userMessage: string,
  history: Message[],
  context?: { path: string }
): Promise<AIResponse> => {
  // Fallback if no API key
  if (!ai || !apiKey) {
    return simulateStructuredResponse(userMessage, context);
  }

  try {
    const currentPath = context?.path || '/';
    
    // 1. Get Dynamic MCP Tools
    const mcpToolsRaw = await mcpService.discoverTools();
    const geminiMCPTools = mcpToolsRaw.map(mcpService.mapToGeminiTool);
    
    // 2. Merge Internal Tools with MCP Tools
    // Note: Google SDK expects an array of Tool objects { functionDeclarations: [...] }
    // We need to merge the arrays of functionDeclarations
    const internalFunctionDecls = APP_TOOLS[0].functionDeclarations;
    const allFunctionDeclarations = [...internalFunctionDecls, ...geminiMCPTools];
    
    const activeTools = [{ functionDeclarations: allFunctionDeclarations }];

    // 3. Build Context
    const systemInstruction = getSystemContext(currentPath);
    
    // Append MCP Context hint
    const systemWithMCP = `${systemInstruction}\n\nConnected Tools: You have access to external tools via MCP (Model Context Protocol). Use them when the user asks for external market data, zoning laws, or competitor analysis.`;

    const contents = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // 4. Call Model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemWithMCP,
        tools: activeTools, 
        temperature: 0.7,
      }
    });

    const candidate = response.candidates?.[0];
    let text = candidate?.content?.parts?.map(p => p.text).join('') || "";
    let uiPayload: UIPayload | undefined;

    // 5. Handle Tool Calls (Internal vs MCP)
    const functionCalls = candidate?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0]; // Handle primary tool call
      
      if (call && call.name) {
         // Check if it is an MCP Tool
         const isMCPTool = geminiMCPTools.some(t => t.name === call.name);

         if (isMCPTool) {
           // Execute MCP Tool
           const result = await mcpService.executeTool(call.name, call.args);
           
           // Since this is a single-turn implementation for simplicity, we append the result to the text
           // In a multi-turn setup, we would send this back to Gemini.
           // For this demo, we format it as a text response or a special UI payload.
           
           text = `I consulted the external MCP server (${call.name}).\n\nResult:\n${JSON.stringify(result, null, 2)}`;
           
           // Optional: You could create a generic "Data View" UI payload for MCP results
           uiPayload = { 
             type: 'alert_list', // Reusing alert list to show key-value pairs nicely
             data: Object.entries(result).map(([k, v]) => ({ 
               title: k, 
               description: typeof v === 'string' ? v : JSON.stringify(v), 
               severity: 'info' 
             })) 
           };

         } else {
           // Execute Internal Tool (Generative UI)
           if (call.name === 'navigate') {
              uiPayload = { type: 'navigate', data: call.args };
           } else if (call.name === 'render_chart') {
              uiPayload = { type: 'chart', data: call.args };
           } else if (call.name === 'show_alerts') {
              uiPayload = { type: 'alert_list', data: call.args['items'] || [] };
           } else if (call.name === 'request_approval') {
              uiPayload = { type: 'approval', status: 'pending', data: call.args };
           } else if (call.name === 'generate_report') {
              uiPayload = { 
                type: 'report', 
                data: {
                  ...call.args,
                  id: `RPT-${Date.now().toString().slice(-6)}`,
                  generatedAt: new Date().toISOString()
                }
              };
           }
           
           if (!text) {
               text = `I've generated the ${call.name.replace(/_/g, ' ')} you requested.`;
           }
         }
      }
    }

    if (!text && !uiPayload) throw new Error("Empty response from Gemini");

    return { text, uiPayload };

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return simulateStructuredResponse(userMessage, context);
  }
};

export const generateInsight = async (prompt: string): Promise<InsightData> => {
   if (!ai || !apiKey) {
     return simulateInsightResponse(prompt);
   }

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-3-pro-preview',
       contents: [{
         role: 'user',
         parts: [{ text: `Analyze the following request and provide a strategic insight: "${prompt}". 
         Context: Use general real estate asset management principles and assume a mixed portfolio.
         ` }]
       }],
       config: {
         responseMimeType: 'application/json',
         responseSchema: INSIGHT_SCHEMA, // Imported from agent/tools.ts
         thinkingConfig: { thinkingBudget: 32768 }
       }
     });

     const text = response.text;
     if (!text) throw new Error("Empty insight response");

     return JSON.parse(text);

   } catch (error) {
     console.error("Gemini Insight Error:", error);
     return simulateInsightResponse(prompt);
   }
};

export const analyzeDataMapping = async (headers: string[], fileName: string): Promise<MappingField[]> => {
  // If using real API, we would send headers to Gemini to map against our known schema:
  // Schema: { Property Name, Address, Monthly Rent, Occupancy Rate, Status }
  
  if (ai && apiKey) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{ text: `
            Act as a Data Engineer for a Real Estate system.
            Map the following CSV columns: ${JSON.stringify(headers)}
            To our Internal System Fields: [property_name, address, monthly_rent, occupancy, status, lease_start, tenant_name].
            
            Return a JSON array of objects with properties: sourceField, targetField, confidence (0-100), issue (optional string if confidence < 80).
          ` }]
        }],
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      const text = response.text;
      if (text) return JSON.parse(text);
    } catch (e) {
      console.error("Mapping Error", e);
    }
  }

  // Fallback simulation logic
  await new Promise(resolve => setTimeout(resolve, 1500));

  return headers.map(header => {
    const h = header.toLowerCase();
    if (h.includes('name') || h.includes('property')) return { sourceField: header, targetField: 'property_name', confidence: 95, sampleValue: 'Suvarnabhumi Res.' };
    if (h.includes('addr') || h.includes('location')) return { sourceField: header, targetField: 'address', confidence: 90, sampleValue: '612/21 King Kaew' };
    if (h.includes('rent') || h.includes('price')) return { sourceField: header, targetField: 'monthly_rent', confidence: 85, sampleValue: '12000' };
    if (h.includes('status')) return { sourceField: header, targetField: 'status', confidence: 92, sampleValue: 'Active' };
    if (h.includes('occupancy')) return { sourceField: header, targetField: 'occupancy', confidence: 88, sampleValue: '95%' };
    
    // Low confidence example
    if (h.includes('legacy') || h.includes('code')) return { sourceField: header, targetField: 'id', confidence: 40, sampleValue: 'LEG-001', issue: 'Format mismatch potential' };
    
    return { sourceField: header, targetField: 'unmapped', confidence: 0, sampleValue: '---', issue: 'No matching field found' };
  });
};

// --- Fallback Mocks ---

const PAGE_ROUTES: Record<string, string> = {
  'dashboard': '/',
  'portfolio': '/properties',
  'financial': '/financial',
  'leasing': '/leasing',
  'maintenance': '/maintenance',
  'reports': '/reports',
};

const simulateStructuredResponse = async (message: string, context?: { path: string }): Promise<AIResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800)); 

  const lowerMsg = message.toLowerCase();
  
  // Report generation mock
  if (lowerMsg.includes('report')) {
    return {
      text: "I've generated the monthly performance report for you.",
      uiPayload: {
        type: 'report',
        data: {
          id: 'RPT-MOCK-001',
          title: 'Portfolio Performance Report',
          type: 'Financial',
          period: 'November 2024',
          summary: 'Overall portfolio performance remains strong with a 5.2% increase in revenue. Occupancy rates have stabilized at 76%, though maintenance costs saw a slight uptick.',
          keyMetrics: [
            { label: 'Revenue', value: '$2.4M', trend: 'up' },
            { label: 'NOI', value: '$1.42M', trend: 'up' },
            { label: 'Expenses', value: '$980K', trend: 'down' }
          ],
          generatedAt: new Date().toISOString()
        }
      }
    };
  }

  // Navigation
  const navIntent = Object.keys(PAGE_ROUTES).find(page => lowerMsg.includes(page) && lowerMsg.includes('go to'));
  if (navIntent) {
    return {
      text: `Navigating to ${navIntent}...`,
      uiPayload: { type: 'navigate', data: { path: PAGE_ROUTES[navIntent] } }
    };
  }

  // Chart
  if (lowerMsg.includes('revenue') || lowerMsg.includes('trend')) {
    return {
      text: "Here is the projected revenue growth.",
      uiPayload: {
        type: 'chart',
        data: {
          title: "Revenue Projection",
          chartType: "bar",
          series: [
            { name: "Jan", value: 330000, value2: 310000 },
            { name: "Feb", value: 345000, value2: 315000 },
          ]
        }
      }
    };
  }

  return {
    text: "I'm operating in offline mode. Advanced AI analysis is currently unavailable."
  };
};

const simulateInsightResponse = async (prompt: string): Promise<InsightData> => {
   await new Promise(resolve => setTimeout(resolve, 1500));
   return {
     title: "General Data Insight",
     explanation: ["Data indicates a positive trend.", "Expenses are stable."],
     prediction: "Growth projected for next quarter.",
     suggestions: ["Review contracts.", "Check utility usage.", "Survey tenants."]
   };
};
