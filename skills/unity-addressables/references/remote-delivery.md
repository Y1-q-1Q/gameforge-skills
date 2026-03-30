# Remote Asset Delivery (CDN)

## Architecture

```
Unity App                          CDN (Aliyun OSS / CloudFront / etc.)
   │                                  │
   ├─ 1. Fetch catalog.hash ─────────►│
   │◄─── hash value ──────────────────┤
   │                                  │
   ├─ 2. Compare with local hash      │
   │     (if different → update)      │
   │                                  │
   ├─ 3. Fetch catalog.json ─────────►│
   │◄─── updated catalog ────────────┤
   │                                  │
   ├─ 4. Load asset by address        │
   │     → resolve to bundle URL      │
   │                                  │
   ├─ 5. Download bundle ────────────►│
   │◄─── bundle data ────────────────┤
   │                                  │
   └─ 6. Cache locally (UnityWebRequestAssetBundle cache)
```

---

## CDN Setup

### Addressables Profile (Remote)

```
BuildPath:  ServerData/[BuildTarget]
LoadPath:   https://cdn.gameforge.world/assets/[BuildTarget]
```

### Build & Upload

```bash
# 1. Build addressables in Unity
#    Addressables Groups → Build → New Build → Default Build Script

# 2. Upload to CDN
# Output is in: ServerData/<BuildTarget>/
#   ├── catalog_<timestamp>.hash
#   ├── catalog_<timestamp>.json
#   └── <bundle_name>_<hash>.bundle (multiple)

# Aliyun OSS example:
ossutil cp -r ServerData/Android/ oss://gameforge-cdn/assets/Android/ --acl public-read

# AWS S3 example:
aws s3 sync ServerData/Android/ s3://gameforge-cdn/assets/Android/ --acl public-read
```

### Cache Headers

Set proper cache headers on CDN:

| File | Cache-Control | Why |
|------|--------------|-----|
| `*.hash` | `no-cache` | Always check for updates |
| `*.json` (catalog) | `no-cache` | Must be fresh |
| `*.bundle` | `max-age=31536000, immutable` | Content-addressed, never changes |

Bundles are content-addressed (filename includes hash), so they can be cached forever. Only the catalog needs freshness checks.

---

## Content Update Workflow

### Initial Release
```
1. Build full addressables → upload all bundles + catalog to CDN
2. Ship app with local catalog pointing to CDN
```

### Content Patch (no app update)
```
1. Modify assets in Unity
2. Addressables → Tools → Check for Content Update Restrictions
3. Addressables → Build → Update a Previous Build
4. Upload ONLY new/changed bundles + updated catalog to CDN
5. App fetches new catalog on next launch → downloads changed bundles
```

### What Gets Updated

| Change | New Bundle? | Catalog Update? |
|--------|------------|----------------|
| Modified texture in remote group | ✅ New bundle | ✅ |
| New asset added to remote group | ✅ New bundle | ✅ |
| Asset removed from remote group | ❌ | ✅ (reference removed) |
| Modified asset in local group | ❌ (requires app update) | ❌ |
| No changes | ❌ | ❌ |

---

## Catalog Update at Runtime

```csharp
/// <summary>
/// Check for and apply catalog updates on app launch.
/// </summary>
public class CatalogUpdater
{
    public async Task<bool> CheckAndUpdate(Action<float> onProgress = null)
    {
        // Check if updates available
        var checkHandle = Addressables.CheckForCatalogUpdates();
        var catalogs = await checkHandle.Task;
        Addressables.Release(checkHandle);

        if (catalogs == null || catalogs.Count == 0)
            return false; // No updates

        // Apply catalog updates
        var updateHandle = Addressables.UpdateCatalogs(catalogs);
        while (!updateHandle.IsDone)
        {
            onProgress?.Invoke(updateHandle.PercentComplete);
            await Task.Yield();
        }
        Addressables.Release(updateHandle);

        return true; // Catalog updated, new assets available
    }
}
```

---

## Offline / Fallback Strategy

```csharp
/// <summary>
/// Try remote first, fall back to local cache or built-in assets.
/// </summary>
public async Task<T> LoadWithFallback<T>(string address) where T : Object
{
    try
    {
        // This automatically uses cache if available
        var handle = Addressables.LoadAssetAsync<T>(address);
        var result = await handle.Task;
        if (handle.Status == AsyncOperationStatus.Succeeded)
            return result;
    }
    catch (Exception e)
    {
        Debug.LogWarning($"[Assets] Remote load failed for {address}: {e.Message}");
    }

    // Addressables caches bundles automatically via UnityWebRequest cache
    // If the bundle was ever downloaded, it's available offline
    // If never downloaded and no network → load fails
    return null;
}
```

---

## CDN Cost Estimation

| DAU | Avg Download/User | Monthly Bandwidth | Aliyun OSS Cost |
|-----|-------------------|-------------------|-----------------|
| 10K | 5 MB | ~1.5 TB | ~$120 |
| 100K | 5 MB | ~15 TB | ~$900 |
| 1M | 5 MB | ~150 TB | ~$6,000 |

**Optimization tips:**
- Use LZ4 compression (built into Addressables)
- Set proper cache headers (bundles cached forever)
- Use content update builds (only changed bundles)
- Consider regional CDN nodes for China (Aliyun) vs global (CloudFront)
