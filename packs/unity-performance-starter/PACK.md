---
name: unity-performance-starter
version: 0.1.0
description: "Starter pack for evidence-based Unity performance diagnosis"
engine: unity

skills:
  - unity-performance

install_order:
  - unity-performance

glue:
  - file: glue/example-diagnosis-report.md
    description: "Example report structure for CPU/GPU/GC/loading performance diagnosis"

scenarios:
  - "Mobile build stutters every few seconds"
  - "GC spikes during gameplay"
  - "Frame pacing regression after content update"
---

# unity-performance-starter

A small, tryable starter pack for Unity performance diagnosis.

## What it gives users

1. A repeatable evidence checklist.
2. A diagnosis report structure.
3. A validation plan tied to profiler metrics.
4. A clear upgrade path to premium performance report automation.

## First workflow

1. Capture a representative profiler trace.
2. Identify bottleneck class: CPU, GPU, GC, loading, or memory.
3. Fill the diagnosis report.
4. Apply the highest-confidence low-risk fix.
5. Re-profile on the same device.

## Premium upgrade path

- automated profiler evidence intake;
- script-side hot path scanner;
- report generator;
- before/after validation gates;
- prioritized optimization backlog.
