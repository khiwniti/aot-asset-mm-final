
// Entity Management Tools for LiveKit Agent
// Note: We no longer use @google/genai types, using plain JSON schema instead

// --- Tool Definitions ---

export const APP_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "navigate",
        description: "Navigate to a specific page in the application.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "The route path (e.g., /properties, /financial)" }
          },
          required: ["path"]
        }
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      // Entity Management Tools
      {
        name: "create_workflow",
        description: "Create a new workflow for coordinated work processes.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Workflow title" },
            description: { type: "string", description: "Detailed description of the workflow" },
            assignee: { type: "string", description: "Person assigned to the workflow" },
            dueDate: { type: "string", description: "Due date in ISO format" },
            priority: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Priority level" },
            propertyId: { type: "string", description: "Optional property ID if related to a property" }
          },
          required: ["title", "assignee"]
        }
      },
      {
        name: "update_workflow_status",
        description: "Update the status of a workflow.",
        parameters: {
          type: "object",
          properties: {
            workflowId: { type: "string", description: "Workflow ID to update" },
            newStatus: { type: "string", enum: ["draft", "active", "paused", "completed", "archived"], description: "New status" }
          },
          required: ["workflowId", "newStatus"]
        }
      },
      {
        name: "create_task",
        description: "Create a new task, optionally linked to a workflow.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Task title" },
            description: { type: "string", description: "Task description" },
            assignee: { type: "string", description: "Person assigned to the task" },
            dueDate: { type: "string", description: "Due date in ISO format" },
            priority: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Priority level" },
            parentWorkflowId: { type: "string", description: "Optional parent workflow ID" },
            estimatedHours: { type: "number", description: "Estimated hours to complete" }
          },
          required: ["title", "assignee"]
        }
      },
      {
        name: "update_task_status",
        description: "Update the status of a task.",
        parameters: {
          type: "object",
          properties: {
            taskId: { type: "string", description: "Task ID to update" },
            newStatus: { type: "string", enum: ["todo", "in_progress", "blocked", "completed"], description: "New status" },
            blockerReason: { type: "string", description: "Reason if status is blocked" }
          },
          required: ["taskId", "newStatus"]
        }
      },
      {
        name: "create_lease",
        description: "Create a new lease agreement.",
        parameters: {
          type: "object",
          properties: {
            propertyId: { type: "string", description: "Property ID" },
            tenantName: { type: "string", description: "Tenant name" },
            startDate: { type: "string", description: "Start date in ISO format" },
            endDate: { type: "string", description: "End date in ISO format" },
            rent: { type: "number", description: "Monthly rent amount" },
            securityDeposit: { type: "number", description: "Security deposit amount" }
          },
          required: ["propertyId", "tenantName", "startDate", "endDate", "rent"]
        }
      },
      {
        name: "update_lease_status",
        description: "Update the status of a lease.",
        parameters: {
          type: "object",
          properties: {
            leaseId: { type: "string", description: "Lease ID to update" },
            newStatus: { type: "string", enum: ["draft", "active", "expiring", "expired", "renewed"], description: "New status" }
          },
          required: ["leaseId", "newStatus"]
        }
      },
      {
        name: "create_maintenance_request",
        description: "Create a new maintenance request.",
        parameters: {
          type: "object",
          properties: {
            propertyId: { type: "string", description: "Property ID" },
            description: { type: "string", description: "Description of the maintenance issue" },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"], description: "Priority level" },
            costEstimate: { type: "number", description: "Estimated cost for the repair" },
            category: { type: "string", description: "Category of maintenance (e.g., HVAC, Plumbing)" }
          },
          required: ["propertyId", "description", "priority"]
        }
      },
      {
        name: "update_maintenance_status",
        description: "Update the status of a maintenance request.",
        parameters: {
          type: "object",
          properties: {
            requestId: { type: "string", description: "Maintenance request ID" },
            newStatus: { type: "string", enum: ["submitted", "assigned", "in_progress", "completed", "cancelled"], description: "New status" },
            actualCost: { type: "number", description: "Actual cost when completed" }
          },
          required: ["requestId", "newStatus"]
        }
      },
      {
        name: "show_workflow_manager",
        description: "Display the interactive workflow status manager.",
        parameters: {
          type: "object",
          properties: {
            filterStatus: { type: "string", description: "Optional filter by status" },
            assignee: { type: "string", description: "Optional filter by assignee" }
          }
        }
      },
      {
        name: "show_lease_manager",
        description: "Display the lease management interface.",
        parameters: {
          type: "object",
          properties: {
            showExpiringOnly: { type: "boolean", description: "Show only leases expiring within 60 days" },
            propertyId: { type: "string", description: "Optional filter by property ID" }
          }
        }
      },
      {
        name: "show_task_board",
        description: "Display the Kanban-style task board.",
        parameters: {
          type: "object",
          properties: {
            workflowId: { type: "string", description: "Optional filter by workflow ID" },
            assignee: { type: "string", description: "Optional filter by assignee" }
          }
        }
      },
      {
        name: "show_maintenance_tracker",
        description: "Display the maintenance request tracker.",
        parameters: {
          type: "object",
          properties: {
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"], description: "Optional filter by priority" },
            propertyId: { type: "string", description: "Optional filter by property ID" }
          }
        }
      }
    ]
  }
];

export const INSIGHT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "A concise, catchy title for the insight" },
    explanation: { 
      type: "array", 
      items: { type: "string" }, 
      description: "2-3 bullet points explaining the data trend or issue" 
    },
    prediction: { type: "string", description: "A forward-looking prediction based on the data" },
    suggestions: { 
      type: "array", 
      items: { type: "string" }, 
      description: "3 actionable suggestions for the user" 
    },
  },
  required: ['title', 'explanation', 'prediction', 'suggestions'],
};
