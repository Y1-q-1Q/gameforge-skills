# Common Unity Architecture Decisions

Pre-built ADR templates for decisions every Unity project faces.

## Asset Management

### ADR: Addressables vs AssetBundles vs Resources

| Factor | Addressables | AssetBundles | Resources |
|--------|-------------|--------------|-----------|
| Setup complexity | Medium | High | None |
| Remote loading | ✅ Built-in | ✅ Manual | ❌ |
| Granularity | Per-asset | Per-bundle | Per-asset |
| Memory control | ✅ Reference counting | Manual | ❌ (manual unload) |
| Team size fit | Any | Large teams | Prototypes only |

**Default recommendation**: Addressables for any project beyond prototype.

## Networking

### ADR: Netcode for GameObjects vs Mirror vs Custom

| Factor | Netcode (Unity) | Mirror | Custom |
|--------|----------------|--------|--------|
| Official support | ✅ | Community | You |
| Maturity | Growing | Mature | Depends |
| Transport options | Unity Transport | KCP/Telepathy/Steam | Any |
| ECS support | Netcode for Entities | ❌ | Custom |
| Learning curve | Medium | Low | High |

**Default recommendation**:
- Casual multiplayer → Mirror (faster to ship)
- Competitive/esports → Custom or Netcode for Entities
- Unity ecosystem all-in → Netcode for GameObjects

## UI Framework

### ADR: UGUI vs UI Toolkit

| Factor | UGUI | UI Toolkit |
|--------|------|------------|
| Maturity | Very mature | Growing (runtime support improving) |
| Runtime performance | Good with optimization | Better layout performance |
| Workflow | Visual in Scene | USS/UXML (web-like) |
| Animation | DOTween/Animator | USS transitions |
| Custom rendering | Easy (Canvas) | Limited |

**Default recommendation**:
- Game UI (HUD, inventory) → UGUI (more flexible, better tooling)
- Editor tools → UI Toolkit (designed for it)
- Data-heavy UI (lists, tables) → UI Toolkit (virtualization built-in)

## State Management

### ADR: Event Architecture

| Pattern | Coupling | Debuggability | Performance |
|---------|----------|---------------|-------------|
| Direct reference | Tight | Easy | Best |
| C# events/delegates | Medium | Medium | Good |
| UnityEvent | Medium | Inspector-visible | OK |
| ScriptableObject events | Loose | Inspector-visible | OK |
| Message bus (custom) | Loose | Hard without tooling | Varies |

**Default recommendation**: ScriptableObject events for cross-system communication, C# events within a system.

## Dependency Injection

### ADR: DI Framework Choice

| Factor | Zenject | VContainer | Manual |
|--------|---------|------------|--------|
| Performance | Reflection-heavy | Source-gen, fast | Best |
| Learning curve | Steep | Medium | None |
| Community | Large | Growing | N/A |
| ECS support | Limited | Better | Full control |

**Default recommendation**:
- Small team / solo → Manual DI (ServiceLocator or constructor injection)
- Medium team → VContainer (performance + simplicity)
- Large team with DI experience → Zenject
