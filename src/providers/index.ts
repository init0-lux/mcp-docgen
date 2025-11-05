import type { MCPConfig, AIProvider } from "../config/schema";
import { OllamaProvider } from "./ollama";
import { GeminiProvider } from "./gemini";
import { ClaudeProvider } from "./claude";

export type ContentType = "readme" | "commit" | "docs";

export interface GenerationContext {
  contentType: ContentType;
  prompt: string;
}

export interface AIProviderClient {
  generate(context: GenerationContext): Promise<string>;
  healthCheck(): Promise<boolean>;
}

function buildProvider(name: AIProvider, config: MCPConfig): AIProviderClient {
  switch (name) {
    case "ollama":
      return new OllamaProvider(config);
    case "gemini":
      return new GeminiProvider(config);
    case "claude":
      return new ClaudeProvider(config);
  }
}

export async function generate(
  context: GenerationContext,
  config: MCPConfig,
): Promise<string> {
  const errors: string[] = [];

  try {
    const primary = buildProvider(config.ai.provider, config);
    return await primary.generate(context);
  } catch (err) {
    errors.push(
      `${config.ai.provider}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (config.ai.fallback && config.ai.fallback !== config.ai.provider) {
    try {
      const fallback = buildProvider(config.ai.fallback, config);
      return await fallback.generate(context);
    } catch (err) {
      errors.push(
        `${config.ai.fallback}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  throw new Error(
    `All providers failed:\n${errors.map((e) => `  ${e}`).join("\n")}`,
  );
}
