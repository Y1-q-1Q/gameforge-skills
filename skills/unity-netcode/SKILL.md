# unity-netcode

Generate production-ready multiplayer networking code for Unity games.

## When to use

Activate when the user wants to:
- Implement multiplayer networking in Unity
- Choose between frame-sync (lockstep) and state-sync architectures
- Build a deterministic simulation for competitive games
- Implement input prediction and rollback
- Set up lobby, matchmaking, or room systems
- Sync game state across clients

## Capabilities

Given a multiplayer game description, this skill generates:

1. **Architecture selection** — Frame-sync vs state-sync vs hybrid, with reasoning
2. **Network transport layer** — Connection, serialization, message routing
3. **Input handling** — Input collection, prediction, and rollback
4. **State synchronization** — Snapshot interpolation, delta compression
5. **Deterministic simulation** — Fixed-point math, deterministic physics
6. **Lobby & matchmaking** — Room creation, player management
7. **Lag compensation** — Client-side prediction, server reconciliation

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

## Unity version support

| Version | Status |
|---------|--------|
| Unity 6+ | ✅ Full (Netcode for GameObjects 2.x) |
| 2022.3 LTS | ✅ Full |
| 2021.3 LTS | ✅ Supported |

## References

- [frame-sync-patterns.md](references/frame-sync-patterns.md) — Lockstep and deterministic simulation
- [state-sync-patterns.md](references/state-sync-patterns.md) — Server-authoritative state synchronization
- [rollback-netcode.md](references/rollback-netcode.md) — Rollback and prediction systems
- [transport-layer.md](references/transport-layer.md) — Network transport implementation
- [lobby-matchmaking.md](references/lobby-matchmaking.md) — Room and matchmaking systems

## Limitations

- Does not include server deployment (use unity-build for CI/CD)
- Relay/TURN server setup requires external infrastructure
- NAT traversal depends on transport library choice
- Deterministic physics requires custom implementation (Unity's PhysX is non-deterministic)
