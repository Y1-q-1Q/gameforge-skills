# Performance Budget Calculator

## Frame Time Budget (16.67ms for 60fps)

```
Total: 16.67ms
├── Render Thread: 8ms (48%)
│   ├── Shadow Pass: 2ms
│   ├── Opaque: 4ms
│   ├── Transparent: 1.5ms
│   └── Post-Processing: 0.5ms
├── Logic: 6ms (36%)
│   ├── Update(): 3ms
│   ├── Physics: 2ms
│   └── Animation: 1ms
├── Audio: 1ms (6%)
└── Buffer: 1.67ms (10%)
```

## Memory Budget (Mobile)

| Category | Entry (512MB) | Mid (1GB) | High (2GB) |
|----------|---------------|-----------|------------|
| Textures | 200MB | 400MB | 800MB |
| Meshes | 50MB | 100MB | 200MB |
| Audio | 30MB | 50MB | 100MB |
| Code/Runtime | 100MB | 200MB | 400MB |
| Buffer | 132MB | 250MB | 500MB |

## Dynamic Quality Adjustment

```csharp
public class QualityManager : MonoBehaviour {
    void Update() {
        var fps = 1f / Time.unscaledDeltaTime;
        
        if (fps < 55f && QualitySettings.GetQualityLevel() > 0) {
            // Drop one quality level
            QualitySettings.SetQualityLevel(
                QualitySettings.GetQualityLevel() - 1
            );
        }
    }
}
```
