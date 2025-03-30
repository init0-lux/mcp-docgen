const fs = require('fs');
const { generateReadme } = require('./ai-agent');
const { loadMCPConfig } = require('../mcp/parser');
const simpleGit = require('simple-git')();
const fetch = require('node-fetch');

// Main function must be properly exported
async function generateDocs() {
  const config = loadMCPConfig();
  if (!config?.project) {
    throw new Error('Invalid MCP config: missing project details');
  }
  
  const content = await generateReadme(config);
  fs.writeFileSync('README.md', content);
}


async function generateCommitMessage() {
  const diff = await simpleGit.diff(['--staged']);
  if (!diff.trim()) throw new Error('No staged changes detected');

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'codellama',
      prompt: `[INST] Write a 50-character Git commit message for:\n${diff}[/INST]`,
      stream: false,
    }),
  });

  const data = await response.json();
  return data.response.trim();
}

// Add to exports
module.exports = { generateDocs, generateCommitMessage };
