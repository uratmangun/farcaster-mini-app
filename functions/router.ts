/**
 * Static Function Router for Deno Deploy
 * Routes requests to functions using static imports (compatible with Deno Deploy)
 */

// Static imports of all function handlers
import apiHandler from "./api.ts";

export interface FunctionInfo {
  name: string;
  handler: (req: Request) => Response | Promise<Response>;
}

export interface RouterResponse {
  success: boolean;
  message: string;
  data?: unknown;
  timestamp: string;
}

class FunctionRouter {
  private functions = new Map<string, FunctionInfo>();

  constructor() {
    // Register all functions statically
    this.registerFunctions();
  }

  /**
   * Register all function handlers statically
   */
  private registerFunctions(): void {
    console.log("🔍 Registering functions...");
    
    // Register each function handler
    const functionHandlers: Array<[string, (req: Request) => Response | Promise<Response>]> = [
      ["api", apiHandler],
    ];

    for (const [name, handler] of functionHandlers) {
      this.functions.set(name, {
        name,
        handler,
      });
      console.log(`✅ Registered function: ${name} -> /${name}`);
    }
    
    console.log(`🎉 Registered ${this.functions.size} functions\n`);
  }

  /**
   * Handle incoming requests and route to appropriate function
   */
  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight requests
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Root path - show available functions
    if (pathname === "/" || pathname === "") {
      return this.createIndexResponse(corsHeaders);
    }

    // Extract function name from path (e.g., /hello -> hello)
    const functionName = pathname.slice(1).split('/')[0];
    
    if (this.functions.has(functionName)) {
      try {
        const functionInfo = this.functions.get(functionName)!;
        console.log(`📡 Routing ${method} ${pathname} -> ${functionInfo.name}`);
        
        // Call the function handler
        const response = await functionInfo.handler(req);
        
        // Add CORS headers to the response
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (error) {
        console.error(`❌ Error in function ${functionName}:`, error);
        return this.createErrorResponse(
          `Error executing function: ${error instanceof Error ? error.message : String(error)}`,
          corsHeaders,
          500
        );
      }
    }

    // Function not found
    return this.createErrorResponse(
      `Function '${functionName}' not found`,
      corsHeaders,
      404
    );
  }

  /**
   * Create index response showing available functions
   */
  private createIndexResponse(corsHeaders: Record<string, string>): Response {
    const functionList = Array.from(this.functions.values()).map(func => ({
      name: func.name,
      endpoint: `/${func.name}`,
      description: `Function handler for ${func.name}`,
    }));

    const responseData = {
      success: true,
      message: "Hola",
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(responseData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    message: string,
    corsHeaders: Record<string, string>,
    status = 400
  ): Response {
    const responseData: RouterResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(responseData, null, 2), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }

  /**
   * Get list of registered functions
   */
  getRegisteredFunctions(): string[] {
    return Array.from(this.functions.keys());
  }
}

// Create router instance
const router = new FunctionRouter();

/**
 * Main handler function for the router
 */
export default async function handler(req: Request): Promise<Response> {
  return await router.handleRequest(req);
}

// For local development with Deno serve
if (import.meta.main) {
  console.log("🚀 Static Function Router starting on port 8000");
  console.log("🔗 Visit: http://localhost:8000");
  console.log("📋 Available functions:");
  router.getRegisteredFunctions().forEach(fn => {
    console.log(`   - /${fn}`);
  });
  console.log();
  
  Deno.serve({ port: 8000 }, handler);
}
