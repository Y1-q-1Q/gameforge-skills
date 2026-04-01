# Memory Management Guide

## Asset Memory Lifecycle

```
Load → Use → Reference Count → Unload
         ↓
    Texture, Mesh, AudioClip, Material, Shader
```

### The #1 Memory Mistake

```csharp
// ❌ Resources.Load never auto-unloads
var tex = Resources.Load<Texture2D>("big_texture"); // 4MB loaded
// ... used once, never unloaded
// Stays in memory FOREVER until Resources.UnloadUnusedAssets()

// ✅ Addressables with proper lifecycle
var handle = Addressables.LoadAssetAsync<Texture2D>("big_texture");
await handle.Task;
// ... use it
Addressables.Release(handle); // Explicitly unload when done
```

## Texture Memory Budget

Textures are typically 60-80% of runtime memory.

| Platform | Total Budget | Texture Budget | Max Single Texture |
|----------|-------------|----------------|-------------------|
| Mobile (low) | 300 MB | 150 MB | 2048x2048 |
| Mobile (mid) | 500 MB | 300 MB | 2048x2048 |
| Mobile (high) | 800 MB | 500 MB | 4096x4096 |
| PC | 2-4 GB | 1-2 GB | 4096x4096 |
| Console | 3-5 GB | 2-3 GB | 4096x4096 |

### Texture Compression Format Selection

| Platform | Format | Quality | Size vs RGBA32 |
|----------|--------|---------|----------------|
| Android | ASTC 6x6 | Good | ~6x smaller |
| Android (low) | ETC2 | OK | ~6x smaller |
| iOS | ASTC 4x4 | Great | ~4x smaller |
| PC/Console | BC7 | Great | ~4x smaller |
| WebGL | DXT5/ETC2 | OK | ~4x smaller |

**Rule**: Never ship uncompressed textures. A 2048x2048 RGBA32 = 16MB. ASTC 6x6 = ~2.7MB.

## Memory Leak Detection

### Step 1: Take Snapshots

```
1. Load scene A → Memory Profiler snapshot
2. Load scene B → snapshot
3. Load scene A again → snapshot
4. Compare snapshot 1 vs 3 — any growth = leak
```

### Common Leak Sources

| Source | Symptom | Fix |
|--------|---------|-----|
| Event listeners not removed | Objects never GC'd | `-=` in OnDestroy |
| Static references | Holds entire object graph | WeakReference or null on scene change |
| Addressables not released | Asset memory grows | Track handles, release on unload |
| RenderTexture not released | GPU memory grows | Release() in OnDestroy |
| Material instances (.material) | New material per access | Use .sharedMaterial or cache |
| Coroutine on destroyed object | Coroutine keeps ref | StopCoroutine in OnDestroy |

### Automated Leak Check Script

```csharp
#if UNITY_EDITOR
[MenuItem("GameForge/Memory/Check Leaks")]
static void CheckLeaks()
{
    var textures = Resources.FindObjectsOfTypeAll<Texture2D>();
    var meshes = Resources.FindObjectsOfTypeAll<Mesh>();
    long texMem = textures.Sum(t => Profiler.GetRuntimeMemorySizeLong(t));
    long meshMem = meshes.Sum(m => Profiler.GetRuntimeMemorySizeLong(m));

    Debug.Log($"Textures: {textures.Length} ({texMem / 1024 / 1024} MB)");
    Debug.Log($"Meshes: {meshes.Length} ({meshMem / 1024 / 1024} MB)");

    // Flag suspiciously large textures
    foreach (var t in textures.Where(t => Profiler.GetRuntimeMemorySizeLong(t) > 4 * 1024 * 1024))
        Debug.LogWarning($"Large texture: {t.name} ({Profiler.GetRuntimeMemorySizeLong(t) / 1024 / 1024} MB)");
}
#endif
```

## Incremental GC (Unity 2021.2+)

```
Project Settings → Player → Configuration → Use Incremental GC ✅
```

Spreads GC work across frames instead of one big spike. But still:
- Avoid allocations in hot paths (Update, FixedUpdate)
- Pre-allocate collections
- Use `stackalloc` for small temporary buffers (C# 7.2+)

```csharp
// stackalloc for small temp buffers (no GC)
unsafe void ProcessNearby(Vector3 center, float radius)
{
    Span<RaycastHit> hits = stackalloc RaycastHit[16];
    // ... use hits, zero allocation
}
```

## Asset Bundle / Addressables Memory Patterns

```csharp
// Pattern: Load group → use → unload group
public class SceneAssetManager : MonoBehaviour
{
    private readonly List<AsyncOperationHandle> _handles = new();

    public async UniTask LoadSceneAssets(string label)
    {
        var handle = Addressables.LoadAssetsAsync<Object>(label, null);
        _handles.Add(handle);
        await handle.Task;
    }

    public void UnloadAll()
    {
        foreach (var h in _handles)
            Addressables.Release(h);
        _handles.Clear();
    }

    void OnDestroy() => UnloadAll();
}
```
