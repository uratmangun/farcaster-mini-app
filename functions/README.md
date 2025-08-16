# Deno Deploy Functions

This directory contains Deno Deploy functions for the remix-deno template with **dynamic function discovery and routing**.

## 🚀 Dynamic Function System

The functions directory uses an auto-discovery system that automatically registers all `.ts` function files and makes them available through a single router.

### How It Works
- **Auto-Discovery**: Automatically detects all `.ts` files in the functions directory
- **Dynamic Routing**: Maps URL paths to functions (e.g., `/hello` → `hello.ts`, `/time` → `time.ts`)
- **Single Port**: All functions accessible through one development server on port 8000
- **Zero Configuration**: Just drop in new `.ts` files and they're immediately available

## Available Functions

### hello.ts
A simple "Hello, World!" function that demonstrates basic Deno Deploy functionality.
- **Endpoint**: `http://localhost:8000/hello`
- **Method**: GET, POST
- **Response**: JSON with greeting message, timestamp, and request info

### time.ts
Provides current time information in various formats.
- **Endpoint**: `http://localhost:8000/time`
- **Method**: GET
- **Response**: JSON with ISO, Unix, formatted time, timezone, etc.

## 🔧 Development Workflow

### Start All Functions (Recommended)
```bash
# Start the dynamic router (auto-discovers all functions)
pnpm dev:functions

# Or using deno directly
deno task dev
```

This starts a single server on port 8000 that routes to all discovered functions:
- `http://localhost:8000/` - Shows available functions
- `http://localhost:8000/hello` - Hello function
- `http://localhost:8000/time` - Time function

### Concurrent Development (Remix + Functions)
Run both Remix and Deno functions simultaneously:
```bash
pnpm dev
```

This will start:
- Remix development server on port 5173 (default)
- Deno Deploy functions router on port 8000

### Individual Function Development
Run individual functions on separate ports:
```bash
pnpm functions:hello    # Port 8000 (hello only)
pnpm functions:time     # Port 8001 (time only)
```

### Testing Functions
```bash
# Test the router index (shows all available functions)
curl http://localhost:8000/

# Test specific functions
curl http://localhost:8000/hello
curl http://localhost:8000/time
```

## 📁 Adding New Functions

**It's incredibly simple!** Just create a new `.ts` file in this directory:

1. **Create the file**: `functions/myfunction.ts`
2. **Export a default handler**:
   ```typescript
   export default function handler(req: Request): Response {
     return new Response(JSON.stringify({
       message: "My new function works!",
       timestamp: new Date().toISOString()
     }), {
       headers: { "Content-Type": "application/json" }
     });
   }
   ```
3. **That's it!** The function is automatically available at `http://localhost:8000/myfunction`

### Function Requirements
- Must export a `default` function
- Function must accept `Request` and return `Response` or `Promise<Response>`
- File must have `.ts` extension
- CORS headers are handled by the router, but you can override them

## 🛠️ Code Quality
```bash
# Lint Deno code
pnpm lint:deno

# Format Deno code
pnpm fmt:deno

# Type check Deno code
pnpm check:deno
```

## 🚀 Deployment

For production deployment to Deno Deploy:
1. Push your code to GitHub
2. Connect your repository to Deno Deploy
3. Set the entry point to `functions/router.ts`
4. Deploy!

The router will automatically discover and serve all your functions in production.

## 🔍 Router Features

- **Auto-Discovery**: Scans directory for `.ts` files on startup
- **Dynamic Imports**: Loads functions on-demand
- **Error Handling**: Graceful error responses for failed functions
- **CORS Support**: Automatic CORS headers for all functions
- **Index Page**: Shows available functions at root path
- **Hot Reload**: File watching in development mode
