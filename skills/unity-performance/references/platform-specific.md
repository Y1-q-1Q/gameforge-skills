# Platform-Specific Optimization

## Mobile: Thermal Throttling

The #1 mobile performance killer that most developers miss.

### How Thermal Throttling Works

```
Full speed → Sustained load (30-60s) → CPU/GPU clock reduced 30-50% → FPS drops
```

**You can't profile this in the editor.** Must test on device for 5+ minutes.

### Mitigation Strategies

| Strategy | Implementation |
|----------|---------------|
| Frame budget headroom | Target 12ms for 60fps (not 16.6ms) — leave 30% thermal margin |
| Dynamic quality | Detect thermal state, reduce quality automatically |
| Workload spreading | Don't spike CPU/GPU simultaneously |
| Shader LOD | Simpler shaders at distance |
| Resolution scaling | Drop render resolution under thermal pressure |

```csharp
// Dynamic quality based on frame time (proxy for thermal state)
public class ThermalAdaptiveQuality : MonoBehaviour
{
    [SerializeField] float _targetFrameTime = 0.012f; // 12ms for 60fps with margin
    float _avgFrameTime;
    int _qualityLevel;

    void Update()
    {
        _avgFrameTime = Mathf.Lerp(_avgFrameTime, Time.unscaledDeltaTime, 0.05f);

        if (_avgFrameTime > _targetFrameTime * 1.5f && _qualityLevel > 0)
        {
            _qualityLevel--;
            ApplyQuality(_qualityLevel);
        }
        else if (_avgFrameTime < _targetFrameTime * 0.8f && _qualityLevel < 2)
        {
            _qualityLevel++;
            ApplyQuality(_qualityLevel);
        }
    }

    void ApplyQuality(int level)
    {
        // level 0: low, 1: mid, 2: high
        QualitySettings.SetQualityLevel(level);
        // Also adjust: shadow distance, LOD bias, render scale
    }
}
```

### Android-Specific

- **Vulkan vs OpenGL ES**: Vulkan has lower driver overhead, prefer it for draw-call-heavy games
- **Mali GPU gotcha**: Avoid `discard` in fragment shaders — causes full-tile re-render
- **Memory**: Many devices kill apps at 1GB. Budget 600MB max.
- **Sustained performance mode**: `Activity.setSustainedPerformanceMode(true)` — caps clock but prevents throttling

### iOS-Specific

- **Metal**: Always use Metal (OpenGL ES deprecated since iOS 12)
- **Thermal state API**: `ProcessInfo.thermalState` — react to `.serious` / `.critical`
- **Memory**: iOS kills at ~1.4GB on most devices. Budget 800MB max.
- **GPU family**: Check `SystemInfo.graphicsDeviceName` for A-series chip capabilities

## WebGL Constraints

| Constraint | Limit | Workaround |
|-----------|-------|------------|
| No threads | Single-threaded only | No Jobs, no async I/O |
| Memory | Browser tab limit (~2GB) | Aggressive asset streaming |
| No compute shaders | WebGL 2.0 limit | Fallback to vertex shaders |
| Shader compilation | Stalls on first use | Prewarm shader variants |
| Download size | Users leave at >50MB | Addressables + CDN streaming |
| Audio | User interaction required | Play silent audio on first click |

```csharp
// WebGL shader prewarming
#if UNITY_WEBGL
IEnumerator PrewarmShaders()
{
    var variants = Resources.Load<ShaderVariantCollection>("PrewarmVariants");
    variants.WarmUp();
    yield return null; // Let browser breathe
}
#endif
```

## Console Optimization Notes

| Platform | Key Constraint | Approach |
|----------|---------------|----------|
| Switch | 4GB RAM, mobile GPU | Treat like high-end mobile |
| PS5/Xbox Series | Fast SSD | Stream aggressively, smaller install |
| PS4/Xbox One | HDD, 8GB RAM | Preload critical assets, compress everything |

### Console TRC/XR Common Failures

- **Loading screen freeze**: Must show progress, update at least every 2 seconds
- **Frame rate drops**: Some TRCs require sustained 30fps minimum
- **Memory spikes**: Crash = instant fail. Profile peak memory, not average.
