---
name: unity-hybridclr
version: 2.0.0
description: "Set up HybridCLR hot-reload for Unity — assembly splitting, metadata patching, and differential update strategies"
engine: unity
category: build
license: Apache-2.0

interface:
  input:
    required:
      - hot_update_requirements       # what needs to be hot-updatable
    optional:
      - target_platform               # android, ios, etc.
      - unity_version                 # e.g. 2022.3, 6000.0
      - update_strategy               # full-replace, differential, versioned
      - team_size                     # solo, small, large

  output:
    - type: configuration             # HybridCLR settings, build pipeline
    - type: code                      # runtime loading, version management
    - type: architecture              # assembly splitting strategy

  context_blocks:
    - id: setup
      description: "Install and configure HybridCLR package"
      references: [setup-guide.md]
    - id: assembly-splitting
      description: "Design AOT vs hot-update assembly strategy"
      references: [assembly-splitting.md]
    - id: build-pipeline
      description: "Set up automated hot-update build workflow"
      references: [build-pipeline.md]
    - id: runtime-loading
      description: "Implement runtime assembly loading"
      references: [runtime-loading.md]
    - id: differential-updates
      description: "Configure binary diff for minimal patches"
      references: [differential-update.md]

references:
  - file: references/setup-guide.md
    relevance: [setup, installation, configuration, il2cpp]
    size: 7KB
    priority: high
  - file: references/assembly-splitting.md
    relevance: [assembly, aot, hot-update, splitting, metadata]
    size: 7KB
    priority: high
  - file: references/build-pipeline.md
    relevance: [build, pipeline, automation, metadata, supplementary]
    size: 5KB
    priority: high
  - file: references/runtime-loading.md
    relevance: [runtime, loading, version, assembly, dll]
    size: 9KB
    priority: high
  - file: references/differential-update.md
    relevance: [differential, binary-diff, patch, update, bandwidth]
    size: 5KB
    priority: medium

triggers:
  keywords:
    - "hybridclr"
    - "hot update"
    - "hot reload"
    - "hot fix"
    - "code patching"
    - "assembly splitting"
    - "supplementary metadata"
    - "differential update"
  files:
    - "**/HybridCLR/**"
    - "**/*HotUpdate*.cs"
    - "**/*AssemblyLoader*.cs"
  context:
    - has_unity_project: true
    - target_platform: [android, ios]

composition:
  combines_with:
    - unity-addressables       # hot-update assets alongside code
    - unity-build              # CI/CD with HybridCLR build
    - unity-netcode            # hot-update multiplayer code
  depends_on: []
  conflicts_with: []
  provides:
    - hot-update-system
    - assembly-loading
    - differential-patching

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [android, ios]
  render_pipelines: [built-in, urp, hdrp]
---

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
