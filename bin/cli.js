#! node

'use strict';

// Correct import path (note the .js extension)
const { generateDocs } = require('../src/agents/git-agent.js');

async function main() {
  try {
    if (process.argv.includes('--readme')) {
      await generateDocs();  // Now properly imported
      console.log('✅ Docs generated!');
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

main();
