# GameForge Skill-Pack Specification

## What is a Skill-Pack?

A skill-pack is a curated combination of skills that solve a complete problem together. Individual skills handle single concerns; packs combine them with glue logic for real-world scenarios.

Think of it like this:
- **Skill** = a single ingredient (flour, eggs, sugar)
- **Skill-Pack** = a recipe (cake = flour + eggs + sugar + instructions)

## Pack Structure

```
packs/
└── multiplayer-hotupdate/
    ├── PACK.md                    # Pack definition
    └── glue/                      # Integration code between skills
        ├── network-hotupdate-bridge.md
        └── deployment-checklist.md
```

## PACK.md Format

```yaml
---
name: multiplayer-hotupdate
version: 1.0.0
description: "Complete multiplayer game with hot-update support"
engine: unity

# Skills included in this pack
skills:
  - unity-netcode           # multiplayer networking
  - unity-hybridclr         # hot-update via HybridCLR
  - unity-addressables      # asset management + remote delivery
  - unity-architect         # project architecture foundation

# Installation order matters — dependencies first
install_order:
  - unity-architect          # 1. project structure
  - unity-addressables       # 2. asset pipeline
  - unity-hybridclr          # 3. hot-update system
  - unity-netcode            # 4. networking layer

# What makes this pack more than the sum of its parts
glue:
  - file: glue/network-hotupdate-bridge.md
    description: "How to hot-update multiplayer code without breaking connections"
  - file: glue/deployment-checklist.md
    description: "End-to-end deployment: build → patch → CDN → client update"

# Target scenarios
scenarios:
  - "MOBA with live-ops and frequent balance patches"
  - "Co-op game with seasonal content updates"
  - "Competitive game needing server-authoritative + client hot-fix"
---

# multiplayer-hotupdate

Build a complete multiplayer game with hot-update capability — the holy grail of mobile game development in China.

## Why this pack exists

Using unity-netcode alone gives you multiplayer. Using unity-hybridclr alone gives you hot-update. But making them work **together** — hot-updating multiplayer code without breaking active connections, syncing asset versions across clients, rolling back failed patches — that's where the real complexity lives.

This pack provides the glue logic that no individual skill covers.

## What you get

1. **Project architecture** optimized for multiplayer + hot-update separation
2. **Networking layer** with version-aware protocol negotiation
3. **HybridCLR integration** with assembly splitting for network code
4. **Addressables pipeline** with differential updates and CDN failover
5. **Glue logic** — the hard part: how these four systems interact

## Glue highlights

### Network ↔ HotUpdate Bridge
- Assembly splitting strategy: which code goes in hot-update DLLs
- Protocol versioning: old client talks to new server
- Graceful reconnection after hot-update

### Deployment Pipeline
- Build → Generate patch → Upload to CDN → Version manifest → Client check
- Rollback strategy if patch breaks networking
- A/B testing with version gates
```

## Design Principles

1. **Packs don't duplicate** — they reference existing skills and add glue
2. **Glue is the value** — the integration knowledge is what users can't figure out alone
3. **Install order matters** — packs define dependency order
4. **Scenarios drive packs** — each pack targets specific real-world use cases
