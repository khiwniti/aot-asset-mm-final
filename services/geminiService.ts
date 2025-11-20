

import { GoogleGenAI, Type } from "@google/genai";
import { Message, UIPayload, InsightData, MappingField } from "../types";
import { PROPERTIES, REVENUE_DATA, ALERTS, WORK_ORDERS } from "./mockData";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

interface AIResponse {
  text: string;
  uiPayload?: UIPayload;
}

// --- Tool Definitions (Agent Constitution: Tool-Based Architecture) ---

export const APP_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "navigate",
        description: "Navigate to a specific page in the application.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            path: { type: Type.STRING, description: "The route path (e.g., /properties, /financial)" }
          },
          required: ["path"]
        }
      },
      {
        name: "render_chart",
        description: "Display a chart to visualize data.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            chartType: { type: Type.STRING, enum: ["bar", "pie", "area"] },
            series: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  value2: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ["title", "chartType", "series"]
        }
      },
      {
        name: "show_alerts",
        description: "Display a list of alerts or risks.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["critical", "warning", "info"] },
                  location: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          },
          required: ["items"]
        }
      },
      {
        name: "request_approval",
        description: "Request user approval for a maintenance or financial action.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            property: { type: Type.STRING },
            cost: { type: Type.NUMBER },
            vendor: { type: Type.STRING },
            justification: { type: Type.STRING }
          },
          required: ["title", "property", "cost", "vendor", "justification"]
        }
      },
      {
        name: "generate_report",
        description: "Generate a structured report (Financial, Operational, Market) with key metrics.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["Financial", "Operational", "Market", "Compliance"] },
            period: { type: Type.STRING, description: "e.g., November 2024, Q3 2024" },
            summary: { type: Type.STRING, description: "A concise executive summary of the report." },
            keyMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ["up", "down", "neutral"] }
                }
              }
            }
          },
          required: ["title", "type", "period", "summary", "keyMetrics"]
        }
      }
    ]
  }
];

const INSIGHT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A concise, catchy title for the insight" },
    explanation: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "2-3 bullet points explaining the data trend or issue" 
    },
    prediction: { type: Type.STRING, description: "A forward-looking prediction based on the data" },
    suggestions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "3 actionable suggestions for the user" 
    },
  },
  required: ['title', 'explanation', 'prediction', 'suggestions'],
};

// --- Context Helpers ---

const getSystemContext = (path: string): string => {
  const baseContext = `You are AOT Assistant, an expert Real Estate Asset Management Agent.
  You help the Asset Manager optimize revenue, reduce risk, and manage operations.
  
  Current Page: ${path}
  
  System Capabilities:
  - You can navigate the app using the 'navigate' tool.
  - You can visualize data using 'render_chart'.
  - You can show alerts using 'show_alerts'.
  - You can request approvals using 'request_approval'.
  - You can generate reports using 'generate_report'.
  
  Routing Knowledge:
  - Dashboard: /
  - Portfolio: /properties
  - Financial: /financial
  - Leasing: /leasing
  - Maintenance: /maintenance
  - Reports: /reports
  `;

  let dataContext = "";
  
  if (path === '/' || path.includes('dashboard')) {
    dataContext = `
      Key Metrics: 
      - Total Value: $102M
      - Occupancy: 76%
      - Revenue Trend: Rising, peak $3.5M in Dec.
      - Critical Alerts: ${ALERTS.filter(a => a.severity === 'critical').length} active.
    `;
  } else if (path.includes('properties')) {
    dataContext = `
      Properties: ${PROPERTIES.map(p => `${p.name} (${p.type}, ${p.status})`).join(', ')}.
    `;
  } else if (path.includes('financial')) {
    dataContext = `
      Financials:
      - Total Revenue: $2.4M
      - Expenses: $980K
      - Net Income: $1.42M
    `;
  } else if (path.includes('maintenance')) {
    dataContext = `
      Work Orders:
      - Open: 12
      - High Priority: ${WORK_ORDERS.filter(w => w.priority === 'High').map(w => w.title).join(', ')}.
    `;
  } else if (path.includes('reports')) {
    dataContext = `
      You are in the Reports center. You can help the user generate custom reports based on portfolio data.
    `;
  }

  return `${baseContext}\n${dataContext}\n
  RESPONSE GUIDELINES:
  1. Use tools whenever possible to provide a rich UI experience.
  2. Be concise and professional.
  `;
};

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
    const systemInstruction = getSystemContext(currentPath);

    const contents = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: APP_TOOLS, // Agent Constitution: Tool-Based Architecture
        temperature: 0.7,
      }
    });

    const candidate = response.candidates?.[0];
    let text = candidate?.content?.parts?.map(p => p.text).join('') || "";
    let uiPayload: UIPayload | undefined;

    // 2. Handle Tool Calls (Generative UI)
    const functionCalls = candidate?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0]; // Handle primary tool call
      if (call && call.name) {
         // Map tools to UIPayload
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
         
         // Add a text fallback if model didn't generate text
         if (!text) {
             text = `I've generated the ${call.name.replace(/_/g, ' ')} you requested.`;
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
         responseSchema: INSIGHT_SCHEMA,
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