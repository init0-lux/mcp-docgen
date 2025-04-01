const fs = require('fs');
const path = require('path');
const { loadMCPConfig } = require('../mcp/parser');

class AIProvider {
  constructor() {
    this.config = loadMCPConfig() || {};
    this.ollamaEndpoint = this.config.ai?.ollamaEndpoint || 'http://localhost:11434';
  }

  /**
   * Main generation method
   * @param {'readme'|'commit'|'docs'} contentType 
   * @param {object} context 
   * @returns {Promise<string>}
   */
  async generate(contentType, context = {}) {
    const { provider = 'ollama' } = this.config.ai || {};
    const prompt = this._buildPrompt(contentType, context);

    try {
      return provider === 'gemini' 
        ? await this._generateWithGemini(prompt) 
        : await this._generateWithOllama(prompt);
    } catch (err) {
      console.error(`${provider} failed:`, err.message);
      // Fallback to the other provider
      return provider === 'gemini'
        ? await this._generateWithOllama(prompt)
        : await this._generateWithGemini(prompt);
    }
  }

  /**
   * Builds MCP-aware prompts
   */
  _buildPrompt(contentType, context) {
    const rules = this.config[contentType] || {};
    const project = this.config.project || {};

    const templates = {
      readme: `[MCP-README]
Project: ${project.name || 'Untitled'}
Tech Stack: ${project.stack?.join(', ') || 'Not specified'}
Template: ${rules.template || 'Default'}

Generate a comprehensive README.md with:
1. Clear installation instructions
2. Usage examples
3. Configuration guidelines
${rules.includeToc ? '4. Table of Contents\n' : ''}
Format: GitHub Flavored Markdown`,

      commit: `[MCP-COMMIT]
${rules.convention === 'conventional' ? 'Conventional Commits Format:' : 'Write a commit message for:'}
\`\`\`
${context.diff || 'No changes provided'}
\`\`\`
Rules:
- Type: ${rules.types?.join(', ') || 'feat, fix, docs, style, refactor, test, chore'}
- Max Length: ${rules.maxLength || 72} chars
- Imperative Mood ("Add" not "Added")`,

      docs: `[MCP-DOCS]
Generate ${rules.style || 'JSDoc'} documentation for:
\`\`\`${context.language || 'javascript'}
${context.code || '// No code provided'}
\`\`\`
Requirements:
1. Follow ${rules.style} standards
2. Describe all parameters
3. ${rules.examples ? 'Include @examples' : 'No examples needed'}
4. Include return types`
    };

    return templates[contentType];
  }

  /**
   * Gemini API Implementation
   */
  async _generateWithGemini(prompt) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: this.config.ai?.model || 'gemini-pro',
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: this.config.ai?.maxTokens || 2048
      }
    });

    const result = await model.generateContent({
      contents: [{
        parts: [{ text: prompt }],
        role: "user"
      }],
      safetySettings: [
        { category: "HARM_CATEGORY_DEROGATORY", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_TOXICITY", threshold: "BLOCK_NONE" }
      ]
    });

    return result.response.text();
  }

  /**
   * Ollama API Implementation
   */
  async _generateWithOllama(prompt) {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.ai?.model || 'codellama',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.5,
          num_ctx: 4096
        }
      })
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
    const data = await response.json();
    return data.response.trim();
  }

  /**
   * Health Check
   */
  async checkProviders() {
    return {
      ollama: await this._checkOllama(),
      gemini: await this._checkGemini()
    };
  }

  async _checkOllama() {
    try {
      const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
      const res = await fetch(`${this.ollamaEndpoint}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async _checkGemini() {
    try {
      return !!process.env.GEMINI_API_KEY;
    } catch {
      return false;
    }
  }
}

module.exports = new AIProvider();
