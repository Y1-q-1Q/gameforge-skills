---
name: mobile-performance-pack
version: 1.0.0
description: "Complete mobile game performance optimization — from profiling to production-ready 60fps"
engine: unity

skills:
  - unity-performance
  - unity-memory
  - unity-gpu
  - unity-audio

install_order:
  - unity-performance
  - unity-memory
  - unity-gpu
  - unity-audio

glue:
  - file: glue/profiling-workflow.md
    description: "Step-by-step profiling workflow for mobile devices"
  - file: glue/budget-calculator.md
    description: "Performance budget calculator and monitoring setup"
  - file: glue/optimization-checklist.md
    description: "Pre-release optimization checklist for app stores"

scenarios:
  - "Mid-core mobile game targeting 60fps on mid-range devices"
  - "Open-world mobile game with streaming and LOD management"
  - "Multiplayer mobile game with strict latency requirements"
  - "Battery-conscious casual game for long play sessions"
---

# mobile-performance-pack

Complete mobile game performance optimization — from profiling to production-ready 60fps.

## Why this pack exists

Mobile performance is a multi-dimensional problem:
- **CPU**: Script optimization, draw call batching, physics
- **Memory**: Texture compression, asset unloading, pool management
- **GPU**: Shader complexity, overdraw, fill rate
- **Audio**: Compression, mixing, platform codecs

Individual skills solve each dimension. This pack orchestrates them into a complete optimization workflow.

## What you get

1. **Performance profiling** — CPU, GPU, memory profiling setup
2. **Memory management** — Object pooling, asset unloading, texture compression
3. **GPU optimization** — Shader LOD, overdraw reduction, batching
4. **Audio optimization** — Platform-specific compression, mixing
5. **Glue logic** — Integrated workflow and monitoring

## Glue highlights

### Profiling Workflow
- Device selection strategy (which devices to test on)
- Automated performance regression detection
- FPS/thermal/battery correlation analysis

### Budget Calculator
- Frame time budget allocation (render vs logic vs audio)
- Memory budget by asset type
- Dynamic quality adjustment triggers

### Optimization Checklist
- Pre-launch performance verification
- App store performance requirements (iOS/Android)
- Device coverage validation

## Target metrics

| Metric | Entry | Mid | Flagship |
|--------|-------|-----|----------|
| FPS | 30 stable | 60 most scenes | 60 all scenes |
| Memory | <512MB | <1GB | <1.5GB |
| Battery | <10%/hr | <15%/hr | <20%/hr |
| Thermal | No throttling | <45°C | <50°C |
