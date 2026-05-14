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
  - file: glue/diagnosis-report-workflow.md
    description: "Product entry workflow linking the free diagnosis report to premium automation signals"

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

1. Open the [diagnosis report workflow](glue/diagnosis-report-workflow.md) and capture the required entry evidence.
2. Capture a representative profiler trace.
3. Identify bottleneck class: CPU, GPU, GC, loading, or memory.
4. Fill the [example diagnosis report](../../skills/unity-performance/references/example-diagnosis-report.md).
5. Apply the highest-confidence low-risk fix.
6. Re-profile on the same device.

## Premium upgrade path

- automated profiler evidence intake;
- script-side hot path scanner;
- report generator;
- before/after validation gates;
- prioritized optimization backlog.
