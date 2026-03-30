# unity-hybridclr

Set up and configure HybridCLR hot-reload for Unity projects. Generate production-ready hot update workflows including assembly splitting, metadata patching, and differential update strategies.

## When to use

Activate when the user mentions:
- HybridCLR setup or configuration
- Hot update / hot reload / hot fix in Unity
- Code hot patching without app store review
- Assembly splitting (AOT + Interpreter)
- Supplementary metadata generation
- Differential update strategies

## Capabilities

Given a Unity project description, this skill generates:

1. **HybridCLR installation & configuration** — Package setup, build pipeline integration
2. **Assembly splitting strategy** — Which assemblies are AOT vs hot-update
3. **Supplementary metadata** — AOT generic method patching
4. **Build pipeline** — Automated hot-update build workflow
5. **Loading system** — Runtime assembly loading with version management
6. **Differential updates** — Binary diff for minimal download size
7. **Rollback mechanism** — Safe fallback when hot-update fails

## Architecture Decision Guide

| Scenario | Strategy | Why |
|----------|----------|-----|
| Small game, few updates | Full assembly replace | Simple, reliable |
| Large game, frequent patches | Differential update | Bandwidth savings 60-80% |
| Live service game | Versioned hot-update + rollback | Safety first |
| China market (审核) | Hot-update mandatory | App store review takes weeks |

## Usage examples

### Input
```
Set up HybridCLR for a Unity 2022.3 mobile game:
- Hot-update game logic and UI code
- Keep core framework as AOT
- Support differential updates
- Need rollback on failure
- Target: Android + iOS
```

## Unity version support

| Version | HybridCLR Support |
|---------|------------------|
| Unity 6+ | ✅ Full (com.code-philosophy.hybridclr 6.x) |
| 2022.3 LTS | ✅ Full (com.code-philosophy.hybridclr 5.x) |
| 2021.3 LTS | ✅ Supported (com.code-philosophy.hybridclr 4.x) |
| 2020.3 LTS | ⚠️ Limited (community edition only) |

## References

- [setup-guide.md](references/setup-guide.md) — Installation and project configuration
- [assembly-splitting.md](references/assembly-splitting.md) — AOT vs hot-update assembly strategy
- [build-pipeline.md](references/build-pipeline.md) — Automated build and metadata generation
- [runtime-loading.md](references/runtime-loading.md) — Runtime assembly loading and version management
- [differential-update.md](references/differential-update.md) — Binary diff and minimal patch delivery

## Limitations

- iOS requires IL2CPP (no Mono), HybridCLR works with IL2CPP only
- Some Unity APIs have AOT-only restrictions (rare)
- First-time setup requires rebuilding libil2cpp
- Stripping level affects which generic methods need supplementary metadata
