import fs from 'fs';
import path from 'path';
import { getGit } from '../utils/git';
import { generate } from '../providers';
import { logger } from '../utils/logger';
import type { MCPConfig } from '../config/schema';

const SUPPORTED_EXTENSIONS = new Set(['.ts', '.js', '.py', '.go', '.rs']);

function buildDocsPrompt(config: MCPConfig, code: string, language: string): string {
  return `You are a technical writer specialising in ${config.docs.style} documentation.

Add ${config.docs.style} documentation comments to every exported function, class, and type in the following ${language} source file.
${config.docs.examples ? 'Include @example blocks for non-trivial functions.' : ''}
Do not alter the implementation — only add or update documentation comments.
Output only the fully documented source file. No explanation.

\`\`\`${language}
${code}
\`\`\``;
}

export async function generateInlineDocs(config: MCPConfig): Promise<void> {
  const git = getGit();
  const tracked = await git.raw(['ls-files']);
  const files = tracked
    .split('\n')
    .map((f) => f.trim())
    .filter((f) => SUPPORTED_EXTENSIONS.has(path.extname(f)));

  if (files.length === 0) {
    logger.warn('No supported source files found in the repository');
    return;
  }

  for (const file of files) {
    const absPath = path.resolve(file);
    const language = path.extname(file).replace('.', '');

    try {
      const original = fs.readFileSync(absPath, 'utf8');
      const prompt = buildDocsPrompt(config, original, language);
      const documented = await generate({ contentType: 'docs', prompt }, config);

      fs.writeFileSync(`${absPath}.bak`, original, 'utf8');
      fs.writeFileSync(absPath, documented, 'utf8');
      logger.success(`Documented ${file}`);
    } catch (err) {
      logger.error(`Failed to document ${file}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
