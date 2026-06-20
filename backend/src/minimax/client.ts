import { minimax } from "vercel-minimax-ai-provider";
import { env } from "../env.js";

export function createMiniMaxProvider() {
  return minimax;
}

export function getMiniMaxApiKey(): string | undefined {
  return env.MINIMAX_API_KEY;
}

export const SUPPORTED_MINIMAX_MODELS = [
  "MiniMax-M2.7",
  "MiniMax-M2.7-highspeed",
  "MiniMax-M2.5",
  "MiniMax-M2.5-highspeed",
  "MiniMax-M2.1",
  "MiniMax-M2.1-highspeed",
  "MiniMax-M2",
] as const;

export type MiniMaxModel = (typeof SUPPORTED_MINIMAX_MODELS)[number];
