import { traceable } from "langsmith/traceable";
import { env } from "../env.js";

export function isLangSmithEnabled(): boolean {
  return !!env.LANGSMITH_API_KEY;
}

export { traceable };

export function createTracedFunction<T extends (...args: unknown[]) => unknown>(
  fn: T,
  name: string,
  runType: "chain" | "llm" | "tool" | "retriever" | "embedding" | "prompt" | "parser" = "chain",
) {
  return traceable(fn, {
    name,
    run_type: runType,
  });
}
