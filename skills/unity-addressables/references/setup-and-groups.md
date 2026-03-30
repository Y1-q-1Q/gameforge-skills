# Addressables Setup & Group Strategy

## Installation

```
Unity Package Manager → Add package by name:
  com.unity.addressables
```

Or `Packages/manifest.json`:
```json
{ "dependencies": { "com.unity.addressables": "1.21.21" } }
```

After install: `Window → Asset Management → Addressables → Groups`

---

## Profiles

Profiles define where assets are built and loaded from. Configure in `Addressables Groups → Profiles`.

| Profile | BuildPath | LoadPath | Use Case |
|---------|-----------|----------|----------|
| Default | `[UnityEngine.AddressableAssets.Addressables.BuildPath]` | `{UnityEngine.AddressableAssets.Addressables.RuntimePath}` | Local development |
| Remote | `ServerData/[BuildTarget]` | `https://cdn.gameforge.world/assets/[BuildTarget]` | Production CDN |
| Staging | `ServerData/[BuildTarget]` | `https://staging-cdn.gameforge.world/assets/[BuildTarget]` | QA testing |

---

## Group Strategy

### Principle: Group by Lifetime and Load Pattern

Assets that load together should be in the same group. Assets with different lifetimes should be in different groups.

### Recommended Groups

```
Addressable Groups:
├── Local_Static              # Ships with app, never changes
│   ├── Shaders
│   ├── Core UI (fonts, icons)
│   └── Audio (BGM, common SFX)
│
├── Local_Scenes              # Scene assets, loaded per-scene
│   ├── MainMenu scene
│   ├── Loading scene
│   └── Shared scene assets
│
├── Remote_Characters         # Downloadable, updateable
│   ├── Player models
│   ├── NPC models
│   └── Character animations
│
├── Remote_Levels             # Per-level content
│   ├── Level_01 (env + props + lighting)
│   ├── Level_02
│   └── Level_03
│
├── Remote_UI                 # UI that may change (events, promotions)
│   ├── Event banners
│   ├── Shop UI
│   └── Seasonal themes
│
└── Remote_Config             # Data tables, balance configs
    ├── Item database
    ├── Skill configs
    └── Localization tables
```

### Group Settings

| Setting | Local Groups | Remote Groups |
|---------|-------------|---------------|
| Build & Load Paths | Local | Remote (CDN) |
| Bundle Mode | Pack Together | Pack Together or Pack Separately |
| Compression | LZ4 | LZMA (smaller) or LZ4 (faster) |
| Include in Build | ✅ | ❌ (downloaded at runtime) |

---

## Labeling Strategy

Labels enable loading multiple assets by tag:

```
Labels:
  - "preload"        → Assets loaded at startup
  - "level_01"       → Assets for level 1
  - "level_02"       → Assets for level 2
  - "character"      → All character assets
  - "ui"             → All UI assets
  - "audio_bgm"      → Background music
  - "audio_sfx"      → Sound effects
  - "low_quality"     → Low-res variants
  - "high_quality"    → High-res variants
```

```csharp
// Load all assets with a label
var handle = Addressables.LoadAssetsAsync<GameObject>("level_01", null);
```

---

## Addressable Asset Rules

### Mark as Addressable

Right-click asset → `Addressable` checkbox, or drag into Addressables Groups window.

### Address Naming Convention

```
characters/player/warrior          (not: Assets/_Project/Characters/Player/Warrior.prefab)
levels/level_01/environment        (not: Assets/_Project/Levels/Level01/Env.prefab)
ui/panels/inventory                (not: Assets/_Project/UI/Panels/Inventory.prefab)
audio/bgm/main_theme               (not: Assets/_Project/Audio/BGM/MainTheme.mp3)
config/items/sword_01              (not: Assets/_Project/Config/Items/Sword01.asset)
```

**Rule:** Use logical paths, not file system paths. Short, readable, stable.

---

## Build Settings

### Content Build

```
Addressables Groups → Build → New Build → Default Build Script
```

This generates:
- Asset bundles (`.bundle` files)
- Catalog (`catalog.json` + `catalog.hash`)
- Settings (`settings.json`)

### Content Update Build

For patching without full rebuild:

```
Addressables Groups → Tools → Check for Content Update Restrictions
Addressables Groups → Build → Update a Previous Build
```

This generates only the changed bundles + updated catalog.

---

## Common Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Everything in one group | Huge download, can't update parts | Split by lifetime/load pattern |
| Too many small groups | Too many HTTP requests | Merge related assets |
| Not setting addresses | Default addresses are file paths (fragile) | Set logical addresses |
| Forgetting to build | Editor loads from AssetDatabase, not bundles | Always test with built bundles |
| Circular dependencies | Duplicate assets in multiple bundles | Use Analyze tool to detect |
