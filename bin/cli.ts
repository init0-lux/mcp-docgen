#!/usr/bin/env node
import { Command } from "commander";
import { loadConfig } from "../src/config/parser";
import { logger } from "../src/utils/logger";

const program = new Command();

program
  .name("mcp-docgen")
  .description("AI-powered documentation generator for your codebase")
  .version("1.0.0");

program
  .command("docs")
  .description("Generate README and inline documentation")
  .action(async () => {
    try {
      const config = loadConfig();
      const { generateReadme } = await import("../src/agents/readme");
      await generateReadme(config);
      logger.success("Documentation generated");
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program
  .command("commit")
  .description("Generate a conventional commit message from staged changes")
  .action(async () => {
    try {
      const config = loadConfig();
      const { generateCommitMessage } = await import("../src/agents/commit");
      const message = await generateCommitMessage(config);
      process.stdout.write(message + "\n");
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program
  .command("init")
  .description("Initialise a .mcp.yml config file interactively")
  .action(async () => {
    try {
      const { runInitWizard } = await import("../src/agents/init");
      await runInitWizard();
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.parse(process.argv);
