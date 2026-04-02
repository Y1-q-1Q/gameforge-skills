# Deployment Pipeline

End-to-end flow: build → generate patch → upload to CDN → client update.

## Pipeline Overview

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Build   │───>│  Patch   │───>│  Upload  │───>│  Client  │
│  Server  │    │ Generate │    │  to CDN  │    │  Update  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
  Unity Build    BsDiff delta    S3/OSS/CDN     Addressables
  + HybridCLR    + manifest      + version       + HybridCLR
  + Addressables  generation      routing         hot-reload
```

## Step 1: Build

### CI Script (GitHub Actions)

```yaml
name: GameForge Build & Patch
on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: game-ci/unity-builder@v4
        with:
          targetPlatform: Android
          buildMethod: GameForge.Build.BuildPipeline.BuildWithHotUpdate

      - name: Generate HybridCLR hot-update DLLs
        run: |
          # Extract hot-update assemblies from build output
          cp Build/HotUpdate/*.dll.bytes artifacts/hotupdate/

      - name: Build Addressables
        run: |
          # Build remote Addressables catalog
          cp Build/ServerData/* artifacts/addressables/
```

### Build Script (C#)

```csharp
public static class BuildPipeline
{
    public static void BuildWithHotUpdate()
    {
        // 1. Run HybridCLR generate
        HybridCLR.Editor.Commands.PrebuildCommand.GenerateAll();

        // 2. Build player
        BuildPlayerOptions opts = new()
        {
            scenes = EditorBuildSettings.scenes.Select(s => s.path).ToArray(),
            locationPathName = "Build/game.apk",
            target = BuildTarget.Android,
            options = BuildOptions.None
        };
        UnityEditor.BuildPipeline.BuildPlayer(opts);

        // 3. Copy hot-update DLLs
        var hotUpdateDlls = new[] {
            "Game.Network.Messages",
            "Game.Network.Gameplay",
            "Game.Network.Lobby"
        };
        foreach (var dll in hotUpdateDlls)
        {
            var src = $"{Application.dataPath}/../HybridCLRData/HotUpdateDlls/Android/{dll}.dll";
            var dst = $"Build/HotUpdate/{dll}.dll.bytes";
            File.Copy(src, dst, true);
        }

        // 4. Build Addressables
        AddressableAssetSettings.BuildPlayerContent();
    }
}
```

## Step 2: Patch Generation

### Differential Patch (BsDiff)

```csharp
public static class PatchGenerator
{
    public static PatchManifest Generate(string oldDir, string newDir, string outputDir)
    {
        var manifest = new PatchManifest { Version = GetVersionFromTag() };

        foreach (var newFile in Directory.GetFiles(newDir, "*.dll.bytes"))
        {
            var fileName = Path.GetFileName(newFile);
            var oldFile = Path.Combine(oldDir, fileName);

            if (File.Exists(oldFile) && !FilesIdentical(oldFile, newFile))
            {
                // Generate binary diff
                var patchFile = Path.Combine(outputDir, fileName + ".patch");
                BsDiff.Create(File.ReadAllBytes(oldFile), File.ReadAllBytes(newFile), patchFile);
                manifest.Patches.Add(new PatchEntry
                {
                    FileName = fileName,
                    PatchSize = new FileInfo(patchFile).Length,
                    NewHash = ComputeMD5(newFile),
                    Type = PatchType.Differential
                });
            }
            else if (!File.Exists(oldFile))
            {
                // New file — full copy
                File.Copy(newFile, Path.Combine(outputDir, fileName));
                manifest.Patches.Add(new PatchEntry
                {
                    FileName = fileName,
                    PatchSize = new FileInfo(newFile).Length,
                    NewHash = ComputeMD5(newFile),
                    Type = PatchType.Full
                });
            }
            // Unchanged files — skip
        }

        File.WriteAllText(
            Path.Combine(outputDir, "patch-manifest.json"),
            JsonUtility.ToJson(manifest, true));
        return manifest;
    }
}
```

## Step 3: Upload to CDN

### Multi-CDN Strategy

```yaml
# cdn-config.yaml
primary:
  provider: aliyun-oss
  bucket: gameforge-patches
  region: cn-shanghai
  endpoint: https://patches.gameforge.world

fallback:
  provider: aws-s3
  bucket: gameforge-patches-global
  region: ap-southeast-1
  endpoint: https://patches-global.gameforge.world

routing:
  cn: primary          # China users → Aliyun OSS
  default: fallback    # Global users → AWS S3
```

### Upload Script

```bash
#!/bin/bash
VERSION=$1
PATCH_DIR="artifacts/patches/$VERSION"

# Upload to primary CDN
ossutil cp -r "$PATCH_DIR" "oss://gameforge-patches/$VERSION/" --acl public-read

# Upload to fallback CDN
aws s3 sync "$PATCH_DIR" "s3://gameforge-patches-global/$VERSION/" --acl public-read

# Update version pointer
echo "{\"version\":\"$VERSION\",\"mandatory\":false,\"timestamp\":\"$(date -u +%FT%TZ)\"}" \
  | ossutil cp - "oss://gameforge-patches/latest.json" --acl public-read
```

## Step 4: Client Update Flow

```csharp
public class UpdateManager : MonoBehaviour
{
    [SerializeField] private string _cdnUrl = "https://patches.gameforge.world";

    public async Task<UpdateResult> CheckAndApply()
    {
        // 1. Fetch latest version
        var latest = await FetchJson<VersionInfo>($"{_cdnUrl}/latest.json");
        if (latest.Version == Application.version) return UpdateResult.UpToDate;

        // 2. Download patch manifest
        var manifest = await FetchJson<PatchManifest>($"{_cdnUrl}/{latest.Version}/patch-manifest.json");

        // 3. Download and apply patches
        foreach (var patch in manifest.Patches)
        {
            var data = await DownloadWithRetry($"{_cdnUrl}/{latest.Version}/{patch.FileName}");

            if (patch.Type == PatchType.Differential)
            {
                var oldData = LoadLocalDll(patch.FileName);
                data = BsDiff.Apply(oldData, data);
            }

            // Verify hash
            if (ComputeMD5(data) != patch.NewHash)
                return UpdateResult.HashMismatch; // trigger full re-download

            SaveLocalDll(patch.FileName, data);
        }

        // 4. Load via HybridCLR
        foreach (var patch in manifest.Patches)
        {
            var bytes = LoadLocalDll(patch.FileName);
            System.Reflection.Assembly.Load(bytes);
        }

        return UpdateResult.Applied;
    }
}
```

## Rollback Strategy

### Version Gates

```json
{
  "version": "1.0.3",
  "mandatory": true,
  "min_client_version": "1.0.1",
  "rollback_to": "1.0.2",
  "canary_percentage": 10,
  "health_check_url": "https://api.gameforge.world/health/1.0.3"
}
```

### Canary Deployment

1. Deploy to 10% of users (`canary_percentage: 10`)
2. Monitor error rates for 30 minutes
3. If error rate > threshold → auto-rollback to `rollback_to` version
4. If healthy → increase to 50% → 100%

### Emergency Revert

```bash
# Point latest.json back to previous version
echo '{"version":"1.0.2","mandatory":true}' \
  | ossutil cp - "oss://gameforge-patches/latest.json" --acl public-read
# All clients will revert on next check
```
