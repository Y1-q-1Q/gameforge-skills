# Assembly Splitting Strategy

## Core Principle

Split your project into two worlds:
- **AOT (Ahead-of-Time):** Compiled into the app binary. Cannot change without app store update.
- **Hot-Update (Interpreter):** Loaded at runtime. Can be updated anytime via CDN.

**Rule of thumb:** Put as little as possible in AOT. Only what MUST be there.

---

## What Goes Where

### Must Be AOT

| Category | Why |
|----------|-----|
| HybridCLR loader / bootstrap | Needs to exist before hot-update loads |
| MonoBehaviour on scene objects | Scene references require AOT types |
| Native plugin wrappers | P/Invoke requires AOT |
| Abstract interfaces / base classes | Referenced by both AOT and hot-update |
| ScriptableObject definitions used in Resources | Resources.Load needs AOT types |

### Should Be Hot-Update

| Category | Why |
|----------|-----|
| Game logic (combat, AI, progression) | Changes frequently |
| UI panel logic | Frequent iteration |
| Config/data tables | Balance changes |
| Event handlers | Business logic |
| New features | Ship without app review |

### Gray Area (Decide Per Project)

| Category | AOT if... | Hot-Update if... |
|----------|-----------|-----------------|
| Networking | Transport layer | Protocol handlers, message processing |
| Audio | AudioManager base | Playlist logic, trigger conditions |
| Rendering | Shader loading | Material parameter tweaking |
| Input | Input system setup | Input mapping, combo detection |

---

## Splitting Patterns

### Pattern 1: Interface Bridge (Recommended)

AOT defines interfaces. Hot-update implements them.

```csharp
// === AOT Assembly (Core) ===

/// <summary>
/// AOT interface. Hot-update code implements this.
/// </summary>
public interface IGameModule
{
    void OnInit();
    void OnUpdate(float dt);
    void OnDestroy();
}

/// <summary>
/// AOT module manager. Discovers and runs hot-update modules.
/// </summary>
public class ModuleManager : MonoBehaviour
{
    private readonly List<IGameModule> _modules = new();

    public void RegisterModule(IGameModule module)
    {
        module.OnInit();
        _modules.Add(module);
    }

    private void Update()
    {
        float dt = Time.deltaTime;
        foreach (var m in _modules)
            m.OnUpdate(dt);
    }

    private void OnDestroy()
    {
        foreach (var m in _modules)
            m.OnDestroy();
    }
}

// === Hot-Update Assembly (GameLogic) ===

/// <summary>
/// Hot-update implementation. Can be patched anytime.
/// </summary>
public class CombatModule : IGameModule
{
    public void OnInit() { /* setup combat system */ }
    public void OnUpdate(float dt) { /* process combat logic */ }
    public void OnDestroy() { /* cleanup */ }
}
```

### Pattern 2: Entry Point Reflection

AOT calls a known entry point in hot-update assembly via reflection.

```csharp
// === AOT (Launcher) ===
public class HotUpdateEntry : MonoBehaviour
{
    private void Start()
    {
        // Load hot-update assembly
        var assembly = LoadHotUpdateAssembly("GameLogic.dll");

        // Call entry point via reflection
        var entryType = assembly.GetType("GameForge.GameLogic.GameEntry");
        var entryMethod = entryType.GetMethod("Start", BindingFlags.Public | BindingFlags.Static);
        entryMethod.Invoke(null, null);
    }
}

// === Hot-Update (GameLogic) ===
namespace GameForge.GameLogic
{
    public static class GameEntry
    {
        public static void Start()
        {
            // Full control from here — all hot-updatable
            var go = new GameObject("GameManager");
            go.AddComponent<GameManager>(); // GameManager is hot-update
        }
    }
}
```

### Pattern 3: ScriptableObject Config (Data-Driven)

AOT defines SO base. Hot-update creates instances with different data.

```csharp
// === AOT ===
public abstract class SkillConfigBase : ScriptableObject
{
    public abstract void Execute(GameObject caster, GameObject target);
}

// === Hot-Update ===
// New skills can be added without app update
public class FireballConfig : SkillConfigBase
{
    public float damage = 50f;
    public float radius = 3f;

    public override void Execute(GameObject caster, GameObject target)
    {
        // Fireball logic — fully hot-updatable
    }
}
```

---

## Assembly Dependency Graph

```
                    ┌──────────────┐
                    │   Launch     │  (AOT, minimal)
                    │  - Loader    │
                    │  - Splash    │
                    └──────┬───────┘
                           │ loads
                    ┌──────▼───────┐
                    │    Core      │  (AOT, interfaces + utilities)
                    │  - IModule   │
                    │  - EventBus  │
                    │  - Services  │
                    └──────┬───────┘
                           │ referenced by
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
   │  GameLogic  │  │     UI     │  │   Config    │
   │ (Hot-Update)│  │(Hot-Update)│  │(Hot-Update) │
   │  - Combat   │  │  - Panels  │  │  - Tables   │
   │  - AI       │  │  - HUD     │  │  - Balance  │
   │  - Player   │  │  - Dialogs │  │  - i18n     │
   └─────────────┘  └────────────┘  └─────────────┘
```

**Rules:**
1. Hot-update assemblies can reference AOT assemblies ✅
2. AOT assemblies CANNOT reference hot-update assemblies ❌
3. Hot-update assemblies can reference each other (with care) ⚠️
4. Load order must respect dependencies

---

## Load Order

```csharp
// Correct load order: dependencies first
private static readonly string[] HotUpdateDlls = new[]
{
    "Config.dll",      // No dependencies (besides Core)
    "GameLogic.dll",   // May depend on Config
    "UI.dll",          // May depend on GameLogic + Config
};
```

---

## Size Optimization

| Technique | Savings | Complexity |
|-----------|---------|------------|
| Split into more assemblies | Only download changed ones | Low |
| Binary diff (bsdiff) | 60-80% smaller patches | Medium |
| Compress DLLs (LZ4/LZMA) | 40-60% smaller | Low |
| Strip unused code | Varies | Low (use link.xml carefully) |
| Lazy loading | Load modules on demand | Medium |
