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

    // Entity Management Commands
    if (lowerMsg.includes('create workflow') || lowerMsg.includes('new workflow')) {
      // Extract workflow details from natural language
      const titleMatch = userMessage.match(/(?:create|new) workflow[:\s]+(.+?)(?:for|assign|due)/i);
      const assigneeMatch = userMessage.match(/assign(?:ed)?\s+to\s+([^\s,]+)/i);
      const dueDateMatch = userMessage.match(/due\s+(?:by|on)?\s+([^\s,]+)/i);
      const priorityMatch = userMessage.match(/priority[:\s]+(\w+)/i);

      if (titleMatch) {
        return {
          text: `I'll create a workflow for "${titleMatch[1].trim()}" with the specified details.`,
          uiPayload: {
            type: 'entity_manager',
            data: {
              entityType: 'workflow',
              action: 'create',
              initialData: {
                title: titleMatch[1].trim(),
                assignee: assigneeMatch ? assigneeMatch[1] : 'Unassigned',
                dueDate: dueDateMatch ? dueDateMatch[1] : '',
                priority: priorityMatch ? priorityMatch[1].toLowerCase() : 'medium'
              }
            }
          }
        };
      }
    }

    if (lowerMsg.includes('create task') || lowerMsg.includes('new task')) {
      const titleMatch = userMessage.match(/(?:create|new) task[:\s]+(.+?)(?:for|assign|due)/i);
      const assigneeMatch = userMessage.match(/assign(?:ed)?\s+to\s+([^\s,]+)/i);
      const dueDateMatch = userMessage.match(/due\s+(?:by|on)?\s+([^\s,]+)/i);

      if (titleMatch) {
        return {
          text: `I'll create a task for "${titleMatch[1].trim()}" with the specified details.`,
          uiPayload: {
            type: 'entity_manager',
            data: {
              entityType: 'task',
              action: 'create',
              initialData: {
                title: titleMatch[1].trim(),
                assignee: assigneeMatch ? assigneeMatch[1] : 'Unassigned',
                dueDate: dueDateMatch ? dueDateMatch[1] : ''
              }
            }
          }
        };
      }
    }

    if (lowerMsg.includes('create maintenance') || lowerMsg.includes('new maintenance')) {
      const descMatch = userMessage.match(/(?:create|new) maintenance[:\s]+(.+?)(?:for|at|priority)/i);
      const propertyMatch = userMessage.match(/(?:for|at)\s+([^\s,]+)/i);
      const priorityMatch = userMessage.match(/priority[:\s]+(\w+)/i);

      if (descMatch) {
        return {
          text: `I'll create a maintenance request for "${descMatch[1].trim()}" with the specified details.`,
          uiPayload: {
            type: 'entity_manager',
            data: {
              entityType: 'maintenance',
              action: 'create',
              initialData: {
                description: descMatch[1].trim(),
                propertyId: propertyMatch ? propertyMatch[1] : 'Unknown',
                priority: priorityMatch ? priorityMatch[1].toLowerCase() : 'medium'
              }
            }
          }
        };
      }
    }

    // List/Query Commands
    if (lowerMsg.includes('show') || lowerMsg.includes('list')) {
      if (lowerMsg.includes('workflow')) {
        return {
          text: "Here are your current workflows:",
          uiPayload: {
            type: 'entity_manager',
            data: {
              entityType: 'workflow',
              action: 'list',
              view: 'kanban'
            }
          }
        };
      }

      if (lowerMsg.includes('task')) {
        return {
          text: "Here are your current tasks:",
          uiPayload: {
            type: 'entity_manager',
            data: {
              entityType: 'task',
              action: 'list',
              view: 'kanban'
            }
          }
        };
      }

      if (lowerMsg.includes('lease')) {
        return {
          text: "Here are your current leases:",
          uiPayload: {
            type: 'entity_manager',
            data: {
              entityType: 'lease',
              action: 'list',
              view: 'list'
            }
          }
        };
      }

      if (lowerMsg.includes('maintenance')) {
        return {
          text: "Here are your current maintenance requests:",
          uiPayload: {
            type: 'entity_manager',
            data: {
              entityType: 'maintenance',
              action: 'list',
              view: 'list'
            }
          }
        };
      }
    }

    // Status update commands
    if (lowerMsg.includes('mark') || lowerMsg.includes('update') || lowerMsg.includes('complete')) {
      if (lowerMsg.includes('workflow') && lowerMsg.includes('complete')) {
        return {
          text: "I'll help you mark the workflow as completed. Please select which workflow to complete.",
          uiPayload: {
            type: 'entity_manager',
            data: {
              entityType: 'workflow',
              action: 'status_update',
              newStatus: 'completed'
            }
          }
        };
      }

      if (lowerMsg.includes('task') && lowerMsg.includes('complete')) {
        return {
          text: "I'll help you mark the task as completed. Please select which task to complete.",
          uiPayload: {
            type: 'entity_manager',
            data: {
              entityType: 'task',
              action: 'status_update',
              newStatus: 'completed'
            }
          }
        };
      }
    }

    // Lease-specific commands
    if (lowerMsg.includes('expiring') && lowerMsg.includes('lease')) {
      return {
        text: "Here are leases expiring in the next 60 days:",
        uiPayload: {
          type: 'entity_manager',
          data: {
            entityType: 'lease',
            action: 'list',
            filters: { expiring: true },
            view: 'list'
          }
        }
      };
    }

    if (lowerMsg.includes('renew') && lowerMsg.includes('lease')) {
      return {
        text: "I'll help you initiate a lease renewal. Please select which lease to renew.",
        uiPayload: {
          type: 'entity_manager',
          data: {
            entityType: 'lease',
            action: 'renewal'
          }
        }
      };
    }

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
      text: 'I can help you manage workflows, tasks, leases, and maintenance requests. Try commands like:\n• "Create workflow for Q1 budget review"\n• "Show all tasks assigned to me"\n• "List expiring leases"\n• "Create urgent maintenance request for broken HVAC"',
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
