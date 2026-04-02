---
name: ue5-multiplayer
version: 2.0.0
description: "Implement multiplayer in Unreal Engine 5: replication, RPCs, dedicated servers, and EOS integration"
engine: unreal
category: networking
license: Apache-2.0

interface:
  input:
    required:
      - multiplayer_requirements      # game type, player count
    optional:
      - server_type                   # listen, dedicated
      - platform                      # pc, console, cross-play
      - eos_required                  # true/false

  output:
    - type: code                      # GameMode, PlayerState, etc.
    - type: architecture              # Network architecture design
    - type: configuration             # Network settings, EOS config

  context_blocks:
    - id: replication-guide
      description: "Implement property replication and RPCs"
      references: [replication-guide.md]
    - id: dedicated-server
      description: "Set up dedicated server builds"
      references: [dedicated-server.md]
    - id: eos-integration
      description: "Integrate Epic Online Services"
      references: [eos-integration.md]

references:
  - file: references/replication-guide.md
    relevance: [replication, rpc, repnotify, authority, network]
    size: 3KB
    priority: high
  - file: references/dedicated-server.md
    relevance: [dedicated, server, gamemode, authority, build]
    size: 3KB
    priority: high
  - file: references/eos-integration.md
    relevance: [eos, epic, online, session, matchmaking, voice]
    size: 3KB
    priority: medium

triggers:
  keywords:
    - "multiplayer"
    - "replication"
    - "rpc"
    - "dedicated server"
    - "listen server"
    - "eos"
    - "epic online services"
    - "network prediction"
    - "lag compensation"
    - "session"
    - "matchmaking"
    - "ue5 networking"
  files:
    - "**/*GameMode*.cpp"
    - "**/*GameMode*.h"
    - "**/*PlayerState*.cpp"
    - "**/*PlayerController*.cpp"
    - "Source/**/*Replication*.cpp"
  context:
    - has_unreal_project: true
    - has_multiplayer_intent: true

composition:
  combines_with:
    - ue5-blueprint              # gameplay networking
    - game-design-doc            # multiplayer design
  depends_on: []
  conflicts_with: []
  provides:
    - multiplayer-architecture
    - replication-system
    - online-services

engine_versions:
  unreal:
    minimum: "5.1"
    recommended: "5.3"
    tested: ["5.1", "5.2", "5.3", "5.4"]
  platforms: [windows, macos, linux, ios, android, playstation, xbox]
---

# ue5-multiplayer

Implement multiplayer in Unreal Engine 5: replication, RPCs, dedicated servers, and EOS integration.

## When to use

Activate when the user mentions:
- UE5 multiplayer, replication, RPCs
- Dedicated server in Unreal
- Epic Online Services (EOS) integration
- Network prediction, lag compensation
- Listen server vs dedicated server
- Session management, matchmaking in UE5

## Capabilities

1. **Replication** — Property replication, RepNotify, conditions
2. **RPCs** — Server/Client/Multicast function calls
3. **Dedicated server** — Server build, authority patterns
4. **EOS** — Epic Online Services for sessions, matchmaking, voice

## Architecture Decision Guide

| Game Type | Architecture | Why |
|-----------|-------------|-----|
| Co-op PvE (2-4 players) | Listen server | Simple, one player hosts |
| Competitive PvP | Dedicated server | Anti-cheat, fairness |
| MMO-lite (32+ players) | Dedicated server | Performance, authority |
| Local multiplayer | No networking | Split screen / shared input |

## Engine version support

| Version | Status |
|---------|--------|
| UE 5.4+ | ✅ Full (enhanced replication) |
| UE 5.3 | ✅ Full |
| UE 5.1-5.2 | ✅ Supported |

## References

- [replication-guide.md](references/replication-guide.md) — Property replication, RepNotify, RPCs, authority
- [dedicated-server.md](references/dedicated-server.md) — Server build, GameMode, authority patterns
- [eos-integration.md](references/eos-integration.md) — Epic Online Services setup, sessions, matchmaking

## Limitations

- Replication graph requires manual setup for large player counts
- Network prediction is complex for custom movement
- EOS requires Epic Games account setup
- Console certification has additional networking requirements
