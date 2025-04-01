const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git')();
const ai = require('./ai-provider');
const { loadMCPConfig } = require('../mcp/parser');

async function generateDocs() {
  try {
    const config = loadMCPConfig();
    if (!config) throw new Error('No MCP config found');
    
    // Generate README
    const readme = await ai.generate('readme', {
      name: config.project?.name || path.basename(process.cwd()),
      stack: config.project?.stack || []
    });
    fs.writeFileSync(path.join(process.cwd(), 'README.md'), readme);

    // Generate inline docs if enabled
    if (config.docs?.autoGenerate) {
      await generateInlineDocs();
    }

  } catch (err) {
    throw new Error(`Documentation generation failed: ${err.message}`);
  }
}

async function generateInlineDocs() {
  const files = await getCodeFiles();
  if (files.length === 0) {
    console.log('ℹ️ No code files found for documentation');
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const documented = await ai.generate('docs', {
      code: content,
      language: path.extname(file).substring(1)
    });
    fs.writeFileSync(file, documented);
  }
}

// Helper function to get code files
async function getCodeFiles() {
  const extensions = ['.js', '.ts', '.py', '.go', '.rs'];
  const files = await simpleGit.raw(['ls-files']);
  return files.split('\n')
    .filter(file => extensions.includes(path.extname(file)));
}

module.exports = { generateDocs };
