# Remix + Deno Deploy Template

A modern full-stack application template combining **Remix SPA** with **Deno Deploy serverless functions**. This template provides a complete solution for building scalable web applications with TypeScript, Tailwind CSS, and automated deployment to Cloudflare Pages + Deno Deploy.

## 🚀 Quick Deploy

**Automated Deployment:** Push to main branch triggers automatic deployment to both platforms:

- **Frontend**: Cloudflare Pages (Remix SPA)
- **Functions**: Deno Deploy (Serverless API)

📖 **[Complete Deployment Guide](./DEPLOYMENT.md)** - Step-by-step setup instructions

## 🏗️ Architecture Overview

This template uses a **dual deployment strategy** for optimal performance and scalability:

- **Remix SPA** → Cloudflare Pages (Global CDN, instant loading)
- **Deno Functions** → Deno Deploy (Edge computing, auto-scaling)
- **Dynamic Router** → Auto-discovers and routes to all functions

## ✨ Features

- **🎯 Full-Stack TypeScript** - End-to-end type safety
- **⚡ Dynamic Function Registry** - Auto-discovers and routes to Deno functions
- **🌐 Global CDN** - Cloudflare Pages for instant worldwide access
- **🔄 Edge Computing** - Deno Deploy for serverless API endpoints
- **🚀 Zero-Config Deployment** - GitHub Actions handles everything
- **📱 Modern UI** - Tailwind CSS with responsive design
- **🔧 Developer Experience** - Hot reload, concurrent development

## 🛠️ Development Setup

**Prerequisites:**
- Node.js 20.0.0+ (for Remix frontend)
- Deno 1.x+ (for serverless functions)
- pnpm (preferred) or yarn

**Quick Start:**
```bash
# Clone and install
git clone <your-repo>
cd remix-deno
pnpm install

# Start concurrent development (Remix + Functions)
pnpm dev

# Or start individually
pnpm dev:remix      # Remix only (port 5173)
pnpm dev:functions  # Deno functions only (port 8000)
```

**Available Endpoints:**
- Frontend: `http://localhost:5173`
- Functions: `http://localhost:8000`
  - `http://localhost:8000/hello` - Hello World function
  - `http://localhost:8000/time` - Time utilities function
  - `http://localhost:8000/api` - REST API function

## 📁 Adding New Functions

**It's incredibly simple!** Just create a new `.ts` file in the `functions/` directory:

```typescript
// functions/weather.ts
export default function handler(req: Request): Response {
  return new Response(JSON.stringify({
    message: "Weather API",
    temperature: "22°C",
    timestamp: new Date().toISOString()
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
```

**That's it!** The function is automatically:
- ✅ Discovered by the router
- ✅ Available at `/weather` endpoint
- ✅ Deployed on next push to main

## 🚀 Deployment

### Automatic Deployment
Push to `main` branch automatically deploys to both platforms via GitHub Actions.

### Manual Setup
1. **[Follow the Deployment Guide](./DEPLOYMENT.md)** for complete setup instructions
2. **Configure GitHub Secrets** for Cloudflare and Deno Deploy
3. **Push to main** - deployment happens automatically!

### Deployment Targets
- **Cloudflare Pages**: Remix SPA with global CDN
- **Deno Deploy**: Serverless functions with edge computing

## 🔧 Project Structure

```
remix-deno/
├── app/                    # Remix application
├── functions/              # Deno Deploy functions
│   ├── router.ts          # Dynamic function router
│   ├── hello.ts           # Sample: Hello World
│   ├── time.ts            # Sample: Time utilities
│   ├── api.ts             # Sample: REST API
│   └── README.md          # Functions documentation
├── public/                # Static assets
├── .github/workflows/     # Deployment automation
├── DEPLOYMENT.md          # Deployment guide
└── package.json           # Dependencies & scripts
```

## 🌟 Why This Architecture?

**🚀 Performance**: Cloudflare's global CDN + Deno's edge computing = blazing fast worldwide

**💰 Cost-Effective**: Pay only for function execution time, static hosting is nearly free

**🔧 Developer Experience**: Hot reload, auto-discovery, zero-config deployment

**📈 Scalable**: Auto-scaling functions + CDN handle traffic spikes effortlessly

**🛡️ Reliable**: Built on enterprise-grade infrastructure (Cloudflare + Deno Deploy)