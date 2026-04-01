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
