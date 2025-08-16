import type { MetaFunction } from "@remix-run/react";
import { useState } from "react";
import ky from "ky";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [copied, setCopied] = useState(false);
  const [apiResults, setApiResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const ghCommand = `gh repo create my-remix-app --template uratmangun/remix-deno --public --clone\ncd my-remix-app\npnpm install`;

  const callFunction = async (functionName: string, endpoint: string) => {
    setLoading(prev => ({ ...prev, [functionName]: true }));
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const fullUrl = `${apiBaseUrl}${endpoint}`;
      const response = await ky.get(fullUrl).json();
      setApiResults(prev => ({ ...prev, [functionName]: response }));
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      setApiResults(prev => ({ 
        ...prev, 
        [functionName]: { error: `Failed to call ${functionName}` }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [functionName]: false }));
    }
  };
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to <span className="sr-only">Remix</span>
          </h1>
          <div className="w-[684px] max-w-[90vw] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Clone this template with GitHub CLI
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Creates a new repo from template and clones it locally
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(ghCommand);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                aria-label="Copy GitHub CLI command"
                title="Copy command"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs leading-5 text-gray-800 ring-1 ring-inset ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700">
{ghCommand}
            </pre>
          </div>
        </header>
        <nav className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <p className="leading-6 text-gray-700 dark:text-gray-200">
            Test API Functions
          </p>
          <ul className="w-full">
            {functionEndpoints.map(({ name, endpoint, description, icon }) => (
              <li key={name} className="mb-4">
                <button
                  onClick={() => callFunction(name, endpoint)}
                  disabled={loading[name]}
                  className="group flex items-center gap-3 w-full p-3 leading-normal text-blue-700 hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  {icon}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
                  </div>
                  {loading[name] && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  )}
                </button>
                {apiResults[name] && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
                      {JSON.stringify(apiResults[name], null, 2)}
                    </pre>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

const functionEndpoints = [
  {
    name: "Hello World",
    endpoint: "/hello",
    description: "Simple greeting with timestamp and request info",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Users API",
    endpoint: "/api",
    description: "REST API with user data and pagination",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Time Service",
    endpoint: "/time",
    description: "Current time in multiple formats and timezones",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M10 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];
