import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProviderClient, GenerationContext } from './index';
import type { MCPConfig } from '../config/schema';

export class GeminiProvider implements AIProviderClient {
  private readonly client: GoogleGenerativeAI;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(config: MCPConfig) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = config.ai.model ?? 'gemini-pro';
    this.maxTokens = config.ai.maxTokens;
  }

  async generate(context: GenerationContext): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: this.maxTokens,
      },
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: context.prompt }] }],
    });

    return result.response.text();
  }

  async healthCheck(): Promise<boolean> {
    return !!process.env.GEMINI_API_KEY;
  }
}
