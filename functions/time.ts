/**
 * Time Function - Deno Deploy
 * Provides various time-related utilities and information
 */

export interface TimeResponse {
  success: boolean;
  message: string;
  data: {
    iso: string;
    unix: number;
    formatted: string;
    timezone: string;
    utc: string;
    dayOfWeek: string;
    dayOfYear: number;
  };
  timestamp: string;
}

/**
 * Main handler for the time function
 */
export default function handler(req: Request): Response {
  const url = new URL(req.url);
  const method = req.method;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight requests
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only accept GET requests
  if (method !== "GET") {
    return jsonResponse({
      success: false,
      message: "Method not allowed. Only GET requests are supported.",
      data: {
        iso: "",
        unix: 0,
        formatted: "",
        timezone: "",
        utc: "",
        dayOfWeek: "",
        dayOfYear: 0,
      },
      timestamp: new Date().toISOString(),
    }, corsHeaders, 405);
  }

  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const timeData = {
      iso: now.toISOString(),
      unix: Math.floor(now.getTime() / 1000),
      formatted: now.toLocaleString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utc: now.toUTCString(),
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
      dayOfYear: dayOfYear,
    };

    return jsonResponse({
      success: true,
      message: "Current time information retrieved successfully",
      data: timeData,
      timestamp: now.toISOString(),
    }, corsHeaders);

  } catch (error) {
    console.error("Time function error:", error);
    return jsonResponse({
      success: false,
      message: "Error retrieving time information",
      data: {
        iso: "",
        unix: 0,
        formatted: "",
        timezone: "",
        utc: "",
        dayOfWeek: "",
        dayOfYear: 0,
      },
      timestamp: new Date().toISOString(),
    }, corsHeaders, 500);
  }
}

/**
 * Helper function to create JSON responses
 */
function jsonResponse(
  data: TimeResponse,
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
  console.log("⏰ Time function starting on port 8001");
  Deno.serve({ port: 8001 }, handler);
}
