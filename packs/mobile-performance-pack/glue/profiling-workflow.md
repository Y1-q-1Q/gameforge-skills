# Profiling Workflow for Mobile Games

## Device Selection Matrix

Select devices based on your target market:

| Tier | Devices | Market Share | Focus |
|------|---------|--------------|-------|
| Entry | iPhone SE, Redmi Note | 30% | Baseline performance |
| Mid | iPhone 13, Pixel 6 | 50% | Target experience |
| High | iPhone 15 Pro, S24 Ultra | 20% | Visual quality |

## Profiling Pipeline

### 1. Automated Profiling (CI)
```
Build → Install on test farm → Run benchmark → Report regression
```

### 2. Manual Deep-Dive
- Unity Profiler (CPU/GPU/Memory)
- Xcode Instruments (iOS)
- Android Studio Profiler (Android)
- RenderDoc (GPU frame capture)

### 3. Field Analytics
- FPS telemetry histograms
- Thermal throttling detection
- Battery drain by feature

## Regression Detection

```csharp
// Example: FPS threshold monitoring
if (avgFps < targetFps * 0.9f) {
    Analytics.Report("performance_regression", new {
        scene = currentScene,
        device = SystemInfo.deviceModel,
        fps = avgFps,
        memory = GC.GetTotalMemory(false)
    });
}
```
