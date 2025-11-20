import { Message, UIPayload, InsightData, MappingField } from '../types';
import { APP_TOOLS, INSIGHT_SCHEMA } from './agent/tools';
import { getSystemContext } from './agent/context';
import { mcpService } from './mcpService';

interface AIResponse {
  text: string;
  uiPayload?: UIPayload;
}

// For now, we'll use a mock implementation since the agent processes voice
// For text-only chat, you can integrate with your preferred LLM API directly
// or send messages through the LiveKit agent via data channel

export { APP_TOOLS };

/**
 * Mock implementation for text-based chat when not using voice
 * In production, integrate with your LLM provider (OpenAI, Anthropic, etc.)
 */
export const generateAIResponse = async (
  userMessage: string,
  history: Message[],
  context?: { path: string }
): Promise<AIResponse> => {
  try {
    const currentPath = context?.path || '/';

    // Get Dynamic MCP Tools
    const mcpToolsRaw = await mcpService.discoverTools();
    const systemInstruction = getSystemContext(currentPath);

    // For LiveKit integration, the agent handles LLM calls
    // This is a simplified fallback for text-based chat
    await new Promise(resolve => setTimeout(resolve, 500));

    const lowerMsg = userMessage.toLowerCase();

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
            summary:
              'Overall portfolio performance remains strong with a 5.2% increase in revenue. Occupancy rates have stabilized at 76%, though maintenance costs saw a slight uptick.',
            keyMetrics: [
              { label: 'Revenue', value: '$2.4M', trend: 'up' },
              { label: 'NOI', value: '$1.42M', trend: 'up' },
              { label: 'Expenses', value: '$980K', trend: 'down' },
            ],
            generatedAt: new Date().toISOString(),
          },
        },
      };
    }

    // Navigation
    const PAGE_ROUTES: Record<string, string> = {
      dashboard: '/',
      portfolio: '/properties',
      financial: '/financial',
      leasing: '/leasing',
      maintenance: '/maintenance',
      reports: '/reports',
    };

    const navIntent = Object.keys(PAGE_ROUTES).find(
      page => lowerMsg.includes(page) && lowerMsg.includes('go to')
    );

    if (navIntent) {
      return {
        text: `Navigating to ${navIntent}...`,
        uiPayload: { type: 'navigate', data: { path: PAGE_ROUTES[navIntent] } },
      };
    }

    // Chart
    if (lowerMsg.includes('revenue') || lowerMsg.includes('trend')) {
      return {
        text: 'Here is the projected revenue growth.',
        uiPayload: {
          type: 'chart',
          data: {
            title: 'Revenue Projection',
            chartType: 'bar',
            series: [
              { name: 'Jan', value: 330000, value2: 310000 },
              { name: 'Feb', value: 345000, value2: 315000 },
            ],
          },
        },
      };
    }

    return {
      text: 'Text-based chat is available. For advanced AI features, use voice mode with LiveKit Agent.',
    };
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    return {
      text: 'I encountered an error processing your request.',
    };
  }
};

export const generateInsight = async (prompt: string): Promise<InsightData> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    title: 'General Data Insight',
    explanation: ['Data indicates a positive trend.', 'Expenses are stable.'],
    prediction: 'Growth projected for next quarter.',
    suggestions: ['Review contracts.', 'Check utility usage.', 'Survey tenants.'],
  };
};

export const analyzeDataMapping = async (
  headers: string[],
  fileName: string
): Promise<MappingField[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  return headers.map(header => {
    const h = header.toLowerCase();
    if (h.includes('name') || h.includes('property'))
      return {
        sourceField: header,
        targetField: 'property_name',
        confidence: 95,
        sampleValue: 'Suvarnabhumi Res.',
      };
    if (h.includes('addr') || h.includes('location'))
      return {
        sourceField: header,
        targetField: 'address',
        confidence: 90,
        sampleValue: '612/21 King Kaew',
      };
    if (h.includes('rent') || h.includes('price'))
      return {
        sourceField: header,
        targetField: 'monthly_rent',
        confidence: 85,
        sampleValue: '12000',
      };
    if (h.includes('status'))
      return {
        sourceField: header,
        targetField: 'status',
        confidence: 92,
        sampleValue: 'Active',
      };
    if (h.includes('occupancy'))
      return {
        sourceField: header,
        targetField: 'occupancy',
        confidence: 88,
        sampleValue: '95%',
      };

    if (h.includes('legacy') || h.includes('code'))
      return {
        sourceField: header,
        targetField: 'id',
        confidence: 40,
        sampleValue: 'LEG-001',
        issue: 'Format mismatch potential',
      };

    return {
      sourceField: header,
      targetField: 'unmapped',
      confidence: 0,
      sampleValue: '---',
      issue: 'No matching field found',
    };
  });
};
