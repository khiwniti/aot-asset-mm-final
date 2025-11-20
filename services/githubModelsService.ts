import { Message, UIPayload, InsightData } from "../types";
import { PROPERTIES, REVENUE_DATA, ALERTS, WORK_ORDERS } from "./mockData";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "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";
const GITHUB_API_URL = "https://models.inference.ai.azure.com";

interface AIResponse {
  text: string;
  uiPayload?: UIPayload;
}

// --- Tool Definitions (Agent Constitution: Tool-Based Architecture) ---

export const APP_TOOLS = [
  {
    type: "function",
    function: {
      name: "navigate",
      description: "Navigate to a specific page in the application.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "The route path (e.g., /properties, /financial)" }
        },
        required: ["path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_chart",
      description: "Display a chart to visualize data.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          chartType: { type: "string", enum: ["bar", "pie", "area"] },
          series: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                value: { type: "number" },
                value2: { type: "number" }
              }
            }
          }
        },
        required: ["title", "chartType", "series"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "show_alerts",
      description: "Display a list of alerts or risks.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                severity: { type: "string", enum: ["critical", "warning", "info"] },
                location: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        },
        required: ["items"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "request_approval",
      description: "Request user approval for a maintenance or financial action.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          property: { type: "string" },
          cost: { type: "number" },
          vendor: { type: "string" },
          justification: { type: "string" }
        },
        required: ["title", "property", "cost", "vendor", "justification"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_report",
      description: "Generate a structured report (Financial, Operational, Market) with key metrics.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: { type: "string", enum: ["Financial", "Operational", "Market", "Compliance"] },
          period: { type: "string", description: "e.g., November 2024, Q3 2024" },
          summary: { type: "string", description: "A concise executive summary of the report." },
          keyMetrics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "string" },
                trend: { type: "string", enum: ["up", "down", "neutral"] }
              }
            }
          }
        },
        required: ["title", "type", "period", "summary", "keyMetrics"]
      }
    }
  }
];

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
  3. Respond with JSON format when tool calls are needed.
  4. If you need to use a tool, respond with a JSON object containing "tool_calls" array.
  `;
};

// --- API Functions ---

const callGitHubModel = async (messages: any[], model: string = "gpt-4o") => {
  const response = await fetch(`${GITHUB_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      tools: APP_TOOLS,
      tool_choice: "auto"
    })
  });

  if (!response.ok) {
    throw new Error(`GitHub Models API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const generateAIResponse = async (
  userMessage: string,
  history: Message[],
  context?: { path: string }
): Promise<AIResponse> => {
  try {
    const currentPath = context?.path || '/';
    const systemInstruction = getSystemContext(currentPath);

    const messages = [
      { role: "system", content: systemInstruction },
      ...history.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: "user", content: userMessage }
    ];

    const response = await callGitHubModel(messages, "gpt-4o");
    
    const message = response.choices?.[0]?.message;
    if (!message) {
      throw new Error("No message in response from GitHub Models");
    }

    let text = message.content || "";
    let uiPayload: UIPayload | undefined;

    // Handle Tool Calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      
      // Map tools to UIPayload
      if (toolCall.function.name === 'navigate') {
        uiPayload = { type: 'navigate', data: args };
      } else if (toolCall.function.name === 'render_chart') {
        uiPayload = { type: 'chart', data: args };
      } else if (toolCall.function.name === 'show_alerts') {
        uiPayload = { type: 'alert_list', data: args.items || [] };
      } else if (toolCall.function.name === 'request_approval') {
        uiPayload = { type: 'approval', status: 'pending', data: args };
      } else if (toolCall.function.name === 'generate_report') {
        uiPayload = { 
          type: 'report', 
          data: {
            ...args,
            id: `RPT-${Date.now().toString().slice(-6)}`,
            generatedAt: new Date().toISOString()
          }
        };
      }
      
      // Add a text fallback if model didn't generate text
      if (!text) {
        text = `I've executed the ${toolCall.function.name.replace(/_/g, ' ')} you requested.`;
      }
    }

    if (!text && !uiPayload) {
      throw new Error("Empty response from GitHub Models");
    }

    return { text, uiPayload };

  } catch (error) {
    console.error("GitHub Models Chat Error:", error);
    return simulateStructuredResponse(userMessage, context);
  }
};

export const generateInsight = async (prompt: string): Promise<InsightData> => {
  try {
    const messages = [
      {
        role: "system",
        content: `You are an expert real estate analyst. Analyze the following request and provide a strategic insight in JSON format with this schema:
        {
          "title": "A concise, catchy title for the insight",
          "explanation": ["2-3 bullet points explaining the data trend or issue"],
          "prediction": "A forward-looking prediction based on the data",
          "suggestions": ["3 actionable suggestions for the user"]
        }`
      },
      {
        role: "user",
        content: `Analyze the following request and provide a strategic insight: "${prompt}". 
        Context: Use general real estate asset management principles and assume a mixed portfolio.`
      }
    ];

    const response = await callGitHubModel(messages, "gpt-4o");
    
    const message = response.choices?.[0]?.message;
    if (!message?.content) {
      throw new Error("No content in insight response");
    }

    // Try to parse JSON response
    try {
      return JSON.parse(message.content);
    } catch (parseError) {
      // If parsing fails, create a structured response from the text
      return {
        title: "Strategic Insight",
        explanation: [message.content.substring(0, 100) + "..."],
        prediction: "Based on current trends, continued monitoring is recommended.",
        suggestions: ["Review current strategy", "Monitor key metrics", "Consider optimization opportunities"]
      };
    }

  } catch (error) {
    console.error("GitHub Models Insight Error:", error);
    return simulateInsightResponse(prompt);
  }
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