# GameForge Skills Architecture

## Repository Structure

```
gameforge-skills/
├── skills/                    # All skills (19 total)
│   ├── unity-*/              # Unity skills (15)
│   ├── ue5-*/                # Unreal Engine 5 skills (3)
│   └── game-design-doc/      # Generic game design skill (1)
├── packs/                    # Skill packs (curated bundles)
├── proposals/                # Skill proposals (GFP process)
└── docs/                     # Documentation
```

## Skill Specification

Each skill follows the [Agent Skills](https://github.com/agentskills/agentskills) specification:

```
skills/unity-architect/
├── SKILL.md                  # Main skill definition
├── references/               # Supporting documentation
│   ├── architecture-patterns.md
│   ├── folder-structure.md
│   └── framework-comparison.md
└── scripts/                  # Optional helper scripts
```

## Skill Categories

### Unity Skills (15)
- Architecture & Project Setup
- Graphics & Rendering
- Multiplayer & Networking
- Performance & Optimization
- Tools & Editor Extensions
- UI & Localization
- Audio
- Build & Deployment

### Unreal Engine 5 Skills (3)
- Blueprint programming
- Materials & shaders
- Multiplayer networking

### Generic Skills (1)
- Game Design Document creation

## Distribution

### Free Skills (Public)
- Apache 2.0 license
- Available via git clone
- No registration required
- Community contributions welcome

### Premium Skills (Private)
- Commercial license
- Requires purchase via gameforge.world
- Priority support
- Regular updates

## Quality Standards

- Each skill must include working examples
- Reference documentation must be accurate
- Skills must be tested with target AI agents
- Breaking changes require major version bump

## Contribution Process

See [CONTRIBUTING.md](CONTRIBUTING.md) for the GameForge Proposal (GFP) process.
