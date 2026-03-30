# Unity Folder Structure Strategies

## Core Principle: Feature-First, Not Type-First

❌ **Bad (type-first):**
```
Assets/
├── Scripts/
│   ├── Player.cs
│   ├── Enemy.cs
│   ├── Inventory.cs
│   └── UIManager.cs
├── Prefabs/
├── Materials/
└── Textures/
```

✅ **Good (feature-first):**
```
Assets/
├── _Project/
│   ├── Core/           # Shared systems
│   ├── Player/         # Everything about the player
│   ├── Combat/         # Combat system
│   ├── Inventory/      # Inventory system
│   └── UI/             # UI system
├── _ThirdParty/        # External packages
└── Resources/          # Only what MUST be in Resources
```

**Why feature-first?**
- Related files are together (script + prefab + material)
- Easy to assign ownership in teams
- Assembly definitions map naturally to features
- Deleting a feature = deleting a folder

---

## Recommended Structures by Project Scale

### Solo / Prototype

```
Assets/
├── _Project/
│   ├── Core/
│   │   ├── Bootstrap.cs
│   │   ├── GameManager.cs
│   │   ├── SceneLoader.cs
│   │   └── EventBus.cs
│   ├── Player/
│   │   ├── PlayerController.cs
│   │   ├── PlayerAnimator.cs
│   │   ├── Player.prefab
│   │   └── PlayerMaterials/
│   ├── Enemies/
│   │   ├── EnemyBase.cs
│   │   ├── Slime/
│   │   └── Boss/
│   ├── UI/
│   │   ├── HUD/
│   │   ├── Menus/
│   │   └── Common/
│   ├── Audio/
│   │   ├── AudioManager.cs
│   │   ├── SFX/
│   │   └── Music/
│   ├── Levels/
│   │   ├── Level01/
│   │   └── Level02/
│   └── Art/
│       ├── Sprites/
│       ├── Animations/
│       └── Shaders/
├── _ThirdParty/
│   ├── DOTween/
│   └── TextMeshPro/
├── Resources/              # Minimal! Only for runtime loading
│   └── Settings/
├── StreamingAssets/         # Platform-specific data
└── Scenes/
    ├── Bootstrap.unity
    ├── MainMenu.unity
    └── Gameplay.unity
```

### Team Project (Medium)

```
Assets/
├── _Project/
│   ├── Core/
│   │   ├── Runtime/
│   │   │   ├── Bootstrap/
│   │   │   ├── Events/
│   │   │   ├── Services/
│   │   │   ├── SceneManagement/
│   │   │   └── Utilities/
│   │   ├── Editor/
│   │   │   └── Tools/
│   │   └── Core.asmdef
│   │
│   ├── Gameplay/
│   │   ├── Runtime/
│   │   │   ├── Player/
│   │   │   ├── Combat/
│   │   │   ├── AI/
│   │   │   ├── Items/
│   │   │   └── Progression/
│   │   ├── Editor/
│   │   └── Gameplay.asmdef
│   │
│   ├── UI/
│   │   ├── Runtime/
│   │   │   ├── HUD/
│   │   │   ├── Menus/
│   │   │   ├── Dialogs/
│   │   │   └── Common/
│   │   ├── Editor/
│   │   └── UI.asmdef
│   │
│   ├── Networking/
│   │   ├── Runtime/
│   │   │   ├── Transport/
│   │   │   ├── Sync/
│   │   │   └── Lobby/
│   │   └── Networking.asmdef
│   │
│   ├── Audio/
│   │   ├── Runtime/
│   │   ├── Mixers/
│   │   └── Audio.asmdef
│   │
│   └── Art/
│       ├── Characters/
│       ├── Environment/
│       ├── VFX/
│       ├── Shaders/
│       └── Animations/
│
├── _ThirdParty/
│   ├── DOTween/
│   ├── UniTask/
│   └── VContainer/
│
├── AddressableAssetsData/   # Addressables config
├── Resources/               # Minimal
├── Scenes/
│   ├── Bootstrap.unity
│   ├── MainMenu.unity
│   ├── Loading.unity
│   └── Gameplay/
│       ├── Level_01.unity
│       └── Level_02.unity
│
└── Tests/
    ├── EditMode/
    └── PlayMode/
```

