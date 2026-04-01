# Build Size Optimization

## Where Does Size Come From?

Typical Unity build breakdown:

| Component | % of Build | Optimization |
|-----------|-----------|-------------|
| Textures | 30-50% | Compression, max size limits, atlasing |
| Audio | 10-20% | Vorbis compression, mono SFX, lower sample rate |
| Meshes | 5-15% | Mesh compression, LODs, remove unused |
| Code (IL2CPP) | 10-20% | Managed stripping, link.xml |
| Shaders | 5-10% | Strip variants, shader keyword limits |
| Plugins/SDKs | 5-15% | Remove unused, use lite versions |

## Code Stripping

### Managed Stripping Level

```
Project Settings → Player → Other Settings → Managed Stripping Level
```

| Level | Size Reduction | Risk |
|-------|---------------|------|
| Minimal | ~5% | Safe |
| Low | ~15% | Safe for most projects |
| Medium | ~25% | May strip reflection-used code |
| High | ~35% | Aggressive, needs link.xml |

### link.xml (Preserve from Stripping)

```xml
<!-- Assets/link.xml -->
<linker>
  <!-- Preserve entire assembly -->
  <assembly fullname="MyGameLogic" preserve="all"/>

  <!-- Preserve specific type -->
  <assembly fullname="UnityEngine">
    <type fullname="UnityEngine.JsonUtility" preserve="all"/>
  </assembly>

  <!-- Preserve types used by JSON serialization -->
  <assembly fullname="Assembly-CSharp">
    <type fullname="MyGame.SaveData" preserve="all"/>
    <type fullname="MyGame.Config.*" preserve="all"/>
  </assembly>
</linker>
```

## Android Size Optimization

### Split APKs (App Bundle)

```csharp
// Build script
EditorUserBuildSettings.buildAppBundle = true; // AAB instead of APK
PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64; // Drop ARMv7

// Split by texture compression
PlayerSettings.Android.splitApplicationBinary = true;
```

### Android App Bundle Benefits

| Feature | APK | AAB |
|---------|-----|-----|
| Size limit | 150 MB | 200 MB (base) + 2 GB (asset packs) |
| Per-device optimization | ❌ | ✅ (only downloads needed resources) |
| Play Asset Delivery | ❌ | ✅ (install-time, fast-follow, on-demand) |

### Play Asset Delivery for Large Games

```
Base APK: < 200 MB (core game)
Install-time pack: Essential assets (downloaded with install)
Fast-follow pack: Level 1-5 assets (downloaded right after install)
On-demand pack: Level 6+ assets (downloaded when needed)
```

## Shader Variant Stripping

Shaders can bloat builds by megabytes with unused variants.

```csharp
// IPreprocessShaders — strip unused variants at build time
#if UNITY_EDITOR
class ShaderVariantStripper : IPreprocessShaders
{
    public int callbackOrder => 0;

    public void OnProcessShader(Shader shader, ShaderSnippetData snippet, IList<ShaderCompilerData> data)
    {
        for (int i = data.Count - 1; i >= 0; i--)
        {
            // Strip fog variants if game doesn't use fog
            if (data[i].shaderKeywordSet.IsEnabled(new ShaderKeyword("FOG_LINEAR")) ||
                data[i].shaderKeywordSet.IsEnabled(new ShaderKeyword("FOG_EXP")) ||
                data[i].shaderKeywordSet.IsEnabled(new ShaderKeyword("FOG_EXP2")))
            {
                data.RemoveAt(i);
            }
        }
    }
}
#endif
```

## Build Analysis

### Build Report

```csharp
#if UNITY_EDITOR
[MenuItem("GameForge/Build/Analyze Last Build")]
static void AnalyzeBuild()
{
    var report = BuildReport.GetLatestReport();
    if (report == null) { Debug.Log("No build report found"); return; }

    Debug.Log($"Total size: {report.summary.totalSize / 1024 / 1024} MB");
    Debug.Log($"Build time: {report.summary.totalTime}");

    // Top 20 largest assets
    var assets = report.packedAssets
        .SelectMany(p => p.contents)
        .OrderByDescending(a => a.packedSize)
        .Take(20);

    foreach (var a in assets)
        Debug.Log($"  {a.packedSize / 1024} KB — {a.sourceAssetPath}");
}
#endif
```

## Quick Wins Checklist

- [ ] Set Managed Stripping to Medium or High
- [ ] Enable IL2CPP (not Mono) for release builds
- [ ] Compress textures (ASTC for mobile, BC7 for PC)
- [ ] Force Mono on all SFX AudioClips
- [ ] Set max texture size (2048 for mobile, 4096 for PC)
- [ ] Strip unused shader variants
- [ ] Remove unused packages from Package Manager
- [ ] Use AAB for Android (not APK)
- [ ] Enable LZ4HC compression
- [ ] Check Build Report for oversized assets
