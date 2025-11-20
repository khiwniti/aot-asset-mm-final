import { Message, UIPayload, InsightData, MappingField, Workflow, Task, Lease, MaintenanceRequest } from '../types';
import { APP_TOOLS, INSIGHT_SCHEMA } from './agent/tools';
import { getSystemContext } from './agent/context';
import { mcpService } from './mcpService';
import { WORKFLOWS, TASKS, LEASES, MAINTENANCE_REQUESTS } from './mockData';

interface AIResponse {
  text: string;
  uiPayload?: UIPayload;
}

// For now, we'll use a mock implementation since the agent processes voice
// For text-only chat, you can integrate with your preferred LLM API directly
// or send messages through the LiveKit agent via data channel

export { APP_TOOLS };

/**
 * Enhanced implementation for text-based chat with entity management support
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
    // This is a simplified fallback for text-based chat with entity management
    await new Promise(resolve => setTimeout(resolve, 500));

    const lowerMsg = userMessage.toLowerCase();

    // Entity Management Commands - Workflows
    if (lowerMsg.includes('workflow') && (lowerMsg.includes('create') || lowerMsg.includes('show'))) {
      if (lowerMsg.includes('show') || lowerMsg.includes('list') || lowerMsg.includes('manage')) {
        return {
          text: 'Here is your workflow status manager with all current workflows.',
          uiPayload: {
            type: 'workflow_status_manager',
            data: {
              workflows: WORKFLOWS,
              availableStatuses: ['draft', 'active', 'paused', 'completed', 'archived'],
              dragAndDropEnabled: true
            }
          }
        };
      }
    }

    // Entity Management Commands - Tasks
    if (lowerMsg.includes('task') && (lowerMsg.includes('create') || lowerMsg.includes('show') || lowerMsg.includes('board'))) {
      if (lowerMsg.includes('show') || lowerMsg.includes('board') || lowerMsg.includes('kanban')) {
        const columns = [
          { id: 'todo', title: 'To Do', taskIds: TASKS.filter(t => t.status === 'todo').map(t => t.id) },
          { id: 'in_progress', title: 'In Progress', taskIds: TASKS.filter(t => t.status === 'in_progress').map(t => t.id) },
          { id: 'blocked', title: 'Blocked', taskIds: TASKS.filter(t => t.status === 'blocked').map(t => t.id) },
          { id: 'completed', title: 'Completed', taskIds: TASKS.filter(t => t.status === 'completed').map(t => t.id) }
        ];
        
        return {
          text: 'Here is your Kanban task board with all current tasks.',
          uiPayload: {
            type: 'task_board',
            data: {
              tasks: TASKS,
              columns,
              allowBulkOperations: true
            }
          }
        };
      }
    }

    // Entity Management Commands - Leases
    if (lowerMsg.includes('lease') && (lowerMsg.includes('create') || lowerMsg.includes('show') || lowerMsg.includes('manage'))) {
      if (lowerMsg.includes('show') || lowerMsg.includes('manage') || lowerMsg.includes('expiring')) {
        const showExpiringOnly = lowerMsg.includes('expiring');
        const leasesToShow = showExpiringOnly ? LEASES.filter(l => l.status === 'expiring') : LEASES;
        
        return {
          text: `Here is your lease manager${showExpiringOnly ? ' showing only expiring leases' : ''}.`,
          uiPayload: {
            type: 'lease_manager',
            data: {
              leases: leasesToShow,
              expiringThreshold: 60,
              showRenewalAlerts: true
            }
          }
        };
      }
    }

    // Entity Management Commands - Maintenance
    if (lowerMsg.includes('maintenance') && (lowerMsg.includes('create') || lowerMsg.includes('show') || lowerMsg.includes('tracker'))) {
      if (lowerMsg.includes('show') || lowerMsg.includes('tracker')) {
        return {
          text: 'Here is your maintenance request tracker.',
          uiPayload: {
            type: 'maintenance_tracker',
            data: {
              requests: MAINTENANCE_REQUESTS,
              sortBy: 'priority',
              showCostOverrunAlerts: true
            }
          }
        };
      }
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
      workflows: '/workflows',
      tasks: '/tasks',
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

    // Default response with entity management suggestions
    return {
      text: 'I can help you manage workflows, tasks, leases, and maintenance requests. Try asking me to "show workflows", "show task board", "show lease manager", or "show maintenance tracker". For advanced AI features, use voice mode with LiveKit Agent.',
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
