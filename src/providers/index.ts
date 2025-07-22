import type { MCPConfig, AIProvider } from "../config/schema";
import { OllamaProvider } from "./ollama";
import { GeminiProvider } from "./gemini";

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
      throw new Error("Claude provider not yet initialised");
  }
}

export async function generate(
  context: GenerationContext,
  config: MCPConfig,
): Promise<string> {
  const primary = buildProvider(config.ai.provider, config);
  const errors: string[] = [];

  try {
    return await primary.generate(context);
  } catch (err) {
    errors.push(
      `${config.ai.provider}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (config.ai.fallback && config.ai.fallback !== config.ai.provider) {
    const fallback = buildProvider(config.ai.fallback, config);
    try {
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
