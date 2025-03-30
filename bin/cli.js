#! node

'use strict';

// Correct import path (note the .js extension)
const { generateDocs, generateCommitMessage } = require('../src/agents/git-agent.js');
const fs = require('fs');

async function main() {
  try {
    if (process.argv.includes('--readme')) {
      await generateDocs();  // Now properly imported
      console.log('✅ Docs generated!');
      process.exit(0);
	}

	if (process.argv.includes('--commit')) {
		try {
			const message = await generateCommitMessage();
			console.log(message); //only the message
			fs.writeFileSync('.git/COMMIT_EDITMSG', message); // Optional: Auto-save
		} catch (err) {
			console.error("❌", err.message);
		}
	}

  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

main();