### Large Project (AAA / Live Service)

```
Assets/
├── _Project/
│   ├── Core/                    # Foundation layer
│   │   ├── Runtime/
│   │   │   ├── Bootstrap/
│   │   │   ├── DI/              # Dependency injection setup
│   │   │   ├── Events/
│   │   │   ├── Services/
│   │   │   ├── Persistence/     # Save/Load
│   │   │   ├── Config/          # ScriptableObject configs
│   │   │   ├── Logging/
│   │   │   └── Utilities/
│   │   ├── Editor/
│   │   ├── Tests/
│   │   └── Core.asmdef
│   │
│   ├── Modules/                 # Feature modules (each is independent)
│   │   ├── Player/
│   │   │   ├── Runtime/
│   │   │   ├── Editor/
│   │   │   ├── Tests/
│   │   │   └── Player.asmdef
│   │   ├── Combat/
│   │   ├── Inventory/
│   │   ├── Quest/
│   │   ├── Dialog/
│   │   ├── Crafting/
│   │   ├── Shop/
│   │   └── Social/
│   │
│   ├── Infrastructure/          # Technical systems
│   │   ├── Networking/
│   │   ├── HotReload/          # HybridCLR
│   │   ├── AssetManagement/    # Addressables wrapper
│   │   ├── Analytics/
│   │   ├── Ads/
│   │   └── IAP/
│   │
│   ├── Presentation/            # UI and visual
│   │   ├── UI/
│   │   ├── Camera/
│   │   ├── VFX/
│   │   └── Audio/
│   │
│   └── Content/                 # Game content (data-driven)
│       ├── Characters/
│       ├── Levels/
│       ├── Items/
│       ├── Configs/             # ScriptableObject data
│       └── Localization/
│
├── _ThirdParty/
├── HybridCLRData/              # Hot-reload assemblies
├── AddressableAssetsData/
└── Scenes/
```

---

## Assembly Definition Rules

| Assembly | References | Purpose |
|----------|-----------|---------|
| `Core` | None (or Unity only) | Foundation, no game logic |
| `Gameplay` | Core | Game mechanics |
| `UI` | Core | UI only, no gameplay logic |
| `Networking` | Core | Network layer |
| `Audio` | Core | Audio system |
| `Tests.EditMode` | All (test only) | Edit mode tests |
| `Tests.PlayMode` | All (test only) | Play mode tests |

**Rule: No circular references. Dependencies flow downward only.**

```
UI → Gameplay → Core
         ↑
    Networking → Core
         ↑
      Audio → Core
```

---

## Special Folders

| Folder | Purpose | Notes |
|--------|---------|-------|
| `Resources/` | Runtime loading via `Resources.Load` | Keep minimal! Increases build size |
| `StreamingAssets/` | Raw files copied to build | Config files, local databases |
| `Plugins/` | Native plugins (.dll, .so, .a) | Platform-specific subfolders |
| `Editor/` | Editor-only code | Not included in builds |
| `Editor Default Resources/` | Editor assets | Rarely needed |

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Folders | PascalCase | `PlayerController/` |
| C# files | PascalCase, match class name | `PlayerController.cs` |
| Prefabs | PascalCase with prefix | `Pfb_Player.prefab` or `Player.prefab` |
| Materials | PascalCase with prefix | `Mat_PlayerSkin.mat` |
| Textures | PascalCase with suffix | `PlayerSkin_Albedo.png` |
| Animations | PascalCase with prefix | `Anim_PlayerRun.anim` |
| ScriptableObjects | PascalCase with prefix | `SO_PlayerConfig.asset` |
| Scenes | PascalCase | `MainMenu.unity` |
| Assembly Defs | Company.Project.Module | `GameForge.MyGame.Core.asmdef` |
