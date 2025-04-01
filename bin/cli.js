#! node
'use strict';

// Add this at the very top to suppress warnings
process.removeAllListeners('warning');

const { generateDocs } = require('../src/agents/git-agent');
const { program } = require('commander');

program
  .command('docs')
  .description('Generate documentation')
  .action(async () => {
    try {
      await generateDocs();
      console.log('✅ Documentation generated!');
    } catch (err) {
      console.error('❌ Error:', err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);


// Correct import path (note the .js extension)
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

	const files = fs.readdirSync(process.cwd());
	if (files.length === 0) {
	  console.log('ℹ️ Empty project detected. Using minimal defaults.');
	  return generateMinimalConfig();
	}

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
    },
	{
	  type: 'text',
	  name: 'projectName',
	  message: 'Project name?',
	  initial: path.basename(process.cwd()),
	  validate: value => {
		const trimmed = value.trim();
		if (!trimmed) return 'Name cannot be empty';
		if (/[^a-z0-9-]/i.test(trimmed)) return 'Only alphanumeric and hyphens allowed';
		return true;
	  }
	},
	{
	  type: (_, values) => values.readmeTemplate === 'custom' ? 'text' : null,
	  name: 'customTemplatePath',
	  message: 'Path to custom README template:',
	  validate: value => {
		try {
		  const content = fs.readFileSync(value, 'utf8');
		  if (!content.includes('{project.name}')) {
			return 'Template must contain {project.name} placeholder';
		  }
		  return true;
		} catch {
		  return 'File not found or not readable';
		}
	  }
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

function generateMinimalConfig() {
  const config = {
    project: {
      name: path.basename(process.cwd()),
      stack: ['custom']
    },
    docs: { style: 'basic' },
    commits: { convention: 'simple' },
    readme: { template: '# {project.name}\n\n## Development\n' }
  };
  fs.writeFileSync('.mcp.yml', yaml.dump(config));
}

main();
