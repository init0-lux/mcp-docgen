const fetch = require('node-fetch');

async function generateReadme(mcpConfig) {
  const prompt = `[INST] Generate README.md for ${mcpConfig.project.stack.join(' ')} project:\n${mcpConfig.readme.template}[/INST]`;

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'codellama',
      prompt: prompt,
      stream: false
    })
  });

  const data = await response.json();
  return data.response.trim();
}

module.exports = { generateReadme };
