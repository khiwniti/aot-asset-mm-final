
// Standard JSON Schema Types
export const Type = {
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  OBJECT: 'object'
};

// --- Tool Definitions ---

export const APP_TOOLS = [
  {
    type: "function",
    function: {
      name: "navigate",
      description: "Navigate to a specific page in the application.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING, description: "The route path (e.g., /properties, /financial)" }
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
    }
  },
  {
    type: "function",
    function: {
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
    }
  },
  {
    type: "function",
    function: {
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
    }
  },
  {
    type: "function",
    function: {
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
  }
];

export const INSIGHT_SCHEMA = {
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