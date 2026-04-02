---
name: unity-build
version: 2.0.0
description: "Automate multi-platform builds, CI/CD pipelines, and release workflows for Unity projects"
engine: unity
category: build
license: Apache-2.0

interface:
  input:
    required:
      - build_requirements            # platforms, automation needs
    optional:
      - ci_platform                   # github-actions, jenkins, gitlab
      - distribution_target           # app-store, steam, web
      - team_size                     # solo, small, large

  output:
    - type: code                      # build scripts, CI configs
    - type: configuration             # project settings, quality tiers
    - type: architecture              # build pipeline design

  context_blocks:
    - id: build-cicd
      description: "Set up automated build and CI/CD pipelines"
      references: [build-cicd.md]
    - id: size-optimization
      description: "Optimize build size for distribution"
      references: [size-optimization.md]
    - id: release-workflow
      description: "Design release and distribution workflow"
      references: [release-workflow.md]

references:
  - file: references/build-cicd.md
    relevance: [build, cicd, github-actions, jenkins, automation, game-ci]
    size: 3KB
    priority: high
  - file: references/size-optimization.md
    relevance: [size, optimization, stripping, compression, split-apk]
    size: 4KB
    priority: medium
  - file: references/release-workflow.md
    relevance: [release, version, app-store, beta, distribution]
    size: 3KB
    priority: medium

triggers:
  keywords:
    - "build"
    - "ci/cd"
    - "automation"
    - "github actions"
    - "jenkins"
    - "gitlab"
    - "multi-platform"
    - "app store"
    - "release"
    - "version"
    - "il2cpp"
    - "build size"
  files:
    - "**/Editor/Build*.cs"
    - ".github/workflows/*.yml"
    - "**/Jenkinsfile"
    - "**/BuildScripts/**"
  context:
    - has_unity_project: true

composition:
  combines_with:
    - unity-addressables         # Addressables build pipeline
    - unity-hybridclr            # hot-update build integration
    - unity-testing              # CI test automation
    - unity-performance          # build profiling
  depends_on: []
  conflicts_with: []
  provides:
    - build-automation
    - ci-cd-pipeline
    - release-workflow

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android, webgl]
  render_pipelines: [built-in, urp, hdrp]
---

# unity-build

Automate multi-platform builds, CI/CD pipelines, and release workflows for Unity projects.

## When to use

Activate when the user mentions:
- Build automation, build scripts
- CI/CD for Unity (GitHub Actions, Jenkins, GitLab CI)
- Multi-platform builds (Android, iOS, WebGL, PC, Console)
- Build size optimization, stripping
- Addressables build pipeline
- Version management, build numbering
- App store submission (Google Play, App Store)
- HybridCLR build integration

## Capabilities

1. **Build scripts** — Editor scripts for one-click multi-platform builds
2. **CI/CD pipelines** — GitHub Actions, Jenkins, GitLab CI with game-ci
3. **Platform settings** — Per-platform optimization (IL2CPP, compression, stripping)
4. **Size optimization** — Code stripping, asset compression, split APKs
5. **Version management** — Semantic versioning, auto-increment, git tag integration
6. **Release workflow** — App store submission, beta distribution, hotfix flow

## Architecture Decision Guide

| Need | Solution |
|------|----------|
| Solo dev, simple builds | Editor build script + manual |
| Team, regular releases | GitHub Actions + game-ci |
| Enterprise, complex pipeline | Jenkins + custom agents |
| Multiple platforms | Matrix builds in CI |
| Hot update (China) | HybridCLR build integration |

## Unity version support

| Version | Status |
|---------|--------|
| Unity 6+ | ✅ Full |
| 2022.3 LTS | ✅ Full |
| 2021.3 LTS | ✅ Supported |

## References

- [build-cicd.md](references/build-cicd.md) — Build scripts, GitHub Actions, platform-specific settings
- [size-optimization.md](references/size-optimization.md) — Code stripping, texture compression, split APKs, build analysis
- [release-workflow.md](references/release-workflow.md) — Version management, app store submission, beta distribution

## Limitations

- Unity license activation in CI requires serial number or license file
- iOS builds require macOS runner
- Console builds require platform-specific SDKs and NDA access
