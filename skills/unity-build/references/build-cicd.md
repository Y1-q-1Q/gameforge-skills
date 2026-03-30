# Multi-Platform Build & CI/CD

## Build Script

```csharp
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.Build.Reporting;

public static class BuildPipeline
{
    [MenuItem("Build/Android")]
    public static void BuildAndroid()
    {
        var options = new BuildPlayerOptions
        {
            scenes = GetEnabledScenes(),
            locationPathName = "Builds/Android/game.apk",
            target = BuildTarget.Android,
            options = BuildOptions.CompressWithLz4HC
        };

        PlayerSettings.Android.keystoreName = "keystore.jks";
        PlayerSettings.Android.bundleVersionCode++;
        EditorUserBuildSettings.buildAppBundle = true; // AAB for Play Store

        var report = UnityEditor.BuildPipeline.BuildPlayer(options);
        if (report.summary.result != BuildResult.Succeeded)
            throw new System.Exception($"Build failed: {report.summary.totalErrors} errors");
    }

    [MenuItem("Build/iOS")]
    public static void BuildIOS()
    {
        var options = new BuildPlayerOptions
        {
            scenes = GetEnabledScenes(),
            locationPathName = "Builds/iOS",
            target = BuildTarget.iOS,
            options = BuildOptions.CompressWithLz4HC
        };
        UnityEditor.BuildPipeline.BuildPlayer(options);
    }

    [MenuItem("Build/WebGL")]
    public static void BuildWebGL()
    {
        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Brotli;
        var options = new BuildPlayerOptions
        {
            scenes = GetEnabledScenes(),
            locationPathName = "Builds/WebGL",
            target = BuildTarget.WebGL
        };
        UnityEditor.BuildPipeline.BuildPlayer(options);
    }

    private static string[] GetEnabledScenes()
    {
        return EditorBuildSettings.scenes
            .Where(s => s.enabled)
            .Select(s => s.path)
            .ToArray();
    }
}
#endif
```

## GitHub Actions CI/CD

```yaml
name: Build & Deploy

on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        targetPlatform: [Android, iOS, WebGL]

    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true

      - uses: game-ci/unity-builder@v4
        env:
          UNITY_LICENSE: ${{ secrets.UNITY_LICENSE }}
        with:
          targetPlatform: ${{ matrix.targetPlatform }}
          buildMethod: BuildPipeline.Build${{ matrix.targetPlatform }}

      - uses: actions/upload-artifact@v4
        with:
          name: Build-${{ matrix.targetPlatform }}
          path: Builds/${{ matrix.targetPlatform }}

  deploy-webgl:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref_type == 'tag'
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: Build-WebGL
          path: build

      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build/WebGL
```

## Platform-Specific Settings

| Setting | Android | iOS | WebGL |
|---------|---------|-----|-------|
| Scripting Backend | IL2CPP | IL2CPP | IL2CPP |
| API Level | .NET Standard 2.1 | .NET Standard 2.1 | .NET Standard 2.1 |
| Compression | LZ4HC | LZ4HC | Brotli |
| Min SDK | API 24 (Android 7) | iOS 14 | N/A |
| Architecture | ARM64 | ARM64 | Wasm |
| Strip Engine Code | ✅ | ✅ | ✅ |
