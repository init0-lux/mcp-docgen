import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

vi.mock('fs');

import fs from 'fs';

describe('loadConfig', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('throws when .mcp.yml does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const { loadConfig } = await import('../src/config/parser');
    expect(() => loadConfig('/fake')).toThrow('No .mcp.yml found');
  });

  it('throws when YAML is malformed', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(':::invalid yaml:::' as unknown as Buffer);
    const { loadConfig } = await import('../src/config/parser');
    expect(() => loadConfig('/fake')).toThrow();
  });

  it('throws on missing required fields', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('ai:\n  provider: ollama\n' as unknown as Buffer);
    const { loadConfig } = await import('../src/config/parser');
    expect(() => loadConfig('/fake')).toThrow('Invalid .mcp.yml');
  });

  it('parses a valid config and fills defaults', async () => {
    const raw = `
project:
  name: my-project
  stack:
    - typescript
`;
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(raw as unknown as Buffer);
    const { loadConfig } = await import('../src/config/parser');
    const config = loadConfig('/fake');
    expect(config.project.name).toBe('my-project');
    expect(config.ai.provider).toBe('ollama');
    expect(config.docs.style).toBe('tsdoc');
    expect(config.commit.maxLength).toBe(72);
    expect(config.readme.includeToc).toBe(true);
  });
});
