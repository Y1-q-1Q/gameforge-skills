# Assembly Definition Best Practices

## Why Assembly Definitions Matter

Without assembly definitions, Unity recompiles ALL scripts when ANY script changes. On a large project, this can take 10-30+ seconds per change.

With proper assembly definitions:
- Only the changed assembly and its dependents recompile
- Typical recompile: 1-3 seconds
- Enforces architectural boundaries (no circular dependencies)

---

## Recommended Assembly Layout

```
Project.Core.asmdef              # Foundation — no game logic
  ↑
Project.Gameplay.asmdef          # Game mechanics
  ↑
Project.UI.asmdef                # UI layer
  ↑
Project.Networking.asmdef        # Network layer
  ↑
Project.Audio.asmdef             # Audio system
  ↑
Project.Infrastructure.asmdef    # Analytics, ads, IAP
  ↑
Project.Tests.EditMode.asmdef    # Edit mode tests (references all)
Project.Tests.PlayMode.asmdef    # Play mode tests (references all)
```

## Dependency Rules

1. **Core references nothing** (except Unity assemblies)
2. **Feature assemblies reference Core only** (not each other)
3. **If two features need to communicate, use events defined in Core**
4. **Test assemblies can reference anything**
5. **Editor assemblies are separate** (`Editor/` subfolder with own .asmdef)

## Example .asmdef file

```json
{
    "name": "GameForge.MyGame.Core",
    "rootNamespace": "GameForge.MyGame.Core",
    "references": [],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false,
    "overrideReferences": false,
    "precompiledReferences": [],
    "autoReferenced": true,
    "defineConstraints": [],
    "versionDefines": [],
    "noEngineReferences": false
}
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Circular references (A→B→A) | Extract shared types to Core |
| Too many assemblies | Start with 3-5, split when needed |
| Too few assemblies | At minimum: Core + Gameplay + UI |
| Forgetting Editor assemblies | Always separate Editor code |
| Not setting rootNamespace | Set it to match folder path |

## Performance Impact

| Project Size | Without asmdef | With asmdef |
|-------------|---------------|-------------|
| Small (< 100 scripts) | ~3s | ~1s |
| Medium (100-500) | ~8s | ~2s |
| Large (500-2000) | ~20s | ~3s |
| Very Large (2000+) | ~45s+ | ~5s |
