# Differential Update Strategy

## Why Differential Updates?

Full DLL replacement wastes bandwidth. A typical hot-update DLL is 200-500KB. If only 5% of code changed, users download 95% redundant data.

Differential updates send only the binary diff — typically 60-80% smaller.

---

## Strategy Comparison

| Strategy | Patch Size | Complexity | Best For |
|----------|-----------|------------|----------|
| Full replace | 100% | ⭐ | Small DLLs (< 50KB) |
| Binary diff (bsdiff) | 10-40% | ⭐⭐ | Medium DLLs, infrequent updates |
| Per-assembly versioning | Varies | ⭐⭐ | Many assemblies, only some change |
| Chunked diff | 15-50% | ⭐⭐⭐ | Large DLLs, CDN-friendly |

---

## Recommended: Per-Assembly Versioning + Compression

The simplest effective strategy. Each assembly has its own version hash. Only download assemblies that changed.

### Manifest Format

```json
{
  "version": "20260331",
  "assemblies": {
    "GameLogic.dll": { "md5": "abc123", "size": 245760, "url": "GameLogic.dll.lz4" },
    "UI.dll":        { "md5": "def456", "size": 189440, "url": "UI.dll.lz4" },
    "Config.dll":    { "md5": "789ghi", "size": 45056,  "url": "Config.dll.lz4" }
  },
  "metadata": {
    "mscorlib.dll": { "md5": "jkl012", "size": 12288, "url": "mscorlib.dll.lz4" }
  }
}
```

### Client-Side Logic

```csharp
/// <summary>
/// Compare local and remote manifests. Only download changed assemblies.
/// </summary>
public class DifferentialUpdater
{
    private readonly string _cacheDir;
    private readonly string _cdnBase;

    public DifferentialUpdater(string cacheDir, string cdnBase)
    {
        _cacheDir = cacheDir;
        _cdnBase = cdnBase;
    }

    /// <summary>
    /// Returns list of assemblies that need downloading.
    /// </summary>
    public List<string> GetChangedAssemblies(Dictionary<string, AssemblyInfo> local, Dictionary<string, AssemblyInfo> remote)
    {
        var changed = new List<string>();
        foreach (var (name, info) in remote)
        {
            if (!local.ContainsKey(name) || local[name].md5 != info.md5)
                changed.Add(name);
        }
        return changed;
    }

    /// <summary>
    /// Download only changed assemblies with LZ4 decompression.
    /// </summary>
    public IEnumerator DownloadChanged(List<string> changed, Dictionary<string, AssemblyInfo> remote, Action<float> onProgress)
    {
        long totalBytes = changed.Sum(n => remote[n].size);
        long downloaded = 0;

        foreach (var name in changed)
        {
            var info = remote[name];
            using var req = UnityWebRequest.Get($"{_cdnBase}/{info.url}");
            yield return req.SendWebRequest();

            if (req.result == UnityWebRequest.Result.Success)
            {
                // Decompress LZ4
                var compressed = req.downloadHandler.data;
                var decompressed = LZ4Decompress(compressed, info.size);

                // Verify integrity
                var md5 = ComputeMD5(decompressed);
                if (md5 != info.md5)
                {
                    Debug.LogError($"[DiffUpdate] MD5 mismatch for {name}");
                    continue;
                }

                File.WriteAllBytes(Path.Combine(_cacheDir, $"{name}.bytes"), decompressed);
                downloaded += info.size;
                onProgress?.Invoke((float)downloaded / totalBytes);
            }
        }
    }

    private static byte[] LZ4Decompress(byte[] compressed, int originalSize)
    {
        var output = new byte[originalSize];
        // Use K4os.Compression.LZ4 or Unity's built-in compression
        // LZ4Codec.Decode(compressed, 0, compressed.Length, output, 0, originalSize);
        return output;
    }

    private static string ComputeMD5(byte[] data)
    {
        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(data);
        return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
    }
}

[Serializable]
public class AssemblyInfo
{
    public string md5;
    public int size;
    public string url;
}
```

---

## Server-Side Build Script

```bash
#!/bin/bash
# Generate compressed DLLs and manifest for CDN upload

OUTPUT_DIR="cdn_output"
mkdir -p $OUTPUT_DIR

declare -A ASSEMBLIES

for dll in HotUpdateDlls/*.dll.bytes; do
    name=$(basename "$dll" .bytes)
    md5=$(md5sum "$dll" | cut -d' ' -f1)
    size=$(stat -f%z "$dll" 2>/dev/null || stat -c%s "$dll")
    
    # Compress with LZ4
    lz4 -9 "$dll" "$OUTPUT_DIR/${name}.lz4"
    
    ASSEMBLIES[$name]="{\"md5\":\"$md5\",\"size\":$size,\"url\":\"${name}.lz4\"}"
done

# Generate manifest
echo "{" > "$OUTPUT_DIR/manifest.json"
echo "  \"version\": \"$(date +%Y%m%d%H%M%S)\"," >> "$OUTPUT_DIR/manifest.json"
echo "  \"assemblies\": {" >> "$OUTPUT_DIR/manifest.json"
# ... write assembly entries
echo "  }" >> "$OUTPUT_DIR/manifest.json"
echo "}" >> "$OUTPUT_DIR/manifest.json"

echo "Done. Upload $OUTPUT_DIR/ to CDN."
```

---

## Bandwidth Savings Example

| Assembly | Full Size | Changed Code | Diff Size | Savings |
|----------|----------|-------------|-----------|---------|
| GameLogic.dll | 240 KB | 5% | 12 KB + LZ4 = 8 KB | 97% |
| UI.dll | 180 KB | 10% | 18 KB + LZ4 = 12 KB | 93% |
| Config.dll | 45 KB | 100% (new tables) | 45 KB + LZ4 = 28 KB | 38% |
| **Total** | **465 KB** | | **48 KB** | **90%** |

For a game with 1M DAU updating daily, this saves ~400 GB/day of CDN bandwidth.
