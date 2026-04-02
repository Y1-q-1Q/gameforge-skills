---
name: unity-netcode
version: 2.0.0
description: "Production-ready multiplayer networking for Unity — frame-sync, state-sync, and rollback"
engine: unity
category: networking
license: Apache-2.0

interface:
  input:
    required:
      - game_description
      - sync_model                    # frame-sync | state-sync | rollback | hybrid
    optional:
      - player_count                  # e.g. "5v5", "100+"
      - target_platform
      - unity_version
      - performance_budget
      - transport                     # udp | websocket | relay

  output:
    - type: code
    - type: architecture
    - type: configuration

  context_blocks:
    - id: architecture-selection
      description: "Help user choose sync model based on game type"
      references: [frame-sync-patterns.md, state-sync-patterns.md, rollback-netcode.md]
    - id: frame-sync-implementation
      description: "Generate lockstep/deterministic simulation code"
      references: [frame-sync-patterns.md]
    - id: state-sync-implementation
      description: "Generate server-authoritative state sync code"
      references: [state-sync-patterns.md]
    - id: rollback-implementation
      description: "Generate GGPO-style rollback netcode"
      references: [rollback-netcode.md]

references:
  - file: references/frame-sync-patterns.md
    relevance: [frame-sync, lockstep, deterministic, fixed-point, moba, rts, input-delay]
    size: 8KB
    priority: medium
  - file: references/state-sync-patterns.md
    relevance: [state-sync, server-authority, interpolation, prediction, delta-compression, aoi, fps, mmo]
    size: 7KB
    priority: medium
  - file: references/rollback-netcode.md
    relevance: [rollback, ggpo, prediction, snapshot, fighting-game, input-prediction]
    size: 6KB
    priority: medium

triggers:
  keywords:
    - "multiplayer"
    - "networking"
    - "netcode"
    - "frame sync"
    - "state sync"
    - "rollback"
    - "lockstep"
    - "server authoritative"
    - "client prediction"
    - "lag compensation"
  files:
    - "**/NetworkManager.cs"
    - "**/NetcodeBootstrap.cs"
    - "Packages/com.unity.netcode.gameobjects/**"
  context:
    - has_unity_project: true
    - has_multiplayer_intent: true

composition:
  combines_with:
    - unity-architect          # project structure for multiplayer
    - unity-hybridclr          # hot-update multiplayer code
    - unity-addressables       # remote asset delivery
    - unity-performance        # network + rendering budget
  depends_on: []
  conflicts_with: []
  provides:
    - multiplayer-architecture
    - sync-model-selection
    - network-transport

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android]
  render_pipelines: [built-in, urp, hdrp]
---

# unity-netcode

Generate production-ready multiplayer networking code for Unity games. Covers frame-sync (lockstep), state-sync (server authoritative), and rollback (GGPO-style) — with architecture selection guidance based on your game type.

## When to use

Activate when the user wants to:
- Implement multiplayer networking in Unity
- Choose between frame-sync, state-sync, or rollback
- Build deterministic simulation for competitive games
- Implement input prediction and rollback
- Set up lobby, matchmaking, or room systems
- Sync game state across clients

## Capabilities

Given a multiplayer game description, this skill generates:

1. **Architecture selection** — frame-sync vs state-sync vs hybrid, with reasoning
2. **Network transport layer** — connection, serialization, message routing
3. **Input handling** — input collection, prediction, and rollback
4. **State synchronization** — snapshot interpolation, delta compression
5. **Deterministic simulation** — fixed-point math, deterministic physics
6. **Lobby & matchmaking** — room creation, player management
7. **Lag compensation** — client-side prediction, server reconciliation

## Architecture Decision Guide

| Game Type | Recommended | Why |
|-----------|-------------|-----|
| MOBA / RTS | Frame-sync (lockstep) | Small input, large state, determinism required |
| FPS / TPS | State-sync (server authority) | Fast-paced, physics-heavy, cheat prevention |
| Fighting | Rollback netcode | Frame-perfect input, low player count |
| MMO | State-sync (area of interest) | Massive state, many players |
| Turn-based | Simple state-sync | Low frequency, no prediction needed |
| Racing | State-sync + prediction | Physics-heavy, visual smoothing critical |
| Co-op PvE | State-sync (relaxed) | Less cheat concern, prioritize feel |

## Usage examples

### Input
```
Create a frame-sync multiplayer system for a 2D MOBA game:
- 5v5 players
- Deterministic simulation
- Input prediction with rollback
- Target: 60fps lockstep
- Transport: UDP
```

### Output
The skill generates complete networking architecture including transport layer, input manager, lockstep simulation loop, rollback system, and lobby management.

## References

- [frame-sync-patterns.md](references/frame-sync-patterns.md) — Lockstep and deterministic simulation
- [state-sync-patterns.md](references/state-sync-patterns.md) — Server-authoritative state synchronization
- [rollback-netcode.md](references/rollback-netcode.md) — Rollback and prediction systems

## Limitations

- Does not include server deployment (use unity-build for CI/CD)
- Relay/TURN server setup requires external infrastructure
- NAT traversal depends on transport library choice
- Deterministic physics requires custom implementation (Unity's PhysX is non-deterministic)
