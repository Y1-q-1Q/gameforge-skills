# unity-addressables

Configure and optimize Unity Addressables for asset management. Generate production-ready asset loading, memory management, and CDN delivery workflows.

## When to use

Activate when the user mentions:
- Addressables setup or configuration
- Asset bundle management
- Runtime asset loading / unloading
- Memory management for assets
- CDN / remote asset delivery
- Asset organization and grouping strategy
- Addressables + HybridCLR integration

## Capabilities

1. **Addressables setup** — Package installation, profile configuration, build settings
2. **Group strategy** — How to organize assets into groups for optimal loading
3. **Loading patterns** — Async loading, reference counting, memory management
4. **Remote delivery** — CDN configuration, catalog updates, content updates
5. **Memory optimization** — Profiling, leak detection, unloading strategies
6. **HybridCLR integration** — Hot-update assets alongside hot-update code

## Unity version support

| Version | Addressables Version |
|---------|---------------------|
| Unity 6+ | ✅ 2.x |
| 2022.3 LTS | ✅ 1.21+ |
| 2021.3 LTS | ✅ 1.19+ |

## References

- [setup-and-groups.md](references/setup-and-groups.md) — Installation, profiles, and group strategy
- [loading-patterns.md](references/loading-patterns.md) — Async loading, reference counting, memory
- [remote-delivery.md](references/remote-delivery.md) — CDN setup, catalog updates, content patches
- [hybridclr-integration.md](references/hybridclr-integration.md) — Addressables + HybridCLR workflow

## Limitations

- Addressables adds ~2MB to build size (runtime + serialization)
- First-time catalog download adds startup latency
- Asset bundle dependencies can cause unexpected memory retention
- WebGL has limited async loading support
