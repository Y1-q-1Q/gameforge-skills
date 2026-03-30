<div align="center">

# 🎮 GameForge Skills

**AI-powered Agent Skills for game development.**

Unity architecture · Shaders · Netcode · Hot-reload · Performance · And more.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-15-brightgreen.svg)](#skills-catalog)
[![Unity](https://img.shields.io/badge/Unity-2021.3%2B-black.svg)](https://unity.com)

[Getting Started](#getting-started) · [Skills Catalog](#skills-catalog) · [Premium](#premium-skills) · [Contributing](#contributing) · [Docs](https://gameforge.world)

</div>

---

## What is this?

GameForge Skills is a collection of **Agent Skills** that give AI coding assistants deep knowledge of game development. Install a skill, and your AI agent instantly understands Unity architecture patterns, shader programming, multiplayer netcode, hot-reload systems, and more.

**Works with:** OpenClaw, Claude Code, Codex CLI, and any agent that supports the [Agent Skills](https://github.com/agentskills/agentskills) specification.

### Before GameForge Skills

```
You: "Create a frame-sync multiplayer system for my Unity game"
AI:  *generates generic networking code that doesn't work in Unity*
```

### After GameForge Skills

```
You: "Create a frame-sync multiplayer system for my Unity game"
AI:  *generates production-ready lockstep architecture with input prediction,
      rollback, deterministic physics, and proper Unity integration*
```

---

## Getting Started

### Option 1: Clone (recommended)

```bash
git clone https://github.com/Y1-q-1Q/gameforge-skills.git ~/.gameforge-skills
```

Then point your agent to the skills directory. For OpenClaw, add to your config:

```yaml
skills:
  - ~/.gameforge-skills/skills/unity-architect
  - ~/.gameforge-skills/skills/unity-shader
  # ... add the skills you need
```

### Option 2: Copy individual skills

Each skill is self-contained in its own directory. Just copy the ones you need:

```bash
cp -r gameforge-skills/skills/unity-netcode ~/.your-agent/skills/
```

---

## Skills Catalog

### 🏗️ Architecture & Project Setup

| Skill | Description | Difficulty |
|-------|-------------|------------|
| [unity-architect](skills/unity-architect/) | Project architecture generation — folder structure, design patterns, framework selection | ⭐⭐ |
| [game-design-doc](skills/game-design-doc/) | GDD (Game Design Document) creation and analysis | ⭐ |

### ✨ Graphics & Rendering

| Skill | Description | Difficulty |
|-------|-------------|------------|
| [unity-shader](skills/unity-shader/) | ShaderLab/HLSL code generation for URP, HDRP, and Built-in | ⭐⭐⭐ |

### 🌐 Multiplayer & Networking

| Skill | Description | Difficulty |
|-------|-------------|------------|
| [unity-netcode](skills/unity-netcode/) | Frame-sync, state-sync, and hybrid networking architectures | ⭐⭐⭐ |

### 📦 Asset Management

| Skill | Description | Difficulty |
|-------|-------------|------------|
| [unity-addressables](skills/unity-addressables/) | Addressables configuration, group strategies, and loading patterns | ⭐⭐ |
| [unity-hybridclr](skills/unity-hybridclr/) | HybridCLR hot-reload setup and configuration | ⭐⭐⭐ |

### 🎨 UI & Interaction

| Skill | Description | Difficulty |
|-------|-------------|------------|
| [unity-ui](skills/unity-ui/) | UGUI and UI Toolkit code generation with responsive layouts | ⭐⭐ |

### 🎬 Animation & Audio

| Skill | Description | Difficulty |
|-------|-------------|------------|
| [unity-animation](skills/unity-animation/) | Animator controllers, state machines, and Timeline | ⭐⭐ |
| [unity-audio](skills/unity-audio/) | Audio system setup, spatial audio, and mixer configuration | ⭐⭐ |

### ⚡ Performance & Optimization

| Skill | Description | Difficulty |
|-------|-------------|------------|
| [unity-performance](skills/unity-performance/) | Profiling, memory optimization, draw call batching, mobile tuning | ⭐⭐⭐ |
| [unity-ecs](skills/unity-ecs/) | ECS/DOTS architecture with Jobs System and Burst Compiler | ⭐⭐⭐ |

### 📱 Build & Deploy

| Skill | Description | Difficulty |
|-------|-------------|------------|
| [unity-build](skills/unity-build/) | Multi-platform build automation and CI/CD | ⭐⭐ |

### 🧪 Testing & Tools

| Skill | Description | Difficulty |
|-------|-------------|------------|
| [unity-testing](skills/unity-testing/) | Test Framework setup, PlayMode and EditMode tests | ⭐⭐ |
| [unity-editor-tools](skills/unity-editor-tools/) | Custom inspectors, editor windows, and property drawers | ⭐⭐ |

### 🌍 Localization

| Skill | Description | Difficulty |
|-------|-------------|------------|
| [unity-localization](skills/unity-localization/) | Unity Localization package setup and multi-language workflows | ⭐ |

---

## Premium Skills

For professional and enterprise game development, we offer premium skills with advanced architectures and production-tested patterns.

| Skill | What you get |
|-------|-------------|
| **unity-multiplayer-pro** | Complete multiplayer game architecture — lobby, matchmaking, rollback netcode, server authority, anti-cheat |
| **unity-hybridclr-pro** | Enterprise hot-reload — differential updates, version management, rollback, A/B testing |
| **unity-addressables-pro** | Large-scale asset management — CDN integration, delta patching, memory budgets, asset dependency analysis |
| **unity-architecture-pro** | Battle-tested project templates for MOBA, RPG, FPS, and casual genres |

→ [gameforge.world/premium](https://gameforge.world/premium)

---

## Why GameForge Skills?

### 🎯 Built by game developers, for game developers

These skills aren't generated by AI reading Unity docs. They're built from **real production experience** — shipping multiplayer mobile games, managing million-asset projects, and debugging frame-sync desync issues at 3 AM.

### 🔒 Production-grade code quality

Every generated code snippet follows:
- Unity C# coding conventions
- XML documentation comments
- GC-allocation-aware patterns (no `foreach` on collections in hot paths)
- Mobile-first performance considerations
- Object pooling where appropriate

### 🌏 Bilingual (English + 中文)

All skills support both English and Chinese prompts and documentation. Because half the world's Unity developers speak Chinese.

---

## Supported Unity Versions

| Version | Status |
|---------|--------|
| Unity 6+ (6000.x) | ✅ Full support |
| Unity 2022.3 LTS | ✅ Full support |
| Unity 2021.3 LTS | ✅ Supported |
| Unity 2020.3 | ⚠️ Partial (no URP 14+, no UI Toolkit) |

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Ways to contribute:**
- 🐛 Report issues with generated code
- 📝 Improve reference documentation
- 🆕 Submit new skills (see [Skill Development Guide](docs/skill-development.md))
- 🌐 Improve translations

---

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with 🎮 by [tinyfish](https://github.com/Y1-q-1Q) & [IceBaby 🧊](https://gameforge.world)**

[Website](https://gameforge.world) · [Docs](https://gameforge.world/docs) · [Premium](https://gameforge.world/premium) · [Discord](https://discord.gg/gameforge)

</div>
