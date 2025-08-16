/**
 * API Function - Deno Deploy
 * Simple REST API endpoints for demonstration
 */

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  timestamp: string;
}

// Sample data store
const users = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com" },
  { id: 2, name: "Bob Smith", email: "bob@example.com" },
  { id: 3, name: "Carol Davis", email: "carol@example.com" },
];

/**
 * Main handler for the API function
 */
export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method;
  const searchParams = url.searchParams;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight requests
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // GET /api - List all users
    if (method === "GET") {
      const limit = parseInt(searchParams.get("limit") || "10");
      const offset = parseInt(searchParams.get("offset") || "0");
      
      const paginatedUsers = users.slice(offset, offset + limit);
      
      return jsonResponse({
        success: true,
        message: "Users retrieved successfully",
        data: {
          users: paginatedUsers,
          total: users.length,
          limit,
          offset,
        },
        timestamp: new Date().toISOString(),
      }, corsHeaders);
    }

    // POST /api - Create new user
    if (method === "POST") {
      const body = await req.json();
      
      if (!body.name || !body.email) {
        return jsonResponse({
          success: false,
          message: "Name and email are required",
          timestamp: new Date().toISOString(),
        }, corsHeaders, 400);
      }

      const newUser = {
        id: users.length + 1,
        name: body.name,
        email: body.email,
      };
      
      users.push(newUser);
      
      return jsonResponse({
        success: true,
        message: "User created successfully",
        data: newUser,
        timestamp: new Date().toISOString(),
      }, corsHeaders, 201);
    }

    // Method not allowed
    return jsonResponse({
      success: false,
      message: `Method ${method} not allowed`,
      timestamp: new Date().toISOString(),
    }, corsHeaders, 405);

  } catch (error) {
    console.error("API Error:", error);
    return jsonResponse({
      success: false,
      message: "Internal server error",
      timestamp: new Date().toISOString(),
    }, corsHeaders, 500);
  }
}

/**
 * Helper function to create JSON responses
 */
function jsonResponse(
  data: ApiResponse,
  headers: Record<string, string> = {},
  status = 200
): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

// For local development with Deno serve
if (import.meta.main) {
  console.log("📡 API function starting on port 8002");
  Deno.serve({ port: 8002 }, handler);
}
