---
name: unity-performance
version: 2.0.0
description: "Profile and optimize Unity game performance — CPU, GPU, memory, loading, and platform-specific budgets"
engine: unity
category: build
license: Apache-2.0

interface:
  input:
    required:
      - performance_issue             # what needs optimization
    optional:
      - target_platform               # mobile, pc, console
      - profiling_data                # profiler screenshots, metrics
      - performance_budget            # target fps, memory limit

  output:
    - type: code                      # optimization scripts, tools
    - type: configuration             # project settings, quality tiers
    - type: architecture              # optimization strategy

  context_blocks:
    - id: optimization-guide
      description: "Systematic profiling and optimization workflow"
      references: [optimization-guide.md]
    - id: jobs-burst
      description: "Implement Jobs System and Burst Compiler patterns"
      references: [jobs-burst-guide.md]
    - id: memory-management
      description: "Optimize memory usage and asset lifecycle"
      references: [memory-management.md]
    - id: platform-specific
      description: "Apply platform-specific optimizations"
      references: [platform-specific.md]

references:
  - file: references/optimization-guide.md
    relevance: [profiling, cpu, gpu, draw-calls, batching, overdraw, mobile]
    size: 3KB
    priority: high
  - file: references/jobs-burst-guide.md
    relevance: [jobs, burst, parallel, cpu, performance, cache-friendly]
    size: 5KB
    priority: medium
  - file: references/memory-management.md
    relevance: [memory, texture, asset, lifecycle, leak, budget]
    size: 4KB
    priority: high
  - file: references/platform-specific.md
    relevance: [platform, mobile, webgl, console, thermal, limits]
    size: 4KB
    priority: medium

triggers:
  keywords:
    - "performance"
    - "optimization"
    - "profiling"
    - "fps"
    - "frame rate"
    - "draw call"
    - "batching"
    - "overdraw"
    - "gc"
    - "garbage collection"
    - "memory leak"
    - "loading time"
    - "stutter"
    - "hitching"
  files:
    - "**/*Profiler*.cs"
    - "**/*Performance*.cs"
    - "Assets/Editor/Performance/**/*.cs"
  context:
    - has_unity_project: true

composition:
  combines_with:
    - unity-ecs                  # ECS performance patterns
    - unity-addressables         # loading optimization
    - unity-shader               # GPU optimization
    - unity-ui                   # UI performance
    - unity-animation            # animation optimization
  depends_on: []
  conflicts_with: []
  provides:
    - profiling-workflow
    - optimization-patterns
    - performance-budgets

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android, webgl]
  render_pipelines: [built-in, urp, hdrp]
---

# unity-performance

Profile and optimize Unity game performance across all platforms. Covers CPU, GPU, memory, loading, and platform-specific budgets.

## When to use

Activate when the user mentions:
- Performance profiling or optimization
- Frame rate drops, stuttering, hitching
- GC spikes, memory leaks, allocation reduction
- Draw call reduction, batching, overdraw
- Mobile performance budgets
- Loading time optimization
- IL2CPP / Mono performance differences
- Physics optimization
- UI performance (UGUI / UI Toolkit)

## Capabilities

1. **Profiling workflow** — Systematic bottleneck identification
2. **CPU optimization** — GC-free patterns, job system, burst compiler
3. **GPU optimization** — Draw calls, shaders, overdraw, fill rate
4. **Memory management** — Texture budgets, asset lifecycle, leak detection
5. **Loading optimization** — Async loading, scene streaming, prewarming
6. **Platform-specific tuning** — Mobile thermal throttling, WebGL constraints, console TRC/XR
7. **Automated profiling** — Editor scripts for regression detection

## Architecture Decision Guide

| Bottleneck | First Check | Solution Path |
|-----------|-------------|---------------|
| CPU-bound (scripts) | Profiler → CPU module | Cache, pool, Jobs+Burst |
| CPU-bound (physics) | Physics.Simulate time | Layers, simplified colliders, fixed timestep |
| GPU-bound (fill rate) | Overdraw visualization | Reduce transparency, LOD, occlusion |
| GPU-bound (vertex) | Triangle count | LOD, mesh simplification, culling |
| Memory pressure | Memory profiler snapshot | Texture compression, addressables unload |
| GC stutter | GC.Alloc in profiler | Zero-alloc patterns, incremental GC |
| Loading time | Async profiler | Addressables, preload, streaming |

## Unity version support

| Version | Status |
|---------|--------|
| Unity 6+ | ✅ Full (Profile Analyzer 2.0, Memory Profiler 2.0) |
| 2022.3 LTS | ✅ Full |
| 2021.3 LTS | ✅ Supported |

## References

- [optimization-guide.md](references/optimization-guide.md) — Profiling workflow, GC-free patterns, draw call optimization, mobile budgets
- [jobs-burst-guide.md](references/jobs-burst-guide.md) — C# Job System + Burst Compiler patterns for CPU-heavy workloads
- [memory-management.md](references/memory-management.md) — Asset lifecycle, texture budgets, leak detection, platform memory limits
- [platform-specific.md](references/platform-specific.md) — Mobile thermal, WebGL, console-specific optimization

## Limitations

- Profiling data is project-specific; budgets are guidelines not absolutes
- Burst Compiler requires specific C# subset (no managed references)
- Some optimizations trade code readability for performance — document tradeoffs
