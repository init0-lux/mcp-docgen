const fs = require('fs');
const yaml = require('js-yaml');

function loadMCPConfig() {
  try {
    return yaml.load(fs.readFileSync('.mcp.yml', 'utf8'));
  } catch (err) {
    throw new Error(`MCP config error: ${err.message}`);
  }
}

module.exports = { loadMCPConfig };
