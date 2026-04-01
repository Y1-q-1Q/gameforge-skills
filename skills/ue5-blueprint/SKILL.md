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
