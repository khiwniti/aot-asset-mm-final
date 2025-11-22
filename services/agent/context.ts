
import { PROPERTIES, ALERTS, WORK_ORDERS } from "../mockData";

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
  
  Routing Knowledge:
  - Dashboard: /
  - Portfolio: /properties
  - Financial: /financial
  - Leasing: /leasing
  - Maintenance: /maintenance
  - Reports: /reports
  `;

  let dataContext = "";
  
  if (path === '/' || path.includes('dashboard')) {
    dataContext = `
      Key Metrics: 
      - Total Value: $102M
      - Occupancy: 76%
      - Revenue Trend: Rising, peak $3.5M in Dec.
      - Critical Alerts: ${ALERTS.filter(a => a.severity === 'critical').length} active.
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
      Work Orders:
      - Open: 12
      - High Priority: ${WORK_ORDERS.filter(w => w.priority === 'High').map(w => w.title).join(', ')}.
    `;
  } else if (path.includes('reports')) {
    dataContext = `
      You are in the Reports center. You can help the user generate custom reports based on portfolio data.
    `;
  }

  return `${baseContext}\n${dataContext}\n
  RESPONSE GUIDELINES:
  1. Use tools whenever possible to provide a rich UI experience.
  2. Be concise and professional.
  `;
};
