#!/usr/bin/env node
#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/tsup/assets/cjs_shims.js
var init_cjs_shims = __esm({
  "node_modules/tsup/assets/cjs_shims.js"() {
    "use strict";
  }
});

// src/utils/logger.ts
var import_chalk, logger;
var init_logger = __esm({
  "src/utils/logger.ts"() {
    "use strict";
    init_cjs_shims();
    import_chalk = __toESM(require("chalk"));
    logger = {
      info: (msg) => console.log(import_chalk.default.cyan("\u2139"), msg),
      success: (msg) => console.log(import_chalk.default.green("\u2714"), msg),
      warn: (msg) => console.warn(import_chalk.default.yellow("\u26A0"), msg),
      error: (msg) => console.error(import_chalk.default.red("\u2716"), msg)
    };
  }
});

// src/utils/git.ts
function getGit(cwd = process.cwd()) {
  if (!import_fs2.default.existsSync(import_path2.default.join(cwd, ".git"))) {
    throw new Error(`${cwd} is not a git repository`);
  }
  return (0, import_simple_git.default)(cwd);
}
var import_simple_git, import_fs2, import_path2;
var init_git = __esm({
  "src/utils/git.ts"() {
    "use strict";
    init_cjs_shims();
    import_simple_git = __toESM(require("simple-git"));
    import_fs2 = __toESM(require("fs"));
    import_path2 = __toESM(require("path"));
  }
});

// src/providers/ollama.ts
var OllamaProvider;
var init_ollama = __esm({
  "src/providers/ollama.ts"() {
    "use strict";
    init_cjs_shims();
    OllamaProvider = class {
      endpoint;
      model;
      constructor(config) {
        this.endpoint = config.ai.ollamaEndpoint;
        this.model = config.ai.model ?? "codellama";
      }
      async generate(context) {
        const response = await fetch(`${this.endpoint}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: this.model,
            prompt: context.prompt,
            stream: false,
            options: {
              temperature: 0.3,
              num_ctx: 4096
            }
          })
        });
        if (!response.ok) {
          throw new Error(`Ollama returned ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.response.trim();
      }
      async healthCheck() {
        try {
          const res = await fetch(`${this.endpoint}/api/tags`);
          return res.ok;
        } catch {
          return false;
        }
      }
    };
  }
});

// src/providers/gemini.ts
var import_generative_ai, GeminiProvider;
var init_gemini = __esm({
  "src/providers/gemini.ts"() {
    "use strict";
    init_cjs_shims();
    import_generative_ai = require("@google/generative-ai");
    GeminiProvider = class {
      client;
      model;
      maxTokens;
      constructor(config) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("GEMINI_API_KEY environment variable is not set");
        }
        this.client = new import_generative_ai.GoogleGenerativeAI(apiKey);
        this.model = config.ai.model ?? "gemini-pro";
        this.maxTokens = config.ai.maxTokens;
      }
      async generate(context) {
        const model = this.client.getGenerativeModel({
          model: this.model,
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: this.maxTokens
          }
        });
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: context.prompt }] }]
        });
        return result.response.text();
      }
      async healthCheck() {
        return !!process.env.GEMINI_API_KEY;
      }
    };
  }
});

// src/providers/claude.ts
var import_sdk, ClaudeProvider;
var init_claude = __esm({
  "src/providers/claude.ts"() {
    "use strict";
    init_cjs_shims();
    import_sdk = __toESM(require("@anthropic-ai/sdk"));
    ClaudeProvider = class {
      client;
      model;
      maxTokens;
      constructor(config) {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new Error("ANTHROPIC_API_KEY environment variable is not set");
        }
        this.client = new import_sdk.default({ apiKey });
        this.model = config.ai.model ?? "claude-3-5-haiku-20241022";
        this.maxTokens = config.ai.maxTokens;
      }
      async generate(context) {
        const message = await this.client.messages.create({
          model: this.model,
          max_tokens: this.maxTokens,
          messages: [{ role: "user", content: context.prompt }]
        });
        const block = message.content[0];
        if (block.type !== "text") {
          throw new Error("Unexpected response type from Claude API");
        }
        return block.text.trim();
      }
      async healthCheck() {
        return !!process.env.ANTHROPIC_API_KEY;
      }
    };
  }
});

