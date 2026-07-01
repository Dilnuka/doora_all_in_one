export const AGENT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "set_light",
      description: "Turn lights on or off in a room zone.",
      parameters: {
        type: "object",
        properties: {
          zone: {
            type: "string",
            enum: ["master", "kitchen", "bath", "bed", "living", "all"],
          },
          state: { type: "boolean", description: "true = on, false = off" },
        },
        required: ["zone", "state"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "set_temperature",
      description: "Set AC target temperature in Celsius.",
      parameters: {
        type: "object",
        properties: { temp: { type: "number" } },
        required: ["temp"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "set_ac_power",
      description: "Turn AC on or off.",
      parameters: {
        type: "object",
        properties: { state: { type: "boolean" } },
        required: ["state"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "set_tv",
      description: "Turn TV on or off.",
      parameters: {
        type: "object",
        properties: { state: { type: "boolean" } },
        required: ["state"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "set_curtains",
      description: "Open or close curtains. true = open, false = close.",
      parameters: {
        type: "object",
        properties: {
          zone: { type: "string", enum: ["bed", "living", "all"] },
          state: { type: "boolean" },
        },
        required: ["zone", "state"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "set_door",
      description: "Lock or unlock the room door. true = lock, false = unlock.",
      parameters: {
        type: "object",
        properties: { state: { type: "boolean" } },
        required: ["state"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "make_coffee",
      description: "Start the coffee maker.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_menu",
      description: "Search cafeteria menu items by name or category.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Food item or cuisine to search" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "place_food_order",
      description:
        "Place a food order for the resident. Use menu item names from search_menu.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                quantity: { type: "number" },
              },
              required: ["name", "quantity"],
            },
          },
          note: { type: "string" },
        },
        required: ["items"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_order_status",
      description: "Get the status of the user's most recent food order.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_contacts",
      description: "Search the user's contacts or platform users by name or username.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "send_message",
      description: "Send a chat message to a contact by username.",
      parameters: {
        type: "object",
        properties: {
          username: { type: "string" },
          content: { type: "string" },
        },
        required: ["username", "content"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_online_contacts",
      description: "List contacts who are currently online.",
      parameters: { type: "object", properties: {} },
    },
  },
];

export type ToolCallResult = {
  name: string;
  args: Record<string, unknown>;
  success: boolean;
  result?: unknown;
  error?: string;
};
