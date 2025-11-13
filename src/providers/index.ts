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

export class ProviderError extends Error {
  constructor(
    public readonly providerName: string,
    public readonly cause: unknown,
  ) {
    super(
      `Provider "${providerName}" failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    this.name = "ProviderError";
  }
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
  const errors: ProviderError[] = [];

  try {
    const primary = buildProvider(config.ai.provider, config);
    return await primary.generate(context);
  } catch (err) {
    errors.push(new ProviderError(config.ai.provider, err));
  }

  if (config.ai.fallback && config.ai.fallback !== config.ai.provider) {
    try {
      const fallback = buildProvider(config.ai.fallback, config);
      return await fallback.generate(context);
    } catch (err) {
      errors.push(new ProviderError(config.ai.fallback, err));
    }
  }

  throw new AggregateError(
    errors,
    `All providers failed:\n${errors.map((e) => `  ${e.message}`).join("\n")}`,
  );
}
