import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeMinimalConfig(overrides: Record<string, unknown> = {}) {
  return {
    project: { name: "test", stack: ["ts"] },
    ai: {
      provider: "ollama" as const,
      ollamaEndpoint: "http://localhost:11434",
      maxTokens: 2048,
      ...overrides,
    },
    docs: { style: "tsdoc" as const, autoGenerate: false, examples: true },
    commit: {
      convention: "conventional" as const,
      types: [] as string[],
      maxLength: 72,
    },
    readme: { includeToc: true },
  };
}

describe("OllamaProvider", () => {
  beforeEach(() => vi.resetAllMocks());

  it("returns trimmed generated text", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ response: "  generated text  " }),
    });

    const { OllamaProvider } = await import("../src/providers/ollama");
    const provider = new OllamaProvider(makeMinimalConfig() as any);

    const result = await provider.generate({
      contentType: "readme",
      prompt: "test",
    });
    expect(result).toBe("generated text");
  });

  it("throws on non-OK HTTP response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const { OllamaProvider } = await import("../src/providers/ollama");
    const provider = new OllamaProvider(makeMinimalConfig() as any);

    await expect(
      provider.generate({ contentType: "readme", prompt: "test" }),
    ).rejects.toThrow("Ollama returned 500");
  });
});

describe("GeminiProvider", () => {
  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("throws when GEMINI_API_KEY is not set", async () => {
    delete process.env.GEMINI_API_KEY;
    const { GeminiProvider } = await import("../src/providers/gemini");
    expect(
      () =>
        new GeminiProvider(makeMinimalConfig({ provider: "gemini" }) as any),
    ).toThrow("GEMINI_API_KEY");
  });
});

describe("ClaudeProvider", () => {
  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("throws when ANTHROPIC_API_KEY is not set", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { ClaudeProvider } = await import("../src/providers/claude");
    expect(
      () =>
        new ClaudeProvider(makeMinimalConfig({ provider: "claude" }) as any),
    ).toThrow("ANTHROPIC_API_KEY");
  });
});

describe("fallback chain", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("falls back to secondary provider when primary fails", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ response: "fallback result" }),
    });

    const { generate } = await import("../src/providers/index");

    const config = makeMinimalConfig({
      provider: "gemini",
      fallback: "ollama",
    });

    delete process.env.GEMINI_API_KEY;

    const result = await generate(
      { contentType: "commit", prompt: "test" },
      config as any,
    );
    expect(result).toBe("fallback result");
  });

  it("throws aggregated error when all providers fail", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, statusText: "Err" });

    const { generate } = await import("../src/providers/index");

    const config = makeMinimalConfig({
      provider: "ollama",
      fallback: "gemini",
    });

    await expect(
      generate({ contentType: "commit", prompt: "test" }, config as any),
    ).rejects.toThrow("All providers failed");
  });
});
