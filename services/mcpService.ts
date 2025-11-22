import { MCPServer, MCPTool } from '../types';
import { Type } from './agent/tools';

// Initial State
let connectedServers: MCPServer[] = [
  { 
    id: 'mcp-market', 
    name: 'Market Intel Server', 
    url: 'http://localhost:8080/sse', 
    status: 'connected', 
    capabilities: ['tools'] 
  }
];

// Simulated MCP Tools (In a real app, these are fetched from the server via JSON-RPC "tools/list")
const MOCK_MCP_TOOLS: Record<string, MCPTool[]> = {
  'mcp-market': [
    {
      name: "get_competitor_rates",
      description: "Fetch current rental rates for similar properties in the specified district from external market databases.",
      inputSchema: {
        type: "object",
        properties: {
          district: { type: "string", description: "The district to analyze (e.g. Bang Na, Sukhumvit)" },
          propertyType: { type: "string", enum: ["condo", "office", "retail"] }
        },
        required: ["district"]
      }
    },
    {
      name: "check_zoning_laws",
      description: "Check official government zoning regulations for a specific location.",
      inputSchema: {
        type: "object",
        properties: {
          location: { type: "string" },
          proposedUse: { type: "string" }
        },
        required: ["location"]
      }
    }
  ]
};

export const mcpService = {
  getServers: (): MCPServer[] => {
    return [...connectedServers];
  },

  addServer: (name: string, url: string) => {
    const newServer: MCPServer = {
      id: `mcp-${Date.now()}`,
      name,
      url,
      status: 'connected', // Simulating immediate connection
      capabilities: ['tools']
    };
    connectedServers.push(newServer);
    return newServer;
  },

  removeServer: (id: string) => {
    connectedServers = connectedServers.filter(s => s.id !== id);
  },

  // Discover tools from all connected servers
  discoverTools: async (): Promise<MCPTool[]> => {
    // Simulate network latency
    // await new Promise(resolve => setTimeout(resolve, 500));

    let allTools: MCPTool[] = [];
    connectedServers.forEach(server => {
      // In real implementation: Call server.url/tools/list
      // Here: Return mock tools if it matches our mock ID, else return a generic tool
      if (MOCK_MCP_TOOLS[server.id]) {
        allTools = [...allTools, ...MOCK_MCP_TOOLS[server.id]];
      } else {
        // Generic tool for custom added servers to show it works
        allTools.push({
          name: `query_${server.name.toLowerCase().replace(/\s/g, '_')}`,
          description: `Query data from ${server.name}`,
          inputSchema: {
            type: "object",
            properties: { query: { type: "string" } },
            required: ["query"]
          }
        });
      }
    });
    return allTools;
  },

  // Convert JSON Schema to OpenAI Function Format
  mapToGeminiTool: (tool: MCPTool) => {
    // Since we are using OpenAI compatible format now, we can map directly
    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema
      }
    };
  },

  // Execute a tool
  executeTool: async (name: string, args: any): Promise<any> => {
    console.log(`[MCP] Executing tool: ${name}`, args);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate external request

    // Mock Responses
    if (name === 'get_competitor_rates') {
      return {
        district: args.district,
        average_price: "15,000 THB",
        market_trend: "Up 5% YoY",
        competitors: [
          { name: "Noble Geo", price: "16,000" },
          { name: "Lumpini Ville", price: "14,500" }
        ]
      };
    }

    if (name === 'check_zoning_laws') {
      return {
        status: "Permitted",
        zone_code: "Or-3 (Residential/Commercial Mixed)",
        restrictions: "Max height 23 meters"
      };
    }

    return { 
      status: "success", 
      source: "External MCP Server", 
      data: `Processed query for ${name}` 
    };
  }
};