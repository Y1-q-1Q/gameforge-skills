# Example Unity Performance Diagnosis Report

_Last updated: 2026-05-07T23:43:28+08:00_

## Scenario
A Unity mobile build shows visible stutter every 3-5 seconds on mid-range Android devices.

## Findings
1. Main thread frame spikes exceed the 16.67ms / 60 FPS budget.
2. GC allocations appear during gameplay loops.
3. Asset loading and object creation are suspected during active play.

## Evidence To Collect
- Unity Profiler CPU timeline capture during a stutter window.
- GC Alloc column for hot scripts.
- Frame Debugger / GPU timing if CPU is not the bottleneck.
- Device model, Unity version, target FPS, graphics API.

## Root Cause Hypotheses
| Hypothesis | Evidence Needed | Risk |
|---|---|---|
| Per-frame allocations in Update/LateUpdate | GC Alloc spikes tied to scripts | High |
| Runtime Instantiate/Destroy bursts | Timeline shows object creation spikes | Medium |
| Synchronous Resources.Load or Addressables wait | Loading marker during gameplay | High |
| Overdraw or shader cost | GPU frame time > budget | Medium |

## Optimization Plan
1. Confirm bottleneck class: CPU / GPU / GC / loading.
2. Remove per-frame allocations in hot paths.
3. Pool repeatedly spawned gameplay objects.
4. Move loading to prewarm screens or async flows.
5. Re-profile on the same device and compare frame-time percentiles.

## Validation
- P95 frame time under target budget.
- GC Alloc near zero during steady gameplay.
- No visible spikes during a 3-minute representative run.
- Before/after profiler screenshots attached to final report.

## Upgrade Path
This example can become a premium report pack with:
- automated capture checklist;
- project scanner commands;
- report templates for CPU/GPU/GC/loading;
- prioritized fix backlog with validation gates.
