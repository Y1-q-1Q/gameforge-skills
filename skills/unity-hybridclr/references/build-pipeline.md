# HybridCLR Build Pipeline

## Overview

The hot-update build pipeline has two outputs:
1. **Base App** — Contains AOT assemblies + HybridCLR runtime. Submitted to app store.
2. **Hot-Update Package** — Contains hot-update DLLs + supplementary metadata. Deployed to CDN.

---

## Automated Build Script

```csharp
#if UNITY_EDITOR
using HybridCLR.Editor;
using HybridCLR.Editor.Commands;
using System.IO;
using UnityEditor;
using UnityEngine;

/// <summary>
/// One-click build pipeline for HybridCLR hot-update.
/// Usage: HybridCLR → Build → Hot Update Package
/// </summary>
public static class HotUpdateBuildPipeline
{
    private static readonly string HotUpdateOutputDir = "HotUpdateDlls";
    private static readonly string MetadataOutputDir = "AotMetadata";

    [MenuItem("HybridCLR/Build/Hot Update Package")]
    public static void BuildHotUpdatePackage()
    {
        var target = EditorUserBuildSettings.activeBuildTarget;
        Debug.Log($"[HotUpdate] Building for {target}...");

        // Step 1: Compile hot-update DLLs
        CompileDllCommand.CompileDll(target);
        Debug.Log("[HotUpdate] Step 1/4: DLLs compiled");

        // Step 2: Generate supplementary metadata
        Il2CppDefGeneratorCommand.GenerateIl2CppDef();
        MethodBridgeGeneratorCommand.GenerateMethodBridge(target);
        AOTReferenceGeneratorCommand.GenerateAOTGenericReference(target);
        Debug.Log("[HotUpdate] Step 2/4: Metadata generated");

        // Step 3: Copy hot-update DLLs to output
        CopyHotUpdateDlls(target);
        Debug.Log("[HotUpdate] Step 3/4: DLLs copied");

        // Step 4: Copy supplementary metadata to output
        CopyAOTMetadata(target);
        Debug.Log("[HotUpdate] Step 4/4: Metadata copied");

        Debug.Log($"[HotUpdate] Build complete. Output: {HotUpdateOutputDir}/");
    }

    private static void CopyHotUpdateDlls(BuildTarget target)
    {
        var srcDir = SettingsUtil.GetHotUpdateDllsOutputDirByTarget(target);
        var dstDir = $"{Application.dataPath}/../{HotUpdateOutputDir}";
        Directory.CreateDirectory(dstDir);

        foreach (var dll in SettingsUtil.HotUpdateAssemblyNamesExcludePreserved)
        {
            var src = $"{srcDir}/{dll}.dll";
            var dst = $"{dstDir}/{dll}.dll.bytes";
            File.Copy(src, dst, true);
            Debug.Log($"  Copied: {dll}.dll");
        }
    }

    private static void CopyAOTMetadata(BuildTarget target)
    {
        var srcDir = SettingsUtil.GetAssembliesPostIl2CppStripDir(target);
        var dstDir = $"{Application.dataPath}/../{MetadataOutputDir}";
        Directory.CreateDirectory(dstDir);

        // Copy AOT assemblies that need metadata supplementation
        string[] aotDlls = { "mscorlib.dll", "System.dll", "System.Core.dll" };
        foreach (var dll in aotDlls)
        {
            var src = $"{srcDir}/{dll}";
            if (File.Exists(src))
            {
                File.Copy(src, $"{dstDir}/{dll}.bytes", true);
                Debug.Log($"  Copied AOT metadata: {dll}");
            }
        }
    }
}
#endif
```

---

## CI/CD Integration (GitHub Actions)

```yaml
name: Build Hot Update Package

on:
  push:
    branches: [hotfix/*]
    paths: ['Assets/_HotUpdate/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: game-ci/unity-builder@v4
        with:
          targetPlatform: Android
          buildMethod: HotUpdateBuildPipeline.BuildHotUpdatePackage

      - name: Upload to CDN
        run: |
          # Version the package
          VERSION=$(date +%Y%m%d%H%M%S)
          
          # Compress DLLs
          cd HotUpdateDlls
          tar czf ../hotupdate-${VERSION}.tar.gz *.dll.bytes
          cd ../AotMetadata
          tar czf ../aotmeta-${VERSION}.tar.gz *.dll.bytes
          
          # Upload to your CDN (example: Aliyun OSS)
          ossutil cp ../hotupdate-${VERSION}.tar.gz oss://your-bucket/hotupdate/
          ossutil cp ../aotmeta-${VERSION}.tar.gz oss://your-bucket/hotupdate/
          
          # Update version manifest
          echo "{\"version\":\"${VERSION}\",\"files\":[\"hotupdate-${VERSION}.tar.gz\",\"aotmeta-${VERSION}.tar.gz\"]}" > manifest.json
          ossutil cp manifest.json oss://your-bucket/hotupdate/manifest.json
```

---

## Version Manifest

```json
{
  "version": "20260331021400",
  "minAppVersion": "1.0.0",
  "files": [
    {
      "name": "GameLogic.dll.bytes",
      "md5": "a1b2c3d4e5f6...",
      "size": 45678,
      "compressed": 23456
    },
    {
      "name": "UI.dll.bytes",
      "md5": "f6e5d4c3b2a1...",
      "size": 34567,
      "compressed": 18234
    }
  ],
  "metadata": [
    {
      "name": "mscorlib.dll.bytes",
      "md5": "1a2b3c4d5e6f...",
      "size": 12345
    }
  ],
  "releaseNotes": "Fix combat damage calculation",
  "mandatory": false
}
```

---

## Build Checklist

Before every hot-update release:

- [ ] Run `HybridCLR → Generate → All` (regenerate metadata)
- [ ] Run `HybridCLR → Build → Hot Update Package`
- [ ] Verify DLL sizes are reasonable (no accidental AOT code in hot-update)
- [ ] Test loading in Editor Play Mode
- [ ] Test on device (Android debug build)
- [ ] Upload to staging CDN
- [ ] Verify version manifest is correct
- [ ] Test update flow: old app → download → load → verify
- [ ] Deploy to production CDN
- [ ] Monitor error rates for 30 minutes
