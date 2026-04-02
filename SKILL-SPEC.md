# GameForge SKILL.md Specification v2

This document defines the standard format for GameForge skill definitions.

## Overview

GameForge skills are **code-template libraries** — not black-box packages. When installed, the source code is copied directly into the user's project. Users own the code and can modify it freely.

## SKILL.md Format

```yaml
---
# === Required Metadata ===
name: skill-name                    # kebab-case, unique identifier
version: 1.0.0                      # semver
description: "One-line description"
engine: unity | unreal | godot | any
category: architecture | networking | rendering | ui | audio | animation | build | testing | tools | design
license: Apache-2.0

# === LLM-Agnostic Interface (P0 — vendor-neutral) ===
# Skills define WHAT context to provide, not HOW to prompt a specific LLM.
# The AI agent runtime adapts these to its own prompt format.
interface:
  # What the user provides
  input:
    required:
      - game_description              # free-text: what kind of game
    optional:
      - target_platform               # e.g. mobile, pc, console
      - team_size                     # solo, small, large
      - unity_version                 # e.g. 2022.3, 6000.0
      - performance_budget            # e.g. "60fps mobile"

  # What the skill produces
  output:
    - type: code                      # C# scripts, shaders, etc.
    - type: architecture              # folder structure, design docs
    - type: configuration             # .asmdef, project settings

  # Structured context blocks — agent loads these as-is, no prompt engineering
  context_blocks:
    - id: architecture-selection
      description: "Help user choose the right architecture"
      references: [architecture-patterns.md, design-patterns.md]
    - id: implementation
      description: "Generate production code"
      references: [folder-structures.md, assembly-definitions.md]

# === Smart Context Loading (P0 — from Claude Code analysis) ===
# Each reference has a relevance tag. Agent loads only what's needed.
references:
  - file: references/architecture-patterns.md
    relevance: [architecture, patterns, singleton, service-locator, event-bus]
    size: 6KB
    priority: high        # always load when skill is active
  - file: references/design-patterns.md
    relevance: [patterns, mvc, strategy, factory, flyweight, command, observer]
    size: 5KB
    priority: medium      # load when user asks about patterns
  - file: references/folder-structures.md
    relevance: [folders, project-setup, organization, naming]
    size: 3KB
    priority: medium
  - file: references/assembly-definitions.md
    relevance: [asmdef, compile-time, code-isolation]
    size: 2KB
    priority: low         # load only when specifically relevant

# === Activation Triggers (P1 — from VSCode) ===
# Conditions that cause an AI agent to automatically activate this skill.
# Agent monitors user input and project context for these signals.
triggers:
  # Keyword triggers — user mentions these terms
  keywords:
    - "project architecture"
    - "folder structure"
    - "design pattern"
    - "assembly definition"
    - "project setup"

  # File triggers — these files/patterns exist in the project
  files:
    - "Assets/Scripts/Managers/*.cs"
    - "*.asmdef"

  # Context triggers — detected in project analysis
  context:
    - has_unity_project: true

# === Composition (P1 — from LangChain chains) ===
# How this skill relates to others
composition:
  # Skills that work well together
  combines_with:
    - unity-netcode          # architecture for multiplayer games
    - unity-performance      # performance-aware architecture
    - unity-ecs              # DOTS architecture variant

  # Skills this one depends on (installed automatically)
  depends_on: []

  # Skills that conflict (cannot be used simultaneously)
  conflicts_with: []

  # What this skill provides to others
  provides:
    - project-structure       # other skills can reference the generated structure
    - coding-conventions      # other skills follow these conventions

# === Engine Compatibility ===
engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android, webgl]
  render_pipelines: [built-in, urp, hdrp]
---
```

## Markdown Body

After the YAML frontmatter, the SKILL.md body follows this structure:

```markdown
# {skill-name}

{One paragraph description of what this skill does.}

## When to use

Activate when the user wants to:
- {trigger condition 1}
- {trigger condition 2}

## Capabilities

{Numbered list of what the skill generates}

## Usage examples

### Input
{Example user request}

### Output
{Description of what gets generated}

## References

- [file.md](references/file.md) — {description}

## Limitations

- {What this skill cannot do}
```

## Design Principles

### 1. Copy-Paste Ownership (from shadcn/ui)
Skills are code templates. Once installed, the code belongs to the user. No runtime dependency on GameForge. Users can and should modify the generated code.

### 2. Vendor-Neutral AI Interface (from Vercel AI SDK)
Skills define `interface.input`, `interface.output`, and `context_blocks` — not LLM-specific prompts. Any AI agent (Claude, GPT, Gemini, local models) can consume these skills through its own prompt adaptation layer.

### 3. Smart Context Loading (from Claude Code)
Each reference file has `relevance` tags and `priority` levels. AI agents load only the references relevant to the current task, avoiding token waste. Priority levels:
- `high` — always loaded when skill is active
- `medium` — loaded when topic is relevant
- `low` — loaded only on specific request

### 4. Declarative Activation (from VSCode)
Skills declare their `triggers` — keywords, file patterns, and context conditions. AI agents use these to automatically suggest or activate skills without explicit user commands.

### 5. Composable Skills (from LangChain)
Skills declare `combines_with`, `depends_on`, `conflicts_with`, and `provides`. This enables skill-packs (curated combinations) and prevents incompatible skills from being used together.

### 6. Community-Driven Evolution (from Godot GEPs)
New skills and spec changes go through the GameForge Proposal (GFP) process. See `proposals/GFP-TEMPLATE.md`.
