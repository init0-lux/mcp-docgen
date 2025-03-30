#! node

'use strict';

// Correct import path (note the .js extension)
const { generateDocs, generateCommitMessage } = require('../src/agents/git-agent.js');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const yaml = require('js-yaml');

async function main() {
  try {

	// Add --init command
	if (process.argv.includes('--init')) {
	  initConfigWizard();
	} else if (process.argv.includes('--readme')) {
	  generateDocs();
	} else if (process.argv.includes('--commit')) {
	  generateCommitMessage();
	}

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

async function initConfigWizard() {
  console.log('🛠️  Welcome to MCP Config Wizard\n');

  const responses = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name?',
      initial: path.basename(process.cwd())
    },
    {
      type: 'multiselect',
      name: 'stack',
      message: 'Tech stack?',
      choices: [
        { title: 'JavaScript', value: 'javascript' },
        { title: 'TypeScript', value: 'typescript' },
        { title: 'Python', value: 'python' },
        { title: 'React', value: 'react' }
      ],
      hint: '- Space to select. Enter to submit'
    },
    {
      type: 'select',
      name: 'docStyle',
      message: 'Documentation style?',
      choices: [
        { title: 'JSDoc', value: 'jsdoc' },
        { title: 'Google Style', value: 'google' },
        { title: 'TypeScript', value: 'typescript' }
      ]
    }
  ]);

  const config = {
    project: {
      name: responses.projectName,
      stack: responses.stack
    },
    docs: {
      style: responses.docStyle
    },
    readme: {
      template: `# ${responses.projectName}\n\n## Features\n\n## Installation\n\n## Usage`
    }
  };

  fs.writeFileSync('.mcp.yml', yaml.dump(config));
  console.log('\n✅ Generated .mcp.yml configuration file!');
}

main();
