---
name: multiplayer-hotupdate
version: 1.0.0
description: "Complete multiplayer game with hot-update — the holy grail of mobile game dev"
engine: unity

skills:
  - unity-architect
  - unity-addressables
  - unity-hybridclr
  - unity-netcode

install_order:
  - unity-architect
  - unity-addressables
  - unity-hybridclr
  - unity-netcode

glue:
  - file: glue/network-hotupdate-bridge.md
    description: "Hot-update multiplayer code without breaking connections"
  - file: glue/deployment-pipeline.md
    description: "End-to-end: build → patch → CDN → client update"

scenarios:
  - "MOBA with live-ops and frequent balance patches"
  - "Co-op game with seasonal content updates"
  - "Competitive game needing server-authoritative + client hot-fix"
---

# multiplayer-hotupdate

Build a complete multiplayer game with hot-update capability. This is the combination that every serious mobile game studio in China needs, and the integration knowledge that takes months to figure out alone.

## Why this pack exists

- `unity-netcode` alone = multiplayer
- `unity-hybridclr` alone = hot-update
- Together? Hot-updating multiplayer code without breaking active connections, syncing asset versions across clients, rolling back failed patches — that's where the real complexity lives.

This pack provides the **glue logic** that no individual skill covers.

## What you get

1. **Project architecture** optimized for multiplayer + hot-update separation
2. **Networking layer** with version-aware protocol negotiation
3. **HybridCLR integration** with assembly splitting for network code
4. **Addressables pipeline** with differential updates and CDN failover
5. **Glue logic** — how these four systems interact in production

## The hard problems this pack solves

### Which code goes where?
Network message definitions, sync components, and RPC handlers need careful assembly splitting. Put them in the wrong DLL and hot-update breaks serialization.

### Protocol versioning
Old client (v1.2) connects to new server (v1.3). The pack generates version-aware message routing that handles this gracefully.

### Update-while-playing
Player is in a match. A hot-fix drops. The pack generates the reconnection flow: save state → apply patch → restore state → resync.

### Rollback safety
Hot-update deployed, but it breaks networking. The pack includes rollback strategy: version gates, canary deployment, and emergency revert.

## Glue references

- [network-hotupdate-bridge.md](glue/network-hotupdate-bridge.md) — Assembly splitting, protocol versioning, reconnection
- [deployment-pipeline.md](glue/deployment-pipeline.md) — Build → patch → CDN → client flow
