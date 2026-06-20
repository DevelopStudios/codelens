# CodeLens: In-Browser AI Code Review

<p align="center">
  <img src="https://via.placeholder.com/200x200/58a6ff/ffffff?text=CodeLens" alt="CodeLens Logo" width="120">
</p>

<p align="center">
  <em>Privacy-first AI code review powered by local machine learning</em>
</p>

---

<p align="center">
  <a href="#features">✨ Features</a> •
  <a href="#how-it-works">🚀 How It Works</a> •
  <a href="#requirements">💻 Requirements</a> •
  <a href="#development">🛠️ Development</a> •
  <a href="#architecture">🏗️ Architecture</a> •
  <a href="#license">📜 License</a>
</p>

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔒 **Local AI Processing** | All code analysis happens in your browser — **no data leaves your device** |
| 🎯 **Four Review Modes** | General, Performance, Security, and Accessibility — each with tailored prompts |
| 🚀 **Streaming Output** | Real-time, markdown-formatted feedback as the AI generates responses |
| 💡 **Syntax Highlighting** | Custom code editor with line numbers and language-aware highlighting |
| ⚡ **WebGPU Acceleration** | Hardware-accelerated inference — **no cloud required**, just your GPU |
| 🌐 **Zero Dependencies** | No API keys, no cloud services, no external servers — 100% offline |
| 🧪 **Comprehensive Testing** | 65+ tests covering components, hooks, utilities, and workers with 75%+ code coverage |

---

## 🚀 How It Works

1. **Paste Code** — Enter your code into the editor  
2. **Select Focus** — Choose a review mode: General, Performance, Security, or Accessibility  
3. **Start Review** — Click “Review” to begin  
4. **Local Inference** — Qwen2.5-Coder-1.5B loads into your browser via WebLLM  
5. **Real-time Feedback** — AI processes code locally using WebGPU and streams results  
6. **Structured Output** — Results appear in formatted markdown with syntax highlighting  

> 💡 **Privacy First**: Your code never leaves your browser. All processing occurs locally using WebGPU.

---

## 💻 Requirements

| Component | Requirement |
|----------|-------------|
| **Browser** | Chrome 113+, Edge 113+, or Chrome Canary (WebGPU required) |
| **GPU** | At least 2GB VRAM recommended |
| **Note** | Safari and Firefox do not currently support WebGPU by default |

> ⚠️ **Important**: If you see *“WebGPU not supported”*, enable it in Chrome:  
> Go to `chrome://flags/#enable-unsafe-webgpu` → **Enable** → Relaunch.

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/codelens.git
cd codelens

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

The built application will be in the `dist/` directory.

---

## 🚀 Deployment

Deploy to Netlify with these headers automatically configured in `netlify.toml`:

```toml
[[headers]]
for = "/*"
[headers.values]
Cross-Origin-Embedder-Policy = "require-corp"
Cross-Origin-Opener-Policy = "same-origin"
```

These headers are **required** for WebGPU functionality and are pre-configured.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                       CodeLens Application                         │
├────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐     ┌───────────────────────┐     ┌─────────────┐ │
│ │   React UI   │─────▶   Web Worker (LLM)    │─────▶   WebGPU    │ │
│ │  (Frontend)  │     │    (Inference Engine) │     │  (Hardware) │ │
│ └──────────────┘     └───────────────────────┘     └─────────────┘ │
│        ▲                    ▲                    ▲                   │
│        │                    │                    │                   │
│        └── Code Editor ─────┘                    │                   │
│        └── Markdown Renderer ────────────────────┘                   │
└────────────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19 + TypeScript  
- **Build System**: Vite  
- **AI Engine**: `@mlc-ai/web-llm` with Qwen2.5-Coder-1.5B-Instruct  
- **Worker Architecture**: Web Worker for non-blocking inference  
- **UI**: Custom syntax-highlighted editor + streaming markdown renderer  

---

## 📜 License

MIT

> **Privacy Notice**: Your code never leaves your browser. All processing occurs locally using WebGPU. No data is sent to external servers.

> **Note**: The Qwen2.5-Coder-1.5B model is approximately 1GB in size and will be downloaded on first use — this may take several minutes depending on your internet connection.