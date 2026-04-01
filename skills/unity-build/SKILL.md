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
