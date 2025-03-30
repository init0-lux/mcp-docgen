const fs = require('fs');
const { generateReadme } = require('./ai-agent');
const { loadMCPConfig } = require('../mcp/parser');

// Main function must be properly exported
async function generateDocs() {
  const config = loadMCPConfig();
  if (!config?.project) {
    throw new Error('Invalid MCP config: missing project details');
  }
  
  const content = await generateReadme(config);
  fs.writeFileSync('README.md', content);
}

// Explicit exports
module.exports = {
  generateDocs: generateDocs  // Same as { generateDocs }
};
