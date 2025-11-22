export const APP_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_chart",
      description: "Create a data visualization chart",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          chartType: { type: "string", enum: ["bar", "area", "pie"] },
          data: { type: "array" }
        },
        required: ["title", "chartType", "data"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "navigate_to_page",
      description: "Navigate to a different page in the application",
      parameters: {
        type: "object",
        properties: {
          page: { type: "string", enum: ["dashboard", "financial", "ask-aot"] }
        },
        required: ["page"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "request_approval",
      description: "Request approval for an action",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          cost: { type: "number" },
          property: { type: "string" },
          justification: { type: "string" }
        },
        required: ["title", "cost", "property", "justification"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_report",
      description: "Generate a detailed report",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: { type: "string", enum: ["Financial", "Operational", "Market", "Compliance"] },
          period: { type: "string" }
        },
        required: ["title", "type", "period"]
      }
    }
  }
];

export const INSIGHT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    explanation: { type: "array", items: { type: "string" } },
    prediction: { type: "string" },
    suggestions: { type: "array", items: { type: "string" } }
  },
  required: ["title", "explanation", "prediction", "suggestions"]
};
