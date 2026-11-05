import { SettingsIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SERVICES = {
  ai: { name: "Google AI", variables: ["GOOGLE_GENERATIVE_AI_API_KEY"] },
} as const;

/**
 * Shown instead of a page that needs a service that isn't configured yet.
 * Example: if (!isAiConfigured()) return <SetupRequired service="ai" />;
 */
export function SetupRequired({ service }: { service: keyof typeof SERVICES }) {
  const { name, variables } = SERVICES[service];
  return (
    <Card className="mx-auto my-12 w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="size-5" />
          Set up {name} to use this page
        </CardTitle>
        <CardDescription>
          Add these to <code>.env.local</code> (and to your Vercel project),
          then restart the dev server. The README explains where to find each
          value.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 font-mono text-sm">
          {variables.map((variable) => (
            <li key={variable}>{variable}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
