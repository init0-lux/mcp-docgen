import Anthropic from '@anthropic-ai/sdk';
import type { AIProviderClient, GenerationContext } from './index';
import type { MCPConfig } from '../config/schema';

export class ClaudeProvider implements AIProviderClient {
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(config: MCPConfig) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    this.client = new Anthropic({ apiKey });
    this.model = config.ai.model ?? 'claude-3-5-haiku-20241022';
    this.maxTokens = config.ai.maxTokens;
  }

  async generate(context: GenerationContext): Promise<string> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      messages: [{ role: 'user', content: context.prompt }],
    });

    const block = message.content[0];
    if (block.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }
    return block.text.trim();
  }

  async healthCheck(): Promise<boolean> {
    return !!process.env.ANTHROPIC_API_KEY;
  }
}
