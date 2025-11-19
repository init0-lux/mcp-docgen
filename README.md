# mcp-docgen

AI-powered documentation generator for your codebase. Automatically generates README files, inline documentation comments, and conventional commit messages using local or cloud-based AI providers.

## Prerequisites

- **Node.js** ≥ 18
- One of the following AI providers configured:
  - [Ollama](https://ollama.ai) running locally (default)
  - A [Gemini](https://ai.google.dev/) API key (`GEMINI_API_KEY` environment variable)
  - An [Anthropic](https://console.anthropic.com/) API key (`ANTHROPIC_API_KEY` environment variable)

## Installation

```bash
npm install -g mcp-docgen
```

## Quick Start

```bash
# 1. Initialise a config file in your project root
mcp-docgen init

# 2. Generate a README based on your project's source files
mcp-docgen docs

# 3. Generate a commit message from staged changes
git add .
mcp-docgen commit
```

## Commands

| Command     | Description                                         |
|-------------|-----------------------------------------------------|
| `init`      | Interactive wizard to create `.mcp.yml`             |
| `docs`      | Generate README and inline documentation            |
| `commit`    | Generate a conventional commit message from `git diff --cached` |

## Configuration

All configuration lives in `.mcp.yml` at your project root. The file is created by `mcp-docgen init` and can be edited manually.

### Reference

| Field                    | Type     | Default                                      | Description                                |
|--------------------------|----------|----------------------------------------------|--------------------------------------------|
| `project.name`           | string   | *(required)*                                 | Project name                               |
| `project.stack`          | string[] | *(required)*                                 | Tech stack tags                            |
| `ai.provider`            | string   | `ollama`                                     | AI provider (`ollama`, `gemini`, `claude`) |
| `ai.model`               | string   | provider-specific                            | Model name                                 |
| `ai.ollamaEndpoint`      | string   | `http://localhost:11434`                     | Ollama server URL                          |
| `ai.maxTokens`           | integer  | `2048`                                       | Maximum output tokens                      |
| `ai.fallback`            | string   | *(optional)*                                 | Fallback provider if primary fails         |
| `docs.style`             | string   | `tsdoc`                                      | Doc comment style (`tsdoc`, `jsdoc`, `google`) |
| `docs.autoGenerate`      | boolean  | `false`                                      | Auto-generate on save (future)             |
| `docs.examples`          | boolean  | `true`                                       | Include `@example` blocks                  |
| `commit.convention`      | string   | `conventional`                               | Commit style (`conventional`, `simple`)    |
| `commit.types`           | string[] | `[feat, fix, docs, style, refactor, test, chore]` | Allowed commit types              |
| `commit.maxLength`       | integer  | `72`                                         | Max subject line length                    |
| `readme.template`        | string   | *(optional)*                                 | Custom README template path                |
| `readme.includeToc`      | boolean  | `true`                                       | Include Table of Contents in README        |

### Example `.mcp.yml`

```yaml
project:
  name: my-project
  stack:
    - typescript
    - node

ai:
  provider: ollama
  model: codellama
  ollamaEndpoint: http://localhost:11434
  maxTokens: 2048

docs:
  style: tsdoc
  autoGenerate: false
  examples: true

commit:
  convention: conventional
  maxLength: 72

readme:
  includeToc: true
```

## Provider Setup

### Ollama (local)

1. [Install Ollama](https://ollama.ai) and start the server:
   ```bash
   ollama serve
   ```
2. Pull a model (e.g. CodeLlama):
   ```bash
   ollama pull codellama
   ```
3. Set `ai.provider: ollama` in `.mcp.yml`.

### Gemini

1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Set the environment variable:
   ```bash
   export GEMINI_API_KEY="your-key-here"
   ```
3. Set `ai.provider: gemini` in `.mcp.yml`.

### Claude

1. Obtain an API key from the [Anthropic Console](https://console.anthropic.com/).
2. Set the environment variable:
   ```bash
   export ANTHROPIC_API_KEY="your-key-here"
   ```
3. Set `ai.provider: claude` in `.mcp.yml`.

## Development

```bash
git clone <repo-url>
cd mcp-docgen
npm install
npm run dev          # run with tsx (hot reload)
npm run build        # compile to dist/
npm test             # run test suite
npm run typecheck    # type-check without emitting
```

## License

MIT