
import { PROPERTIES, ALERTS, WORK_ORDERS, WORKFLOWS, LEASES, TASKS, MAINTENANCE_REQUESTS } from "../mockData";

/**
 * Builds the system prompt based on the user's current location in the app
 * and the current state of the data (mocked for now).
 */
export const getSystemContext = (path: string): string => {
  const baseContext = `You are AOT Assistant, an expert Real Estate Asset Management Agent.
  You help the Asset Manager optimize revenue, reduce risk, and manage operations.
  
  Current Page: ${path}
  
  System Capabilities:
  - You can navigate the app using the 'navigate' tool.
  - You can visualize data using 'render_chart'.
  - You can show alerts using 'show_alerts'.
  - You can request approvals using 'request_approval'.
  - You can generate reports using 'generate_report'.
  
  Entity Management:
  - You can create and manage workflows using 'create_workflow', 'update_workflow_status', 'show_workflow_manager'.
  - You can create and manage tasks using 'create_task', 'update_task_status', 'show_task_board'.
  - You can create and manage leases using 'create_lease', 'update_lease_status', 'show_lease_manager'.
  - You can create and manage maintenance requests using 'create_maintenance_request', 'update_maintenance_status', 'show_maintenance_tracker'.
  
  Routing Knowledge:
  - Dashboard: /
  - Portfolio: /properties
  - Financial: /financial
  - Leasing: /leasing
  - Maintenance: /maintenance
  - Reports: /reports
  - Workflows: /workflows
  - Tasks: /tasks
  `;

  let dataContext = "";
  
  if (path === '/' || path.includes('dashboard')) {
    dataContext = `
      Key Metrics: 
      - Total Value: $102M
      - Occupancy: 76%
      - Revenue Trend: Rising, peak $3.5M in Dec.
      - Critical Alerts: ${ALERTS.filter(a => a.severity === 'critical').length} active.
      - Active Workflows: ${WORKFLOWS.filter(w => w.status === 'active').length}
      - Pending Tasks: ${TASKS.filter(t => t.status !== 'completed').length}
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
      Maintenance Requests:
      - Open: ${MAINTENANCE_REQUESTS.filter(m => m.status !== 'completed' && m.status !== 'cancelled').length}
      - High Priority: ${MAINTENANCE_REQUESTS.filter(m => m.priority === 'high' || m.priority === 'urgent').map(m => m.description).join(', ')}.
    `;
  } else if (path.includes('reports')) {
    dataContext = `
      You are in the Reports center. You can help the user generate custom reports based on portfolio data.
    `;
  } else if (path.includes('workflows')) {
    dataContext = `
      Workflows:
      - Total: ${WORKFLOWS.length}
      - Active: ${WORKFLOWS.filter(w => w.status === 'active').length}
      - Draft: ${WORKFLOWS.filter(w => w.status === 'draft').length}
      - Completed: ${WORKFLOWS.filter(w => w.status === 'completed').length}
      Recent: ${WORKFLOWS.slice(0, 3).map(w => `${w.title} (${w.status})`).join(', ')}.
    `;
  } else if (path.includes('tasks')) {
    dataContext = `
      Tasks:
      - Todo: ${TASKS.filter(t => t.status === 'todo').length}
      - In Progress: ${TASKS.filter(t => t.status === 'in_progress').length}
      - Blocked: ${TASKS.filter(t => t.status === 'blocked').length}
      - Completed: ${TASKS.filter(t => t.status === 'completed').length}
      High Priority: ${TASKS.filter(t => t.priority === 'high' || t.priority === 'critical').length}
    `;
  } else if (path.includes('leasing')) {
    dataContext = `
      Leases:
      - Active: ${LEASES.filter(l => l.status === 'active').length}
      - Expiring: ${LEASES.filter(l => l.status === 'expiring').length}
      - Draft: ${LEASES.filter(l => l.status === 'draft').length}
      - Renewed: ${LEASES.filter(l => l.status === 'renewed').length}
    `;
  }

  return `${baseContext}\n${dataContext}\n
  RESPONSE GUIDELINES:
  1. Use tools whenever possible to provide a rich UI experience.
  2. Be concise and professional.
  `;
};
