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
