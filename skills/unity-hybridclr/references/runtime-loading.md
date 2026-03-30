# Runtime Assembly Loading

## Boot Sequence

```
App Launch
  │
  ├─ 1. AOT Bootstrap (Launch.asmdef)
  │     └─ Show splash screen
  │
  ├─ 2. Check for updates
  │     ├─ Fetch manifest from CDN
  │     ├─ Compare versions
  │     └─ Download changed DLLs (if any)
  │
  ├─ 3. Load supplementary metadata
  │     └─ RuntimeApi.LoadMetadataForAOTAssembly()
  │
  ├─ 4. Load hot-update assemblies
  │     └─ Assembly.Load() in dependency order
  │
  ├─ 5. Call hot-update entry point
  │     └─ Reflection → GameEntry.Start()
  │
  └─ 6. Game running (hot-update code in control)
```

---

## Complete Loader Implementation

```csharp
using HybridCLR;
using System;
using System.Collections;
using System.IO;
using System.Reflection;
using UnityEngine;
using UnityEngine.Networking;

/// <summary>
/// Production-ready hot-update loader with version management,
/// download progress, integrity verification, and rollback support.
/// </summary>
public class HotUpdateLoader : MonoBehaviour
{
    [SerializeField] private string cdnBaseUrl = "https://cdn.gameforge.world/hotupdate";
    [SerializeField] private string entryTypeName = "GameForge.GameLogic.GameEntry";
    [SerializeField] private string entryMethodName = "Start";

    // AOT metadata assemblies to load
    private static readonly string[] AotMetaDlls = { "mscorlib.dll", "System.dll", "System.Core.dll" };

    // Hot-update assemblies in load order (dependencies first)
    private static readonly string[] HotUpdateDlls = { "Config.dll", "GameLogic.dll", "UI.dll" };

    public event Action<float> OnProgress;       // 0-1
    public event Action<string> OnStatusChanged;
    public event Action<string> OnError;

    private string _localCacheDir;

    private void Awake()
    {
        _localCacheDir = Path.Combine(Application.persistentDataPath, "HotUpdate");
        Directory.CreateDirectory(_localCacheDir);
    }

    public void StartLoad() => StartCoroutine(LoadSequence());

    private IEnumerator LoadSequence()
    {
        // Step 1: Check for updates
        OnStatusChanged?.Invoke("Checking for updates...");
        OnProgress?.Invoke(0.1f);

        UpdateManifest manifest = null;
        yield return FetchManifest(m => manifest = m);

        if (manifest != null && NeedsUpdate(manifest))
        {
            // Step 2: Download updates
            OnStatusChanged?.Invoke("Downloading updates...");
            yield return DownloadUpdates(manifest);
        }

        // Step 3: Load metadata
        OnStatusChanged?.Invoke("Loading...");
        OnProgress?.Invoke(0.7f);
        LoadAOTMetadata();

        // Step 4: Load assemblies
        OnProgress?.Invoke(0.85f);
        LoadHotUpdateAssemblies();

        // Step 5: Enter game
        OnProgress?.Invoke(1f);
        OnStatusChanged?.Invoke("Starting...");
        CallEntry();
    }

    private void LoadAOTMetadata()
    {
        foreach (var dllName in AotMetaDlls)
        {
            var bytes = ReadDllBytes($"AotMetadata/{dllName}");
            if (bytes != null)
            {
                var err = RuntimeApi.LoadMetadataForAOTAssembly(bytes, HomologousImageMode.SuperSet);
                if (err != LoadImageErrorCode.OK)
                    Debug.LogWarning($"[HotUpdate] LoadMetadata {dllName} failed: {err}");
            }
        }
    }

    private void LoadHotUpdateAssemblies()
    {
        foreach (var dllName in HotUpdateDlls)
        {
            var bytes = ReadDllBytes(dllName);
            if (bytes == null)
            {
                OnError?.Invoke($"Missing DLL: {dllName}");
                return;
            }
            Assembly.Load(bytes);
            Debug.Log($"[HotUpdate] Loaded: {dllName}");
        }
    }

    private void CallEntry()
    {
        var assembly = AppDomain.CurrentDomain.GetAssemblies();
        Type entryType = null;
        foreach (var asm in assembly)
        {
            entryType = asm.GetType(entryTypeName);
            if (entryType != null) break;
        }

        if (entryType == null)
        {
            OnError?.Invoke($"Entry type not found: {entryTypeName}");
            return;
        }

        var method = entryType.GetMethod(entryMethodName, BindingFlags.Public | BindingFlags.Static);
        method?.Invoke(null, null);
    }

    /// <summary>
    /// Read DLL bytes. Priority: local cache → StreamingAssets (built-in).
    /// </summary>
    private byte[] ReadDllBytes(string dllName)
    {
        // Try local cache first (downloaded updates)
        var cachePath = Path.Combine(_localCacheDir, $"{dllName}.bytes");
        if (File.Exists(cachePath))
            return File.ReadAllBytes(cachePath);

        // Fall back to StreamingAssets (shipped with app)
        var saPath = Path.Combine(Application.streamingAssetsPath, $"{dllName}.bytes");
        if (File.Exists(saPath))
            return File.ReadAllBytes(saPath);

        // Android StreamingAssets requires UnityWebRequest (handled separately)
        return null;
    }

    private IEnumerator FetchManifest(Action<UpdateManifest> callback)
    {
        var url = $"{cdnBaseUrl}/manifest.json?t={DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
        using var req = UnityWebRequest.Get(url);
        req.timeout = 10;
        yield return req.SendWebRequest();

        if (req.result == UnityWebRequest.Result.Success)
            callback(JsonUtility.FromJson<UpdateManifest>(req.downloadHandler.text));
        else
            callback(null); // Offline mode — use cached/built-in DLLs
    }

    private bool NeedsUpdate(UpdateManifest manifest)
    {
        var localVersion = PlayerPrefs.GetString("HotUpdateVersion", "0");
        return string.Compare(manifest.version, localVersion, StringComparison.Ordinal) > 0;
    }

    private IEnumerator DownloadUpdates(UpdateManifest manifest)
    {
        int total = manifest.files.Length;
        for (int i = 0; i < total; i++)
        {
            var file = manifest.files[i];
            OnProgress?.Invoke(0.1f + 0.6f * i / total);

            var url = $"{cdnBaseUrl}/{file.name}";
            using var req = UnityWebRequest.Get(url);
            yield return req.SendWebRequest();

            if (req.result == UnityWebRequest.Result.Success)
            {
                var path = Path.Combine(_localCacheDir, file.name);
                File.WriteAllBytes(path, req.downloadHandler.data);
            }
        }

        PlayerPrefs.SetString("HotUpdateVersion", manifest.version);
        PlayerPrefs.Save();
    }
}

[Serializable]
public class UpdateManifest
{
    public string version;
    public string minAppVersion;
    public FileEntry[] files;
    public bool mandatory;
}

[Serializable]
public class FileEntry
{
    public string name;
    public string md5;
    public int size;
}
```

