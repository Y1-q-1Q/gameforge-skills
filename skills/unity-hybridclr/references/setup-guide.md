# HybridCLR Setup Guide

## What is HybridCLR?

HybridCLR (formerly Huatuo) is a **full-featured IL interpreter** that extends IL2CPP. It allows Unity games to load and execute new C# code at runtime without rebuilding the app — true hot-update for all C# features including generics, LINQ, async/await.

**Key difference from Lua/ILRuntime:** HybridCLR runs standard C# assemblies. No special language, no bridge code, no performance wrapper. Write normal C# → build DLL → load at runtime.

---

## Installation

### Step 1: Install HybridCLR Package

```
// Unity Package Manager → Add package from git URL:
https://gitee.com/focus-creative-games/hybridclr_unity.git
// or (GitHub mirror):
https://github.com/focus-creative-games/hybridclr_unity.git
```

Or add to `Packages/manifest.json`:
```json
{
  "dependencies": {
    "com.code-philosophy.hybridclr": "https://gitee.com/focus-creative-games/hybridclr_unity.git"
  }
}
```

### Step 2: Initialize HybridCLR

Menu: `HybridCLR → Installer → Install`

This patches the local IL2CPP installation with HybridCLR's interpreter. You'll see:
```
[HybridCLR] Initialize completed. libil2cpp has been patched.
```

### Step 3: Configure Player Settings

```
Edit → Project Settings → Player:
  - Scripting Backend: IL2CPP (required)
  - Api Compatibility Level: .NET Standard 2.1 or .NET Framework
  - IL2CPP Code Generation: default (not "Faster (smaller) builds")
```

### Step 4: Configure HybridCLR Settings

Menu: `HybridCLR → Settings`

```
HybridCLR Settings:
  - Enable: ✅
  - Hot Update Assembly Definitions: [list your hot-update assemblies]
  - Preserve Hot Update Assemblies: ✅ (prevents stripping)
```

---

## Project Structure (Recommended)

```
Assets/
├── _AOT/                          # AOT assemblies (built into app)
│   ├── Core/                      # Framework, services, interfaces
│   │   ├── Core.asmdef            # → AOT
│   │   ├── IGameService.cs
│   │   ├── EventBus.cs
│   │   └── ServiceLocator.cs
│   └── ThirdParty/                # Plugins that can't be hot-updated
│
├── _HotUpdate/                    # Hot-update assemblies (loaded at runtime)
│   ├── GameLogic/                 # Main game logic
│   │   ├── GameLogic.asmdef       # → Hot Update
│   │   ├── GameManager.cs
│   │   ├── Player/
│   │   ├── Combat/
│   │   └── AI/
│   ├── UI/                        # UI code
│   │   ├── UI.asmdef              # → Hot Update
│   │   └── Panels/
│   └── Config/                    # Game configs
│       ├── Config.asmdef          # → Hot Update
│       └── Tables/
│
├── _Launch/                       # Bootstrap (AOT, minimal)
│   ├── Launch.asmdef              # → AOT
│   ├── AppLauncher.cs             # Entry point
│   └── HotUpdateLoader.cs        # Loads hot-update DLLs
│
└── StreamingAssets/               # Built hot-update DLLs go here (dev only)
```

---

## Assembly Definition Configuration

### AOT Assembly (Core.asmdef)
```json
{
    "name": "Core",
    "rootNamespace": "GameForge.Core",
    "references": [],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false,
    "autoReferenced": true
}
```

### Hot-Update Assembly (GameLogic.asmdef)
```json
{
    "name": "GameLogic",
    "rootNamespace": "GameForge.GameLogic",
    "references": ["Core"],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false,
    "autoReferenced": false
}
```

**Critical:** Hot-update assemblies must have `autoReferenced: false`. They are loaded at runtime, not compiled into the AOT build.

---

## HybridCLR Settings Configuration

In `HybridCLR → Settings`, add your hot-update assemblies:

```
Hot Update Assembly Definitions:
  - GameLogic
  - UI
  - Config

Hot Update Assemblies (by name, if not using asmdef):
  - GameLogic.dll
  - UI.dll
  - Config.dll
```

---

## Supplementary Metadata (关键步骤)

IL2CPP strips unused generic method instantiations. HybridCLR needs metadata for generics used in hot-update code but instantiated in AOT code.

### Generate Supplementary Metadata

Menu: `HybridCLR → Generate → All`

This runs:
1. `CompileDll` — Compile hot-update assemblies
2. `Il2CppDef` — Generate IL2CPP definitions
3. `LinkXml` — Generate link.xml to prevent stripping
4. `MethodBridge` — Generate bridge methods
5. `AOTGenericReference` — Generate generic instantiation references
6. `SupplementaryMetadataAssembly` — Generate supplementary metadata DLLs

### Load Supplementary Metadata at Runtime

```csharp
/// <summary>
/// Load supplementary metadata before loading any hot-update assembly.
/// This patches AOT generic methods so hot-update code can use them.
/// </summary>
private static void LoadMetadataForAOTAssemblies()
{
    // These are the AOT assemblies that need metadata supplementation
    string[] aotMetaDlls = new string[]
    {
        "mscorlib.dll",
        "System.dll",
        "System.Core.dll",
        // Add more based on your project's generic usage
    };

    foreach (var dllName in aotMetaDlls)
    {
        byte[] dllBytes = LoadDllBytes($"AotMetadata/{dllName}");
        if (dllBytes == null)
        {
            Debug.LogWarning($"[HybridCLR] AOT metadata not found: {dllName}");
            continue;
        }

        var err = RuntimeApi.LoadMetadataForAOTAssembly(dllBytes, HomologousImageMode.SuperSet);
        Debug.Log($"[HybridCLR] LoadMetadata {dllName}: {err}");
    }
}
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `MissingMethodException` on generic method | AOT stripping | Add to supplementary metadata list |
| `TypeLoadException` | Assembly load order wrong | Load dependencies before dependents |
| `ExecutionEngineException` | Bridge method missing | Regenerate: `HybridCLR → Generate → MethodBridge` |
| Hot-update code not executing | `autoReferenced: true` on hot-update asmdef | Set to `false` |
| iOS build fails | Mono backend selected | Switch to IL2CPP |
| Stripping breaks functionality | Aggressive stripping | Add `link.xml` entries or use `[Preserve]` |

---

## Verification Checklist

After setup, verify:

- [ ] `HybridCLR → Installer` shows "Installed"
- [ ] Player Settings → Scripting Backend = IL2CPP
- [ ] Hot-update asmdefs have `autoReferenced: false`
- [ ] `HybridCLR → Settings` lists all hot-update assemblies
- [ ] `HybridCLR → Generate → All` completes without errors
- [ ] Hot-update DLLs appear in output directory
- [ ] Supplementary metadata DLLs are generated
- [ ] Runtime loading works in Editor (Play Mode)
- [ ] Runtime loading works in build (Android/iOS)
