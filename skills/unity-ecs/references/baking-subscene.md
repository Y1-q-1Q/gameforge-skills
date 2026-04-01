# Baking & SubScene Guide

## What is Baking?

Baking converts GameObject authoring data into ECS entity data at build time (not runtime).

```
Authoring World (GameObjects) → Baker → Entity World (Entities + Components)
```

**Why it matters**: Zero runtime conversion cost. Data is pre-processed and loaded as binary blobs.

## SubScene Workflow

```
1. Create empty GameObject → Add SubScene component
2. Open SubScene → Author with GameObjects as usual
3. Close SubScene → Unity bakes to entity binary
4. Runtime: SubScene streams in as entities (fast, async)
```

### SubScene Best Practices

| Practice | Why |
|----------|-----|
| One SubScene per area/chunk | Stream in/out independently |
| Keep SubScenes < 10K entities | Baking time stays reasonable |
| Static environment in SubScene | Dynamic spawns via EntityManager |
| Don't nest SubScenes | Causes dependency issues |

## Baker Pattern

```csharp
// Authoring component (MonoBehaviour, editor-only)
public class EnemyAuthoring : MonoBehaviour
{
    public float moveSpeed = 5f;
    public int maxHealth = 100;
    public GameObject projectilePrefab;
}

// Baker (converts authoring → ECS)
public class EnemyBaker : Baker<EnemyAuthoring>
{
    public override void Bake(EnemyAuthoring authoring)
    {
        var entity = GetEntity(TransformUsageFlags.Dynamic);

        AddComponent(entity, new MoveSpeed { Value = authoring.moveSpeed });
        AddComponent(entity, new Health { Current = authoring.maxHealth, Max = authoring.maxHealth });

        // Convert prefab reference to entity prefab
        var prefabEntity = GetEntity(authoring.projectilePrefab, TransformUsageFlags.Dynamic);
        AddComponent(entity, new ProjectilePrefab { Value = prefabEntity });
    }
}
```

### TransformUsageFlags

| Flag | When to Use |
|------|-------------|
| `Dynamic` | Entity moves at runtime |
| `Renderable` | Entity is rendered but doesn't move |
| `WorldSpace` | Needs world-space transform |
| `None` | No transform needed (pure data entity) |

## Prefab Baking

```csharp
// Bake a prefab for runtime instantiation
AddComponent(entity, new ProjectilePrefab
{
    Value = GetEntity(authoring.projectilePrefab, TransformUsageFlags.Dynamic)
});

// Runtime: instantiate from prefab entity
var instance = EntityManager.Instantiate(prefab.Value);
EntityManager.SetComponentData(instance, new LocalTransform
{
    Position = spawnPos,
    Rotation = quaternion.identity,
    Scale = 1f,
});
```

## Baking Dependencies

```csharp
public override void Bake(WaypointAuthoring authoring)
{
    // Declare dependency: re-bake if referenced object changes
    DependsOn(authoring.targetTransform);

    var entity = GetEntity(TransformUsageFlags.Dynamic);
    AddComponent(entity, new WaypointTarget
    {
        Position = authoring.targetTransform.position
    });
}
```

## Common Baking Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Missing `GetEntity()` | Entity has no transform | Always call GetEntity with correct flags |
| Runtime data in Baker | Stale data after build | Bakers only run at bake time |
| Forgetting DependsOn | Changes not reflected | Declare all external dependencies |
| Complex logic in Baker | Slow iteration | Keep bakers simple, move logic to systems |
