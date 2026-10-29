import { createFileRoute } from "@tanstack/react-router";
import { FunctionPlotter } from "@/components/function-plotter";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <FunctionPlotter />;
}
