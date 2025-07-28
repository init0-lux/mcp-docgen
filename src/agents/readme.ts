import fs from "fs";
import path from "path";
import { getGit } from "../utils/git";
import { generate } from "../providers";
import { logger } from "../utils/logger";
import type { MCPConfig } from "../config/schema";

function buildReadmePrompt(config: MCPConfig, fileList: string[]): string {
  const toc = config.readme.includeToc
    ? "Include a markdown Table of Contents.\n"
    : "";
  return `You are a technical writer. Generate a complete, professional README.md for the following project.

Project Name: ${config.project.name}
Tech Stack: ${config.project.stack.join(", ")}
Source Files:
${fileList.map((f) => `  - ${f}`).join("\n")}

Requirements:
- Write in GitHub Flavored Markdown
- Include: Description, Prerequisites, Installation, Configuration, Usage, and Contributing sections
- Installation section must show exact commands to run
- Configuration section must document every .mcp.yml field
- Usage section must show real CLI examples
${toc}
Output only the raw markdown. No explanation, no code fences around the output.`;
}

export async function generateReadme(config: MCPConfig): Promise<void> {
  const git = getGit();
  const tracked = await git.raw(["ls-files"]);
  const fileList = tracked
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const prompt = buildReadmePrompt(config, fileList);
  const content = await generate({ contentType: "readme", prompt }, config);

  const outPath = path.join(process.cwd(), "README.md");
  fs.writeFileSync(outPath, content, "utf8");
  logger.success(`README written to ${outPath}`);
}
