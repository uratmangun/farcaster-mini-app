import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { FarcasterSDK } from "./components/FarcasterSDK";

import "./tailwind.css";

export const meta: MetaFunction = () => [
  { title: "Farcaster Mini App" },
  { name: "description", content: "A Farcaster Mini App built with Remix" },
  { property: "fc:frame", content: "vNext" },
  { property: "fc:frame:image", content: "https://your-domain.com/logo-light.png" },
  { property: "fc:frame:button:1", content: "Launch App" },
  { property: "fc:frame:button:1:action", content: "link" },
  { property: "fc:frame:button:1:target", content: "https://your-domain.com" },
];

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <FarcasterSDK />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
