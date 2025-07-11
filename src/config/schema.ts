import { z } from "zod";

const AIProviderSchema = z.enum(["ollama", "gemini", "claude"]);

const AIConfigSchema = z.object({
  provider: AIProviderSchema.default("ollama"),
  model: z.string().optional(),
  ollamaEndpoint: z.string().url().default("http://localhost:11434"),
  maxTokens: z.number().int().positive().default(2048),
  fallback: AIProviderSchema.optional(),
});

const ProjectConfigSchema = z.object({
  name: z.string().min(1),
  stack: z.array(z.string()).min(1),
});

const DocsConfigSchema = z.object({
  style: z.enum(["jsdoc", "google", "tsdoc"]).default("tsdoc"),
  autoGenerate: z.boolean().default(false),
  examples: z.boolean().default(true),
});

const CommitConfigSchema = z.object({
  convention: z.enum(["conventional", "simple"]).default("conventional"),
  types: z
    .array(z.string())
    .default(["feat", "fix", "docs", "style", "refactor", "test", "chore"]),
  maxLength: z.number().int().positive().default(72),
});

const ReadmeConfigSchema = z.object({
  template: z.string().optional(),
  includeToc: z.boolean().default(true),
});

export const MCPConfigSchema = z.object({
  project: ProjectConfigSchema,
  ai: AIConfigSchema.default({}),
  docs: DocsConfigSchema.default({}),
  commit: CommitConfigSchema.default({}),
  readme: ReadmeConfigSchema.default({}),
});

export type MCPConfig = z.infer<typeof MCPConfigSchema>;
export type AIProvider = z.infer<typeof AIProviderSchema>;
