---
name: unity-architect
version: 2.0.0
description: "Generate production-ready Unity project architectures from game descriptions — folder structure, design patterns, and assembly definitions"
engine: unity
category: architecture
license: Apache-2.0

interface:
  input:
    required:
      - game_description              # genre, core mechanics, target platform
    optional:
      - team_size                     # solo, small, large
      - target_platform               # mobile, pc, console
      - unity_version                 # e.g. 2022.3, 6000.0
      - performance_budget            # e.g. "60fps mobile"

  output:
    - type: architecture              # folder structure, design docs
    - type: code                      # core framework scripts
    - type: configuration             # .asmdef, project settings

  context_blocks:
    - id: architecture-selection
      description: "Help user choose the right architecture pattern"
      references: [architecture-patterns.md, design-patterns.md]
    - id: project-structure
      description: "Generate folder structure and organization"
      references: [folder-structures.md]
    - id: code-isolation
      description: "Set up assembly definitions for compile times"
      references: [assembly-definitions.md]

references:
  - file: references/architecture-patterns.md
    relevance: [architecture, patterns, singleton, service-locator, event-bus, mvc, mvp]
    size: 8KB
    priority: high
  - file: references/design-patterns.md
    relevance: [patterns, mvc, strategy, factory, flyweight, command, observer]
    size: 6KB
    priority: medium
  - file: references/folder-structures.md
    relevance: [folders, project-setup, organization, naming, feature-based]
    size: 8KB
    priority: high
  - file: references/assembly-definitions.md
    relevance: [asmdef, compile-time, code-isolation, dependencies]
    size: 2KB
    priority: medium

triggers:
  keywords:
    - "project architecture"
    - "folder structure"
    - "design pattern"
    - "assembly definition"
    - "project setup"
    - "folder organization"
    - "project framework"
    - "code structure"
  files:
    - "Assets/Scripts/Managers/*.cs"
    - "*.asmdef"
    - "Assets/Scripts/*Manager.cs"
  context:
    - has_unity_project: true
    - is_new_project: true

composition:
  combines_with:
    - unity-netcode          # architecture for multiplayer games
    - unity-performance      # performance-aware architecture
    - unity-ecs              # DOTS architecture variant
    - unity-addressables     # asset management structure
    - unity-testing          # testable architecture
  depends_on: []
  conflicts_with: []
  provides:
    - project-structure
    - coding-conventions
    - architecture-patterns

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android, webgl]
  render_pipelines: [built-in, urp, hdrp]
---

# unity-architect

Generate production-ready Unity project architectures from game descriptions.

## When to use

Activate when the user wants to:
- Start a new Unity project and needs architecture guidance
- Design folder structure for a game project
- Choose design patterns for a specific game type
- Set up a project framework with proper separation of concerns

## Capabilities

Given a game description (genre, core mechanics, target platform, team size), this skill generates:

1. **Folder structure** — organized by feature, not by type
2. **Core framework** — entry point, game manager, scene management
3. **Design pattern selection** — which patterns fit this game type and why
4. **Assembly definitions** — proper code isolation for compile times
5. **Third-party recommendations** — packages and assets that fit the project
6. **Coding conventions** — project-specific C# style guide

## Usage examples

### Input
```
Create a Unity project architecture for a 2D roguelike with:
- Procedural dungeon generation
- Turn-based combat
- Inventory system
- Pixel art style
- Target: Mobile (iOS/Android)
- Team: Solo developer
```

### Output
The skill will generate a complete architecture document including folder structure, core scripts, assembly definitions, and recommended packages.

## Supported game types

- Action / Platformer
- RPG / ARPG
- MOBA / Battle Arena
- FPS / TPS
- Roguelike / Roguelite
- Puzzle / Casual
- Strategy / Tower Defense
- Racing
- Fighting
- Simulation / Management
- Multiplayer (any genre)

## Unity version support

| Version | Status |
|---------|--------|
| Unity 6+ | ✅ Full |
| 2022.3 LTS | ✅ Full |
| 2021.3 LTS | ✅ Supported |

## References

- [architecture-patterns.md](references/architecture-patterns.md) — Common Unity architecture patterns
- [folder-structures.md](references/folder-structures.md) — Folder organization strategies
- [design-patterns.md](references/design-patterns.md) — Design patterns for game development
- [assembly-definitions.md](references/assembly-definitions.md) — Assembly definition best practices

## Limitations

- Does not generate actual game logic (use other skills for that)
- Architecture recommendations are opinionated based on production experience
- Custom engine integrations (e.g., custom render pipelines) require manual adjustment
