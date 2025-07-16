export type ContentType = 'readme' | 'commit' | 'docs';

export interface GenerationContext {
  contentType: ContentType;
  prompt: string;
}

export interface AIProviderClient {
  generate(context: GenerationContext): Promise<string>;
  healthCheck(): Promise<boolean>;
}