// src/providers/index.ts
function buildProvider(name, config) {
  switch (name) {
    case "ollama":
      return new OllamaProvider(config);
    case "gemini":
      return new GeminiProvider(config);
    case "claude":
      return new ClaudeProvider(config);
  }
}
async function generate(context, config) {
  const primary = buildProvider(config.ai.provider, config);
  const errors = [];
  try {
    return await primary.generate(context);
  } catch (err) {
    errors.push(
      `${config.ai.provider}: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  if (config.ai.fallback && config.ai.fallback !== config.ai.provider) {
    const fallback = buildProvider(config.ai.fallback, config);
    try {
      return await fallback.generate(context);
    } catch (err) {
      errors.push(
        `${config.ai.fallback}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
  throw new Error(
    `All providers failed:
${errors.map((e) => `  ${e}`).join("\n")}`
  );
}
var init_providers = __esm({
  "src/providers/index.ts"() {
    "use strict";
    init_cjs_shims();
    init_ollama();
    init_gemini();
    init_claude();
  }
});

// src/agents/readme.ts
var readme_exports = {};
__export(readme_exports, {
  generateReadme: () => generateReadme
});
function buildReadmePrompt(config, fileList) {
  const toc = config.readme.includeToc ? "Include a markdown Table of Contents.\n" : "";
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
async function generateReadme(config) {
  const git = getGit();
  const tracked = await git.raw(["ls-files"]);
  const fileList = tracked.split("\n").map((f) => f.trim()).filter(Boolean);
  const prompt = buildReadmePrompt(config, fileList);
  const content = await generate({ contentType: "readme", prompt }, config);
  const outPath = import_path3.default.join(process.cwd(), "README.md");
  import_fs3.default.writeFileSync(outPath, content, "utf8");
  logger.success(`README written to ${outPath}`);
}
var import_fs3, import_path3;
var init_readme = __esm({
  "src/agents/readme.ts"() {
    "use strict";
    init_cjs_shims();
    import_fs3 = __toESM(require("fs"));
    import_path3 = __toESM(require("path"));
    init_git();
    init_providers();
    init_logger();
  }
});

// src/agents/commit.ts
var commit_exports = {};
__export(commit_exports, {
  generateCommitMessage: () => generateCommitMessage
});
function buildCommitPrompt(config, diff) {
  const { convention, types, maxLength } = config.commit;
  const format = convention === "conventional" ? `type(optional-scope): description

Types: ${types.join(", ")}` : "A short imperative summary of the change";
  return `You are a senior engineer writing a git commit message.

Format: ${format}
Max subject line length: ${maxLength} characters
Mood: Imperative ("Add" not "Added", "Fix" not "Fixed")

Staged diff:
\`\`\`diff
${diff}
\`\`\`

Output only the commit message. No explanation. No code fences.`;
}
async function generateCommitMessage(config) {
  const git = getGit();
  const diff = await git.diff(["--cached"]);
  if (!diff.trim()) {
    throw new Error("No staged changes found. Stage your changes with `git add` first.");
  }
  return generate({ contentType: "commit", prompt: buildCommitPrompt(config, diff) }, config);
}
var init_commit = __esm({
  "src/agents/commit.ts"() {
    "use strict";
    init_cjs_shims();
    init_git();
    init_providers();
  }
});

// src/agents/init.ts
var init_exports = {};
__export(init_exports, {
  runInitWizard: () => runInitWizard
});
async function runInitWizard() {
  logger.info("MCP Config Wizard\n");
  const responses = await (0, import_prompts.default)(
    [
      {
        type: "text",
        name: "projectName",
        message: "Project name?",
        initial: import_path4.default.basename(process.cwd()),
        validate: (v) => {
          if (!v.trim()) return "Name cannot be empty";
          if (/[^a-z0-9-]/i.test(v.trim())) return "Only alphanumeric and hyphens allowed";
          return true;
        }
      },
      {
        type: "list",
        name: "stack",
        message: "Tech stack? (comma-separated)",
        initial: "typescript, node",
        separator: ","
      },
      {
        type: "select",
        name: "provider",
        message: "Primary AI provider?",
        choices: [
          { title: "Ollama (local)", value: "ollama" },
          { title: "Gemini", value: "gemini" },
          { title: "Claude", value: "claude" }
        ]
      },
      {
        type: "select",
        name: "docStyle",
        message: "Documentation style?",
        choices: [
          { title: "TSDoc", value: "tsdoc" },
          { title: "JSDoc", value: "jsdoc" },
          { title: "Google Style", value: "google" }
        ]
      },
      {
        type: "confirm",
        name: "includeToc",
        message: "Include Table of Contents in README?",
        initial: true
      }
    ],
    {
      onCancel: () => {
        logger.warn("Init cancelled");
        process.exit(0);
      }
    }
  );
  const config = {
    project: {
      name: responses.projectName.trim(),
      stack: responses.stack.map((s) => s.trim()).filter(Boolean)
    },
    ai: {
      provider: responses.provider,
      ollamaEndpoint: "http://localhost:11434",
      maxTokens: 2048
    },
    docs: {
      style: responses.docStyle,
      autoGenerate: false,
      examples: true
    },
    commit: {
      convention: "conventional",
      types: ["feat", "fix", "docs", "style", "refactor", "test", "chore"],
      maxLength: 72
    },
    readme: {
      includeToc: responses.includeToc
    }
  };
  const outPath = import_path4.default.join(process.cwd(), ".mcp.yml");
  import_fs4.default.writeFileSync(outPath, import_js_yaml2.default.dump(config), "utf8");
  logger.success(`.mcp.yml written to ${outPath}`);
}
var import_fs4, import_path4, import_js_yaml2, import_prompts;
var init_init = __esm({
  "src/agents/init.ts"() {
    "use strict";
    init_cjs_shims();
    import_fs4 = __toESM(require("fs"));
    import_path4 = __toESM(require("path"));
    import_js_yaml2 = __toESM(require("js-yaml"));
    import_prompts = __toESM(require("prompts"));
    init_logger();
  }
});

// bin/cli.ts
init_cjs_shims();
var import_commander = require("commander");

// src/config/parser.ts
init_cjs_shims();
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_js_yaml = __toESM(require("js-yaml"));

// src/config/schema.ts
init_cjs_shims();
var import_zod = require("zod");
var AIProviderSchema = import_zod.z.enum(["ollama", "gemini", "claude"]);
var AIConfigSchema = import_zod.z.object({
  provider: AIProviderSchema.default("ollama"),
  model: import_zod.z.string().optional(),
  ollamaEndpoint: import_zod.z.string().url().default("http://localhost:11434"),
  maxTokens: import_zod.z.number().int().positive().default(2048),
  fallback: AIProviderSchema.optional()
});
var ProjectConfigSchema = import_zod.z.object({
  name: import_zod.z.string().min(1),
  stack: import_zod.z.array(import_zod.z.string()).min(1)
});
var DocsConfigSchema = import_zod.z.object({
  style: import_zod.z.enum(["jsdoc", "google", "tsdoc"]).default("tsdoc"),
  autoGenerate: import_zod.z.boolean().default(false),
  examples: import_zod.z.boolean().default(true)
});
var CommitConfigSchema = import_zod.z.object({
  convention: import_zod.z.enum(["conventional", "simple"]).default("conventional"),
  types: import_zod.z.array(import_zod.z.string()).default(["feat", "fix", "docs", "style", "refactor", "test", "chore"]),
  maxLength: import_zod.z.number().int().positive().default(72)
});
var ReadmeConfigSchema = import_zod.z.object({
  template: import_zod.z.string().optional(),
  includeToc: import_zod.z.boolean().default(true)
});
var MCPConfigSchema = import_zod.z.object({
  project: ProjectConfigSchema,
  ai: AIConfigSchema.default({}),
  docs: DocsConfigSchema.default({}),
  commit: CommitConfigSchema.default({}),
  readme: ReadmeConfigSchema.default({})
});

// src/config/parser.ts
function loadConfig(cwd = process.cwd()) {
  const configPath = import_path.default.join(cwd, ".mcp.yml");
  if (!import_fs.default.existsSync(configPath)) {
    throw new Error(
      `No .mcp.yml found in ${cwd}. Run \`mcp-docgen init\` to create one.`
    );
  }
  const raw = import_js_yaml.default.load(import_fs.default.readFileSync(configPath, "utf8"));
  const result = MCPConfigSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid .mcp.yml:
${issues}`);
  }
  return result.data;
}

// bin/cli.ts
init_logger();
var program = new import_commander.Command();
program.name("mcp-docgen").description("AI-powered documentation generator for your codebase").version("1.0.0");
program.command("docs").description("Generate README and inline documentation").action(async () => {
  try {
    const config = loadConfig();
    const { generateReadme: generateReadme2 } = await Promise.resolve().then(() => (init_readme(), readme_exports));
    await generateReadme2(config);
    logger.success("Documentation generated");
  } catch (err) {
    logger.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
});
program.command("commit").description("Generate a conventional commit message from staged changes").action(async () => {
  try {
    const config = loadConfig();
    const { generateCommitMessage: generateCommitMessage2 } = await Promise.resolve().then(() => (init_commit(), commit_exports));
    const message = await generateCommitMessage2(config);
    process.stdout.write(message + "\n");
  } catch (err) {
    logger.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
});
program.command("init").description("Initialise a .mcp.yml config file interactively").action(async () => {
  try {
    const { runInitWizard: runInitWizard2 } = await Promise.resolve().then(() => (init_init(), init_exports));
    await runInitWizard2();
  } catch (err) {
    logger.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
});
program.parse(process.argv);
