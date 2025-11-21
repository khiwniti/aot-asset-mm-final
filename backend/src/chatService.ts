import { ChatMessage, ChatRequest, ChatResponse } from "./types.js";

interface ConversationStore {
  [key: string]: ChatMessage[];
}

// In-memory store for conversations (use Redis in production)
const conversationStore: ConversationStore = {};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const SYSTEM_PROMPT = `You are AOT Assistant, an AI expert in real estate asset management with advanced entity management capabilities.

Your characteristics:
- Helpful, concise, and knowledgeable about property management
- Bilingual capabilities (English and Thai)
- Focus on practical advice for portfolio optimization
- Provide specific insights on financial analysis and maintenance

Response guidelines:
- Keep responses under 150 words for real-time interaction
- Use clear, professional language
- Include actionable recommendations`;

/**
 * Process chat message through OpenAI API
 */
export async function processChat(req: ChatRequest): Promise<ChatResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key not configured. Set OPENAI_API_KEY environment variable."
    );
  }

  const conversationId = `${req.roomName}-${req.identity}`;
  const history = conversationStore[conversationId] || [];

  // Build messages array for API
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: req.message },
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as Record<string, unknown>;
      const errorMessage = (error?.error as Record<string, unknown>)?.message || "Unknown error";
      throw new Error(
        `OpenAI API error: ${errorMessage}`
      );
    }

    const data = await response.json() as {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    };
    const assistantMessage =
      data.choices?.[0]?.message?.content || "No response generated";

    // Store conversation history
    history.push({ role: "user", content: req.message });
    history.push({ role: "assistant", content: assistantMessage });

    // Keep only last 20 messages to avoid memory bloat
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    conversationStore[conversationId] = history;

    return {
      response: assistantMessage,
      timestamp: Date.now(),
      role: "assistant",
    };
  } catch (error) {
    console.error("Chat service error:", error);
    throw error;
  }
}

/**
 * Clear conversation history for a session
 */
export function clearConversation(roomName: string, identity: string): void {
  const conversationId = `${roomName}-${identity}`;
  delete conversationStore[conversationId];
}

/**
 * Get conversation history
 */
export function getConversationHistory(
  roomName: string,
  identity: string
): ChatMessage[] {
  const conversationId = `${roomName}-${identity}`;
  return conversationStore[conversationId] || [];
}

/**
 * Add message to conversation history
 */
export function addToHistory(
  roomName: string,
  identity: string,
  message: ChatMessage
): void {
  const conversationId = `${roomName}-${identity}`;
  if (!conversationStore[conversationId]) {
    conversationStore[conversationId] = [];
  }
  conversationStore[conversationId].push(message);

  // Keep only last 50 messages
  if (conversationStore[conversationId].length > 50) {
    conversationStore[conversationId].splice(
      0,
      conversationStore[conversationId].length - 50
    );
  }
}
