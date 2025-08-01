import { getGit } from '../utils/git';
import { generate } from '../providers';
import type { MCPConfig } from '../config/schema';

function buildCommitPrompt(config: MCPConfig, diff: string): string {
  const { convention, types, maxLength } = config.commit;
  const format =
    convention === 'conventional'
      ? `type(optional-scope): description\n\nTypes: ${types.join(', ')}`
      : 'A short imperative summary of the change';

  return `You are a senior engineer writing a git commit message.

Format: ${format}
Max subject line length: ${maxLength} characters
Mood: Imperative ("Add" not "Added", "Fix" not "Fixed")

Staged diff:
\`\`\`diff
${diff}
\`\`\`

Output only the commit message. No explanation. No code fences.`;
}

export async function generateCommitMessage(config: MCPConfig): Promise<string> {
  const git = getGit();
  const diff = await git.diff(['--cached']);

  if (!diff.trim()) {
    throw new Error('No staged changes found. Stage your changes with `git add` first.');
  }

  return generate({ contentType: 'commit', prompt: buildCommitPrompt(config, diff) }, config);
}
