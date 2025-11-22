
import { Message, UIPayload, InsightData, MappingField } from "../types";
import { APP_TOOLS, INSIGHT_SCHEMA } from "./agent/tools";
import { getSystemContext } from "./agent/context";
import { mcpService } from "./mcpService";

const GITHUB_TOKEN = "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";
const MODEL_NAME = "gpt-4o";
const API_ENDPOINT = "https://models.inference.ai.azure.com/chat/completions";

interface AIResponse {
  text: string;
  uiPayload?: UIPayload;
}

export { APP_TOOLS };

export const generateAIResponse = async (
  userMessage: string,
  history: Message[],
  userContext?: { path?: string }
): Promise<AIResponse> => {
  try {
    const messages = [
      {
        role: "system",
        content: getSystemContext(userContext)
      },
      ...history.slice(-10).map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      })),
      {
        role: "user",
        content: userMessage
      }
    ];

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GITHUB_TOKEN}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages,
        tools: APP_TOOLS,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    let uiPayload: UIPayload | undefined;

    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      switch (functionName) {
        case "create_chart":
          uiPayload = {
            type: "chart",
            data: args
          };
          break;
        case "navigate_to_page":
          const pathMap: any = {
            dashboard: "/",
            financial: "/financial",
            "ask-aot": "/ask-aot"
          };
          uiPayload = {
            type: "navigate",
            data: { path: pathMap[args.page] || "/" }
          };
          break;
        case "request_approval":
          uiPayload = {
            type: "approval",
            data: args,
            status: "pending"
          };
          break;
        case "generate_report":
          uiPayload = {
            type: "report",
            data: {
              id: Date.now().toString(),
              title: args.title,
              type: args.type,
              period: args.period,
              summary: "Report generated based on your request.",
              keyMetrics: [
                { label: "Total Revenue", value: "$385K", trend: "up" },
                { label: "Occupancy", value: "94.5%", trend: "up" },
                { label: "Expenses", value: "$120K", trend: "neutral" }
              ],
              generatedAt: new Date().toISOString()
            }
          };
          break;
      }
    }

    return {
      text: choice.message.content || "I've completed that action.",
      uiPayload
    };
  } catch (error) {
    console.error("Error calling AI API:", error);
    return {
      text: "I'm sorry, I encountered an error. Please try again."
    };
  }
};

export const generateInsight = async (prompt: string): Promise<InsightData> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GITHUB_TOKEN}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that provides insights. Return a JSON object with title, explanation (array of strings), prediction (string), and suggestions (array of strings)."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating insight:", error);
    return {
      title: "Analysis",
      explanation: ["Unable to generate insight at this time."],
      prediction: "Please try again later.",
      suggestions: []
    };
  }
};

export const analyzeDataMapping = async (headers: string[]): Promise<MappingField[]> => {
  const standardFields = [
    "property_name",
    "address",
    "city",
    "type",
    "value",
    "occupancy_rate",
    "monthly_rent"
  ];

  return headers.map((header, idx) => ({
    sourceField: header,
    targetField: standardFields[idx % standardFields.length],
    confidence: 0.85 + Math.random() * 0.15,
    sampleValue: `Sample ${idx + 1}`
  }));
};
