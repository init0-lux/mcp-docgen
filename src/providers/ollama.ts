import type { AIProviderClient, GenerationContext } from './index';
import type { MCPConfig } from '../config/schema';

export class OllamaProvider implements AIProviderClient {
  private readonly endpoint: string;
  private readonly model: string;

  constructor(config: MCPConfig) {
    this.endpoint = config.ai.ollamaEndpoint;
    this.model = config.ai.model ?? 'codellama';
  }

  async generate(context: GenerationContext): Promise<string> {
    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: context.prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_ctx: 4096,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as { response: string };
    return data.response.trim();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
