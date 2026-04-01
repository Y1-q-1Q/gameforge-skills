# Asset Pipeline & Build Automation

## AssetPostprocessor (Auto-Configure Imports)

```csharp
public class TextureImportRules : AssetPostprocessor
{
    void OnPreprocessTexture()
    {
        var importer = (TextureImporter)assetImporter;

        // Auto-configure sprites
        if (assetPath.Contains("/Sprites/"))
        {
            importer.textureType = TextureImporterType.Sprite;
            importer.spritePixelsPerUnit = 32;
            importer.filterMode = FilterMode.Point; // Pixel art
            importer.textureCompression = TextureImporterCompression.Uncompressed;
        }

        // Auto-configure UI textures
        if (assetPath.Contains("/UI/"))
        {
            importer.textureType = TextureImporterType.Sprite;
            importer.mipmapEnabled = false; // UI doesn't need mipmaps
            importer.maxTextureSize = 2048;
        }

        // Mobile texture limits
        if (assetPath.Contains("/Textures/"))
        {
            var android = importer.GetPlatformTextureSettings("Android");
            android.overridden = true;
            android.maxTextureSize = 2048;
            android.format = TextureImporterFormat.ASTC_6x6;
            importer.SetPlatformTextureSettings(android);
        }
    }

    void OnPreprocessAudio()
    {
        var importer = (AudioImporter)assetImporter;

        // SFX: mono, compressed
        if (assetPath.Contains("/SFX/"))
        {
            importer.forceToMono = true;
            var settings = importer.defaultSampleSettings;
            settings.loadType = AudioClipLoadType.DecompressOnLoad;
            settings.compressionFormat = AudioCompressionFormat.ADPCM;
            importer.defaultSampleSettings = settings;
        }

        // BGM: streaming
        if (assetPath.Contains("/Music/"))
        {
            var settings = importer.defaultSampleSettings;
            settings.loadType = AudioClipLoadType.Streaming;
            settings.compressionFormat = AudioCompressionFormat.Vorbis;
            settings.quality = 0.5f;
            importer.defaultSampleSettings = settings;
        }
    }
}
```

## Build Hooks

```csharp
// Pre-build: validate, set version, clean
public class PreBuildHook : IPreprocessBuildWithReport
{
    public int callbackOrder => 0;

    public void OnPreprocessBuild(BuildReport report)
    {
        // Auto-increment build number
        int buildNum = PlayerSettings.Android.bundleVersionCode + 1;
        PlayerSettings.Android.bundleVersionCode = buildNum;
        PlayerSettings.iOS.buildNumber = buildNum.ToString();

        // Validate: no missing references
        var scenes = EditorBuildSettings.scenes.Where(s => s.enabled);
        foreach (var scene in scenes)
        {
            if (!File.Exists(scene.path))
                throw new BuildFailedException($"Missing scene: {scene.path}");
        }

        Debug.Log($"Pre-build: version {PlayerSettings.bundleVersion} build #{buildNum}");
    }
}

// Post-build: notify, upload symbols, archive
public class PostBuildHook : IPostprocessBuildWithReport
{
    public int callbackOrder => 0;

    public void OnPostprocessBuild(BuildReport report)
    {
        if (report.summary.result == BuildResult.Succeeded)
        {
            Debug.Log($"Build succeeded: {report.summary.outputPath}");
            Debug.Log($"Size: {report.summary.totalSize / 1024 / 1024} MB");
            Debug.Log($"Time: {report.summary.totalTime}");
        }
    }
}
```

## Batch Operations (Menu Items)

```csharp
public static class BatchTools
{
    [MenuItem("GameForge/Batch/Set All Sprites to Point Filter")]
    static void SetSpritesPointFilter()
    {
        var guids = AssetDatabase.FindAssets("t:Texture2D", new[] { "Assets/Sprites" });
        int count = 0;

        foreach (var guid in guids)
        {
            string path = AssetDatabase.GUIDToAssetPath(guid);
            var importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer != null && importer.filterMode != FilterMode.Point)
            {
                importer.filterMode = FilterMode.Point;
                importer.SaveAndReimport();
                count++;
            }
        }

        Debug.Log($"Updated {count} sprites to Point filter");
    }

    [MenuItem("GameForge/Batch/Find Missing References")]
    static void FindMissingReferences()
    {
        var allObjects = Resources.FindObjectsOfTypeAll<GameObject>();
        int missing = 0;

        foreach (var go in allObjects)
        {
            foreach (var component in go.GetComponents<Component>())
            {
                if (component == null)
                {
                    Debug.LogWarning($"Missing component on: {GetFullPath(go)}", go);
                    missing++;
                    continue;
                }

                var so = new SerializedObject(component);
                var prop = so.GetIterator();
                while (prop.NextVisible(true))
                {
                    if (prop.propertyType == SerializedPropertyType.ObjectReference &&
                        prop.objectReferenceValue == null &&
                        prop.objectReferenceInstanceIDValue != 0)
                    {
                        Debug.LogWarning(
                            $"Missing ref: {GetFullPath(go)}.{component.GetType().Name}.{prop.name}", go);
                        missing++;
                    }
                }
            }
        }

        Debug.Log(missing == 0 ? "No missing references found!" : $"Found {missing} missing references");
    }

    static string GetFullPath(GameObject go)
    {
        string path = go.name;
        var parent = go.transform.parent;
        while (parent != null) { path = parent.name + "/" + path; parent = parent.parent; }
        return path;
    }
}
```

## Keyboard Shortcuts

```csharp
// Method 1: MenuItem shortcut
[MenuItem("GameForge/Quick Play _F5")] // F5 key
static void QuickPlay() => EditorApplication.isPlaying = !EditorApplication.isPlaying;

[MenuItem("GameForge/Screenshot #F12")] // Shift+F12
static void TakeScreenshot()
{
    string path = $"Screenshots/screenshot_{System.DateTime.Now:yyyyMMdd_HHmmss}.png";
    ScreenCapture.CaptureScreenshot(path, 2); // 2x resolution
    Debug.Log($"Screenshot saved: {path}");
}

// Method 2: ShortcutManager (Unity 2019.1+)
[Shortcut("GameForge/Toggle Gizmos", KeyCode.G, ShortcutModifiers.Alt)]
static void ToggleGizmos()
{
    SceneView.lastActiveSceneView.drawGizmos = !SceneView.lastActiveSceneView.drawGizmos;
    SceneView.lastActiveSceneView.Repaint();
}
```
