/**
 * Simple Deno Deploy Function
 * Returns a "Hello, World!" message with basic API functionality
 */

export interface HelloResponse {
  message: string;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * Main handler function for the Deno Deploy function
 */
export default function handler(req: Request): Response {
  const url = new URL(req.url);
  const method = req.method;

  // CORS headers for cross-origin requests
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

  // Create response data
  const responseData: HelloResponse = {
    message: "Hello, World! 🌍",
    timestamp: new Date().toISOString(),
    path: url.pathname,
    method: method,
  };

  // Return JSON response
  return new Response(JSON.stringify(responseData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

// For local development with Deno serve
if (import.meta.main) {
  console.log("🚀 Hello World function starting on port 8000");
  console.log("🔗 Visit: http://localhost:8000");
  Deno.serve({ port: 8000 }, handler);
}
