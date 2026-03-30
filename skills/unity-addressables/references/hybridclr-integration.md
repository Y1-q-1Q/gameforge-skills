# Addressables + HybridCLR Integration

## The Problem

HybridCLR hot-updates **code** (DLLs). Addressables hot-updates **assets** (bundles). In a real game, you need both — new code that references new assets, delivered together.

## Architecture

```
CDN
├── hotupdate/
│   ├── manifest.json           # Code update manifest
│   ├── GameLogic.dll.lz4       # Hot-update code
│   └── UI.dll.lz4
│
└── assets/
    ├── Android/
    │   ├── catalog.hash        # Asset catalog
    │   ├── catalog.json
    │   └── *.bundle            # Asset bundles
    └── iOS/
        └── ...
```

## Boot Sequence (Combined)

```
App Launch
  │
  ├─ 1. Check code updates (HybridCLR manifest)
  │     └─ Download changed DLLs
  │
  ├─ 2. Check asset updates (Addressables catalog)
  │     └─ Download changed bundles
  │
  ├─ 3. Load AOT supplementary metadata
  │
  ├─ 4. Load hot-update assemblies
  │
  ├─ 5. Initialize Addressables
  │     └─ Addressables.InitializeAsync()
  │
  └─ 6. Call hot-update entry point
        └─ Game code loads assets via Addressables
```

## Combined Loader

```csharp
/// <summary>
/// Unified loader that handles both code and asset hot-updates.
/// Ensures correct load order: code first, then assets.
/// </summary>
public class UnifiedHotUpdateLoader : MonoBehaviour
{
    [SerializeField] private string codeCdnUrl = "https://cdn.gameforge.world/hotupdate";
    [SerializeField] private string entryType = "GameForge.GameLogic.GameEntry";

    public event Action<string, float> OnProgress; // (stage, 0-1)

    public void StartLoad() => StartCoroutine(LoadAll());

    private IEnumerator LoadAll()
    {
        // Phase 1: Code update
        OnProgress?.Invoke("Checking for updates...", 0f);
        yield return UpdateCode();

        // Phase 2: Asset catalog update
        OnProgress?.Invoke("Updating assets...", 0.4f);
        yield return UpdateAssets();

        // Phase 3: Load code
        OnProgress?.Invoke("Loading...", 0.7f);
        LoadAOTMetadata();
        LoadHotUpdateAssemblies();

        // Phase 4: Initialize Addressables
        OnProgress?.Invoke("Initializing...", 0.9f);
        var initHandle = Addressables.InitializeAsync();
        yield return initHandle;

        // Phase 5: Enter game
        OnProgress?.Invoke("Starting...", 1f);
        CallEntry();
    }

    private IEnumerator UpdateCode()
    {
        // Fetch code manifest
        using var req = UnityWebRequest.Get($"{codeCdnUrl}/manifest.json?t={Time.time}");
        req.timeout = 10;
        yield return req.SendWebRequest();

        if (req.result != UnityWebRequest.Result.Success) yield break;

        var manifest = JsonUtility.FromJson<UpdateManifest>(req.downloadHandler.text);
        var localVersion = PlayerPrefs.GetString("CodeVersion", "0");
        if (string.Compare(manifest.version, localVersion, StringComparison.Ordinal) <= 0) yield break;

        // Download changed DLLs
        var cacheDir = Path.Combine(Application.persistentDataPath, "HotUpdate");
        Directory.CreateDirectory(cacheDir);

        foreach (var file in manifest.files)
        {
            using var dlReq = UnityWebRequest.Get($"{codeCdnUrl}/{file.name}");
            yield return dlReq.SendWebRequest();
            if (dlReq.result == UnityWebRequest.Result.Success)
                File.WriteAllBytes(Path.Combine(cacheDir, file.name), dlReq.downloadHandler.data);
        }

        PlayerPrefs.SetString("CodeVersion", manifest.version);
        PlayerPrefs.Save();
    }

    private IEnumerator UpdateAssets()
    {
        var checkHandle = Addressables.CheckForCatalogUpdates();
        yield return checkHandle;

        if (checkHandle.Result != null && checkHandle.Result.Count > 0)
        {
            var updateHandle = Addressables.UpdateCatalogs(checkHandle.Result);
            yield return updateHandle;
            Addressables.Release(updateHandle);
        }
        Addressables.Release(checkHandle);
    }

    private void LoadAOTMetadata() { /* Same as runtime-loading.md */ }
    private void LoadHotUpdateAssemblies() { /* Same as runtime-loading.md */ }
    private void CallEntry() { /* Same as runtime-loading.md */ }
}
```

## Version Coordination

Code and assets must be compatible. Use a shared version number:

```json
// Code manifest
{ "version": "20260331", "minAssetVersion": "20260331" }

// Asset catalog custom field (or separate version file)
{ "assetVersion": "20260331", "minCodeVersion": "20260331" }
```

```csharp
// Verify compatibility before loading
bool IsCompatible(string codeVersion, string assetVersion)
{
    // Simple: versions must match
    return codeVersion == assetVersion;

    // Or: code version >= asset's minimum requirement
    // return string.Compare(codeVersion, minCodeVersion) >= 0;
}
```

## Common Pitfalls

| Pitfall | Impact | Solution |
|---------|--------|---------|
| Load assets before code | Hot-update types not available | Always load code first |
| Version mismatch | Code references assets that don't exist | Coordinate versions |
| Addressables init before HybridCLR | Generic methods fail | Load metadata before Addressables.InitializeAsync |
| Forgetting to rebuild both | Stale code or stale assets | CI/CD builds both together |
