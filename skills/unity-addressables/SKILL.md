---
name: unity-addressables
version: 2.0.0
description: "Configure and optimize Unity Addressables for asset management — loading patterns, memory management, and CDN delivery workflows"
engine: unity
category: build
license: Apache-2.0

interface:
  input:
    required:
      - asset_organization_goal       # remote delivery, memory optimization, etc.
    optional:
      - target_platform               # mobile, pc, console
      - unity_version                 # e.g. 2022.3, 6000.0
      - cdn_provider                  # e.g. AWS S3, Azure, Alibaba Cloud
      - hybridclr_enabled             # true/false for hot-update integration

  output:
    - type: configuration             # Addressables settings, profiles
    - type: code                      # loading scripts, reference managers
    - type: architecture              # group strategy documentation

  context_blocks:
    - id: setup-and-groups
      description: "Configure Addressables package and group strategy"
      references: [setup-and-groups.md]
    - id: loading-patterns
      description: "Implement async loading and memory management"
      references: [loading-patterns.md]
    - id: remote-delivery
      description: "Set up CDN and remote catalog workflow"
      references: [remote-delivery.md]
    - id: hybridclr-integration
      description: "Integrate Addressables with HybridCLR hot-update"
      references: [hybridclr-integration.md]

references:
  - file: references/setup-and-groups.md
    relevance: [setup, groups, profiles, build-settings, organization]
    size: 5KB
    priority: high
  - file: references/loading-patterns.md
    relevance: [async-loading, reference-counting, memory-management, unloading]
    size: 5KB
    priority: high
  - file: references/remote-delivery.md
    relevance: [cdn, catalog, content-update, remote, patches]
    size: 5KB
    priority: medium
  - file: references/hybridclr-integration.md
    relevance: [hybridclr, hot-update, hot-reload, assembly-loading]
    size: 5KB
    priority: low

triggers:
  keywords:
    - "addressables"
    - "asset bundle"
    - "asset management"
    - "remote asset"
    - "cdn delivery"
    - "asset loading"
    - "memory management"
    - "asset group"
  files:
    - "Assets/AddressableAssetsData/**"
    - "**/Addressables/**"
    - "**/*AssetLoader*.cs"
  context:
    - has_unity_project: true
    - has_addressables_package: true

composition:
  combines_with:
    - unity-hybridclr          # hot-update assets alongside code
    - unity-build              # CI/CD with Addressables build
    - unity-performance        # memory optimization
    - unity-netcode            # remote asset delivery for multiplayer
  depends_on: []
  conflicts_with: []
  provides:
    - asset-loading-system
    - remote-content-delivery
    - memory-management

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android, webgl]
  render_pipelines: [built-in, urp, hdrp]
---

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
