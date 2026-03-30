# Addressables Loading Patterns

## Core API

### Load Single Asset

```csharp
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

// Load by address
AsyncOperationHandle<GameObject> handle = Addressables.LoadAssetAsync<GameObject>("characters/player/warrior");
handle.Completed += op =>
{
    if (op.Status == AsyncOperationStatus.Succeeded)
    {
        GameObject prefab = op.Result;
        Instantiate(prefab);
    }
};

// Or with async/await (recommended)
async void LoadPlayer()
{
    GameObject prefab = await Addressables.LoadAssetAsync<GameObject>("characters/player/warrior").Task;
    Instantiate(prefab);
}
```

### Instantiate Directly

```csharp
// Load + Instantiate in one call (tracks instance for cleanup)
AsyncOperationHandle<GameObject> handle = Addressables.InstantiateAsync("characters/player/warrior");
// Later:
Addressables.ReleaseInstance(handle);
```

### Load Multiple by Label

```csharp
async void PreloadLevel(string levelLabel)
{
    var handle = Addressables.LoadAssetsAsync<Object>(levelLabel, obj =>
    {
        Debug.Log($"Loaded: {obj.name}");
    });
    await handle.Task;
    // All assets with this label are now loaded
}
```

### Load Scene

```csharp
var handle = Addressables.LoadSceneAsync("scenes/gameplay", LoadSceneMode.Additive);
await handle.Task;
// Later:
Addressables.UnloadSceneAsync(handle);
```

---

## Reference Counting & Memory Management

**Critical rule:** Every `LoadAssetAsync` must have a matching `Release`. Every `InstantiateAsync` must have a matching `ReleaseInstance`.

```csharp
/// <summary>
/// Asset handle tracker. Prevents memory leaks by ensuring all handles are released.
/// </summary>
public class AssetManager : MonoBehaviour
{
    private readonly Dictionary<string, AsyncOperationHandle> _loadedAssets = new();
    private readonly List<AsyncOperationHandle<GameObject>> _instances = new();

    public async Task<T> LoadAsync<T>(string address) where T : Object
    {
        if (_loadedAssets.TryGetValue(address, out var existing))
            return (T)existing.Result;

        var handle = Addressables.LoadAssetAsync<T>(address);
        await handle.Task;

        if (handle.Status == AsyncOperationStatus.Succeeded)
        {
            _loadedAssets[address] = handle;
            return handle.Result;
        }

        Addressables.Release(handle);
        return null;
    }

    public async Task<GameObject> InstantiateAsync(string address, Transform parent = null)
    {
        var handle = Addressables.InstantiateAsync(address, parent);
        await handle.Task;
        _instances.Add(handle);
        return handle.Result;
    }

    public void Unload(string address)
    {
        if (_loadedAssets.TryGetValue(address, out var handle))
        {
            Addressables.Release(handle);
            _loadedAssets.Remove(address);
        }
    }

    public void UnloadAll()
    {
        foreach (var handle in _instances)
            Addressables.ReleaseInstance(handle);
        _instances.Clear();

        foreach (var handle in _loadedAssets.Values)
            Addressables.Release(handle);
        _loadedAssets.Clear();
    }

    private void OnDestroy() => UnloadAll();
}
```

---

## Preloading Strategy

```csharp
/// <summary>
/// Preload assets during loading screen with progress tracking.
/// </summary>
public class Preloader
{
    public async Task<float> PreloadWithProgress(string[] addresses, IProgress<float> progress)
    {
        var handles = new List<AsyncOperationHandle>();
        long totalSize = 0;

        // Start all downloads
        foreach (var addr in addresses)
        {
            var handle = Addressables.LoadAssetAsync<Object>(addr);
            handles.Add(handle);
        }

        // Track progress
        while (handles.Any(h => !h.IsDone))
        {
            float total = handles.Sum(h => h.PercentComplete);
            progress?.Report(total / handles.Count);
            await Task.Yield();
        }

        progress?.Report(1f);
        return 1f;
    }
}
```

---

## Download Size Check

```csharp
// Check download size before downloading (for user confirmation)
async Task<long> GetDownloadSize(string label)
{
    var sizeHandle = Addressables.GetDownloadSizeAsync(label);
    long size = await sizeHandle.Task;
    Addressables.Release(sizeHandle);
    return size; // bytes. 0 = already cached
}

// Download with progress
async Task DownloadAssets(string label, Action<float> onProgress)
{
    var handle = Addressables.DownloadDependenciesAsync(label);
    while (!handle.IsDone)
    {
        onProgress?.Invoke(handle.PercentComplete);
        await Task.Yield();
    }
    Addressables.Release(handle);
}
```

---

## Memory Leak Detection

Common leak patterns:

| Pattern | Leak? | Fix |
|---------|-------|-----|
| `LoadAssetAsync` without `Release` | ✅ Leak | Always release when done |
| `InstantiateAsync` + `Destroy()` | ✅ Leak | Use `ReleaseInstance` instead |
| Scene unload without releasing assets | ✅ Leak | Release before scene change |
| Loading same asset twice | ⚠️ Ref count +2 | Track handles, load once |

### Profiling

```
Window → Asset Management → Addressables → Event Viewer
```

Shows real-time:
- Active handles and ref counts
- Load/unload events
- Bundle loading status
- Memory usage per group
