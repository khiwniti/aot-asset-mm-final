
import { Type } from "@google/genai";

// --- Tool Definitions ---

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
      },
      // --- Entity Management Tools ---
      {
        name: "create_workflow",
        description: "Create a new workflow with specified parameters.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Workflow title" },
            description: { type: Type.STRING, description: "Detailed description of the workflow" },
            assignee: { type: Type.STRING, description: "Person assigned to the workflow" },
            dueDate: { type: Type.STRING, description: "Due date in YYYY-MM-DD format (optional)" },
            priority: { type: Type.STRING, enum: ["low", "medium", "high", "critical"], description: "Priority level" },
            propertyId: { type: Type.STRING, description: "Associated property ID (optional)" },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Tags for categorization"
            }
          },
          required: ["title", "description", "assignee", "priority"]
        }
      },
      {
        name: "create_task",
        description: "Create a new task with specified parameters.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Task title" },
            description: { type: Type.STRING, description: "Detailed description of the task" },
            assignee: { type: Type.STRING, description: "Person assigned to the task" },
            dueDate: { type: Type.STRING, description: "Due date in YYYY-MM-DD format (optional)" },
            priority: { type: Type.STRING, enum: ["low", "medium", "high", "critical"], description: "Priority level" },
            parentWorkflowId: { type: Type.STRING, description: "Parent workflow ID (optional)" },
            estimatedHours: { type: Type.NUMBER, description: "Estimated hours to complete (optional)" },
            propertyId: { type: Type.STRING, description: "Associated property ID (optional)" },
            dependencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of task IDs this task depends on"
            }
          },
          required: ["title", "description", "assignee", "priority"]
        }
      },
      {
        name: "create_lease",
        description: "Create a new lease agreement.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            propertyName: { type: Type.STRING, description: "Property name or address" },
            propertyId: { type: Type.STRING, description: "Property unique identifier" },
            tenant: { type: Type.STRING, description: "Tenant name" },
            tenantId: { type: Type.STRING, description: "Tenant unique identifier" },
            startDate: { type: Type.STRING, description: "Lease start date in YYYY-MM-DD format" },
            endDate: { type: Type.STRING, description: "Lease end date in YYYY-MM-DD format" },
            rent: { type: Type.NUMBER, description: "Monthly rent amount" },
            securityDeposit: { type: Type.NUMBER, description: "Security deposit amount" },
            status: { type: Type.STRING, enum: ["draft", "active", "expiring", "expired", "renewed"], description: "Lease status" }
          },
          required: ["propertyName", "propertyId", "tenant", "tenantId", "startDate", "endDate", "rent", "securityDeposit"]
        }
      },
      {
        name: "create_maintenance_request",
        description: "Create a new maintenance request.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            propertyId: { type: Type.STRING, description: "Property ID where maintenance is needed" },
            description: { type: Type.STRING, description: "Description of the maintenance issue" },
            category: { type: Type.STRING, description: "Category of maintenance (e.g., HVAC, Plumbing, Electrical)" },
            priority: { type: Type.STRING, enum: ["low", "medium", "high", "urgent"], description: "Priority level" },
            costEstimate: { type: Type.NUMBER, description: "Estimated cost for the repair (optional)" },
            scheduledDate: { type: Type.STRING, description: "Scheduled date for maintenance in YYYY-MM-DD format (optional)" },
            vendor: { type: Type.STRING, description: "Preferred vendor (optional)" },
            notes: { type: Type.STRING, description: "Additional notes (optional)" }
          },
          required: ["propertyId", "description", "category", "priority"]
        }
      },
      {
        name: "update_entity_status",
        description: "Update the status of a workflow, task, lease, or maintenance request.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            entityType: { type: Type.STRING, enum: ["workflow", "task", "lease", "maintenance"], description: "Type of entity" },
            entityId: { type: Type.STRING, description: "ID of the entity to update" },
            newStatus: { type: Type.STRING, description: "New status value" }
          },
          required: ["entityType", "entityId", "newStatus"]
        }
      },
      {
        name: "list_entities",
        description: "List entities of a specific type with optional filtering.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            entityType: { type: Type.STRING, enum: ["workflow", "task", "lease", "maintenance"], description: "Type of entity to list" },
            status: { type: Type.STRING, description: "Filter by status (optional)" },
            assignee: { type: Type.STRING, description: "Filter by assignee (optional)" },
            priority: { type: Type.STRING, description: "Filter by priority (optional)" },
            propertyId: { type: Type.STRING, description: "Filter by property ID (optional)" }
          },
          required: ["entityType"]
        }
      },
      {
        name: "initiate_lease_renewal",
        description: "Initiate the renewal process for an expiring lease.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            leaseId: { type: Type.STRING, description: "ID of the lease to renew" },
            renewalTerms: { type: Type.STRING, description: "Proposed renewal terms (optional)" }
          },
          required: ["leaseId"]
        }
      },
      {
        name: "render_entity_manager",
        description: "Display an interactive entity management interface.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            entityType: { type: Type.STRING, enum: ["workflow", "task", "lease", "maintenance"], description: "Type of entity to manage" },
            view: { type: Type.STRING, enum: ["board", "list", "kanban"], description: "Type of view to display" },
            filters: {
              type: Type.OBJECT,
              description: "Filters to apply to the view",
              properties: {
                status: { type: Type.STRING },
                assignee: { type: Type.STRING },
                priority: { type: Type.STRING },
                propertyId: { type: Type.STRING }
              }
            }
          },
          required: ["entityType", "view"]
        }
      }
    ]
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
