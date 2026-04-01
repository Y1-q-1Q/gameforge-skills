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
