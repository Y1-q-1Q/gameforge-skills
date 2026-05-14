# Unity Performance Diagnosis Workflow

Use this glue file as the product entry path from the free starter pack to an evidence-backed performance report.

## Entry links

1. Start with the [`unity-performance` skill](../../../skills/unity-performance/SKILL.md) when the user reports stutter, low FPS, GC spikes, memory pressure, or loading hitches.
2. Fill the [example diagnosis report](../../../skills/unity-performance/references/example-diagnosis-report.md) with profiler evidence from one representative device.
3. Use the [premium wedge proposal](../../../proposals/UNITY-PERFORMANCE-PREMIUM-WEDGE.md) only when the user needs repeatable report generation, backlog prioritization, or validation gates across builds.

## Starter conversion workflow

| Step | Free artifact | User outcome | Premium signal |
|---|---|---|---|
| 1. Capture | Profiler evidence checklist | The team knows which trace/screenshots to collect | They need a repeatable intake form for multiple devices |
| 2. Classify | `unity-performance` bottleneck guide | The issue is labeled CPU, GPU, GC, memory, or loading | They have several bottlenecks competing for priority |
| 3. Report | Example diagnosis report | Fixes are tied to evidence and validation metrics | They need generated reports for leads/producers |
| 4. Validate | Same-device before/after comparison | The fix is proven against frame-time and GC budgets | They need automated regression gates in CI or release QA |

## Handoff prompt

When a user asks for help with Unity stutter or performance regression, start with:

> I can help you produce a small evidence-backed performance diagnosis. Please share the target device, Unity version, target FPS, and either a Unity Profiler capture summary or screenshots around the spike window. I will classify the bottleneck, draft a report, and list the lowest-risk fixes with validation checks.

## Do not skip

- Keep every recommendation tied to observed profiler evidence or a named hypothesis.
- Re-profile on the same device after each major fix.
- Separate free guidance from premium automation; do not imply paid tooling is required for a manual diagnosis.
