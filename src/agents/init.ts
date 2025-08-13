import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import prompts from 'prompts';
import { logger } from '../utils/logger';
import type { MCPConfig } from '../config/schema';

export async function runInitWizard(): Promise<void> {
  logger.info('MCP Config Wizard\n');

  const responses = await prompts(
    [
      {
        type: 'text',
        name: 'projectName',
        message: 'Project name?',
        initial: path.basename(process.cwd()),
        validate: (v: string) => {
          if (!v.trim()) return 'Name cannot be empty';
          if (/[^a-z0-9-]/i.test(v.trim())) return 'Only alphanumeric and hyphens allowed';
          return true;
        },
      },
      {
        type: 'list',
        name: 'stack',
        message: 'Tech stack? (comma-separated)',
        initial: 'typescript, node',
        separator: ',',
      },
      {
        type: 'select',
        name: 'provider',
        message: 'Primary AI provider?',
        choices: [
          { title: 'Ollama (local)', value: 'ollama' },
          { title: 'Gemini', value: 'gemini' },
          { title: 'Claude', value: 'claude' },
        ],
      },
      {
        type: 'select',
        name: 'docStyle',
        message: 'Documentation style?',
        choices: [
          { title: 'TSDoc', value: 'tsdoc' },
          { title: 'JSDoc', value: 'jsdoc' },
          { title: 'Google Style', value: 'google' },
        ],
      },
      {
        type: 'confirm',
        name: 'includeToc',
        message: 'Include Table of Contents in README?',
        initial: true,
      },
    ],
    {
      onCancel: () => {
        logger.warn('Init cancelled');
        process.exit(0);
      },
    },
  );

  const config: MCPConfig = {
    project: {
      name: responses.projectName.trim(),
      stack: (responses.stack as string[]).map((s: string) => s.trim()).filter(Boolean),
    },
    ai: {
      provider: responses.provider,
      ollamaEndpoint: 'http://localhost:11434',
      maxTokens: 2048,
    },
    docs: {
      style: responses.docStyle,
      autoGenerate: false,
      examples: true,
    },
    commit: {
      convention: 'conventional',
      types: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
      maxLength: 72,
    },
    readme: {
      includeToc: responses.includeToc,
    },
  };

  const outPath = path.join(process.cwd(), '.mcp.yml');
  fs.writeFileSync(outPath, yaml.dump(config), 'utf8');
  logger.success(`.mcp.yml written to ${outPath}`);
}
