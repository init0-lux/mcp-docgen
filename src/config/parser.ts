import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { MCPConfigSchema, type MCPConfig } from "./schema";

export function loadConfig(cwd: string = process.cwd()): MCPConfig {
  const configPath = path.join(cwd, ".mcp.yml");

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `No .mcp.yml found in ${cwd}. Run \`mcp-docgen init\` to create one.`,
    );
  }

  const raw = yaml.load(fs.readFileSync(configPath, "utf8"));
  const result = MCPConfigSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid .mcp.yml:\n${issues}`);
  }

  return result.data;
}
