import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/providers', () => ({
  generate: vi.fn().mockResolvedValue('# Generated README'),
}));

vi.mock('../src/utils/git', () => ({
  getGit: () => ({
    raw: vi.fn().mockResolvedValue('src/index.ts\nsrc/utils/logger.ts\n'),
    diff: vi.fn().mockResolvedValue('+ added line\n- removed line'),
  }),
}));

vi.mock('fs');

import fs from 'fs';
import { generate } from '../src/providers';

const baseConfig = {
  project: { name: 'test-project', stack: ['typescript'] },
  ai: { provider: 'ollama' as const, ollamaEndpoint: 'http://localhost:11434', maxTokens: 2048 },
  docs: { style: 'tsdoc' as const, autoGenerate: false, examples: true },
  commit: { convention: 'conventional' as const, types: ['feat', 'fix'], maxLength: 72 },
  readme: { includeToc: true },
};

describe('generateReadme', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls generate with readme contentType', async () => {
    const { generateReadme } = await import('../src/agents/readme');
    await generateReadme(baseConfig);
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({ contentType: 'readme' }),
      baseConfig
    );
  });

  it('writes output to README.md', async () => {
    const { generateReadme } = await import('../src/agents/readme');
    await generateReadme(baseConfig);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('README.md'),
      '# Generated README',
      'utf8'
    );
  });
});

describe('generateCommitMessage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls generate with commit contentType', async () => {
    const { generateCommitMessage } = await import('../src/agents/commit');
    await generateCommitMessage(baseConfig);
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({ contentType: 'commit' }),
      baseConfig
    );
  });
});