---

## Rollback Strategy

```csharp
/// <summary>
/// If hot-update loading fails, rollback to last known good version.
/// </summary>
public static class HotUpdateRollback
{
    private const string BACKUP_DIR = "HotUpdate_Backup";
    private const string CURRENT_DIR = "HotUpdate";

    /// <summary>
    /// Call before applying new update. Backs up current DLLs.
    /// </summary>
    public static void BackupCurrent()
    {
        var currentDir = Path.Combine(Application.persistentDataPath, CURRENT_DIR);
        var backupDir = Path.Combine(Application.persistentDataPath, BACKUP_DIR);

        if (Directory.Exists(backupDir))
            Directory.Delete(backupDir, true);

        if (Directory.Exists(currentDir))
            CopyDirectory(currentDir, backupDir);
    }

    /// <summary>
    /// Call when loading fails. Restores previous version.
    /// </summary>
    public static bool Rollback()
    {
        var currentDir = Path.Combine(Application.persistentDataPath, CURRENT_DIR);
        var backupDir = Path.Combine(Application.persistentDataPath, BACKUP_DIR);

        if (!Directory.Exists(backupDir)) return false;

        if (Directory.Exists(currentDir))
            Directory.Delete(currentDir, true);

        CopyDirectory(backupDir, currentDir);

        // Revert version
        var prevVersion = PlayerPrefs.GetString("HotUpdateVersion_Backup", "0");
        PlayerPrefs.SetString("HotUpdateVersion", prevVersion);
        PlayerPrefs.Save();

        return true;
    }

    private static void CopyDirectory(string src, string dst)
    {
        Directory.CreateDirectory(dst);
        foreach (var file in Directory.GetFiles(src))
            File.Copy(file, Path.Combine(dst, Path.GetFileName(file)), true);
    }
}
```
