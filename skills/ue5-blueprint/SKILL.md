---
name: ue5-blueprint
version: 2.0.0
description: "Design Blueprint architecture, C++ integration patterns, and performance optimization for Unreal Engine 5"
engine: unreal
category: architecture
license: Apache-2.0

interface:
  input:
    required:
      - blueprint_requirements        # what systems need Blueprint/C++
    optional:
      - game_type                     # fps, rpg, etc.
      - team_composition              # designers, programmers mix
      - performance_critical          # true/false

  output:
    - type: code                      # Blueprint assets, C++ classes
    - type: architecture              # Blueprint/C++ boundary design
    - type: configuration             # Project settings

  context_blocks:
    - id: blueprint-cpp-boundary
      description: "Design Blueprint vs C++ boundaries"
      references: [blueprint-cpp-boundary.md]
    - id: gas-setup
      description: "Configure Gameplay Ability System"
      references: [gas-setup.md]
    - id: subsystem-patterns
      description: "Implement Engine/Game/World subsystems"
      references: [subsystem-patterns.md]

references:
  - file: references/blueprint-cpp-boundary.md
    relevance: [blueprint, cpp, integration, architecture, performance]
    size: 3KB
    priority: high
  - file: references/gas-setup.md
    relevance: [gas, gameplay-ability, abilities, gameplay-effect, cue]
    size: 3KB
    priority: high
  - file: references/subsystem-patterns.md
    relevance: [subsystem, engine, game, world, local-player, architecture]
    size: 3KB
    priority: medium

triggers:
  keywords:
    - "blueprint"
    - "ue5"
    - "unreal"
    - "unreal engine"
    - "c++"
    - "gameplay ability system"
    - "gas"
    - "subsystem"
    - "actor component"
    - "event dispatcher"
    - "blueprint interface"
  files:
    - "**/*.uasset"
    - "**/*.cpp"
    - "**/*.h"
    - "Source/**/*.Build.cs"
  context:
    - has_unreal_project: true

composition:
  combines_with:
    - ue5-multiplayer            # networked gameplay
    - ue5-materials              # material Blueprints
    - game-design-doc            # GDD implementation
  depends_on: []
  conflicts_with: []
  provides:
    - blueprint-architecture
    - cpp-integration
    - gameplay-abilities

engine_versions:
  unreal:
    minimum: "5.1"
    recommended: "5.3"
    tested: ["5.1", "5.2", "5.3", "5.4"]
  platforms: [windows, macos, linux, ios, android, playstation, xbox]
---

# ue5-blueprint

Design Blueprint architecture, C++ integration patterns, and performance optimization for Unreal Engine 5.

## When to use

Activate when the user mentions:
- Blueprint architecture, Blueprint best practices
- C++ and Blueprint integration
- Blueprint performance, nativization
- GameplayAbilitySystem (GAS) setup
- Blueprint interfaces, event dispatchers
- Actor component design in UE5
- Subsystem architecture

## Capabilities

1. **Architecture** — Blueprint/C++ boundary design, when to use which
2. **Component patterns** — Actor components, interfaces, event dispatchers
3. **GAS setup** — GameplayAbilitySystem configuration and patterns
4. **Performance** — Blueprint optimization, C++ migration strategies
5. **Subsystems** — Engine/Game/World/Local Player subsystems

## Architecture Decision Guide

| Need | Blueprint | C++ | Both |
|------|-----------|-----|------|
| Rapid prototyping | ✅ | | |
| Designer-facing logic | ✅ | | |
| Performance-critical math | | ✅ | |
| Core game framework | | ✅ | |
| Gameplay abilities | | | ✅ (C++ base, BP subclass) |
| AI behavior trees | | | ✅ (C++ tasks, BP trees) |
| UI (UMG) | ✅ | | |

## Engine version support

| Version | Status |
|---------|--------|
| UE 5.4+ | ✅ Full |
| UE 5.3 | ✅ Full |
| UE 5.1-5.2 | ✅ Supported |

## References

- [blueprint-cpp-boundary.md](references/blueprint-cpp-boundary.md) — When to use Blueprint vs C++, integration patterns
- [gas-setup.md](references/gas-setup.md) — GameplayAbilitySystem architecture and configuration
- [subsystem-patterns.md](references/subsystem-patterns.md) — Engine/Game/World subsystems for clean architecture

## Limitations

- Blueprint nativization has limitations (not all nodes supported)
- Complex Blueprint graphs become hard to maintain
- C++ iteration times are slower than Blueprint
- GAS has steep learning curve
