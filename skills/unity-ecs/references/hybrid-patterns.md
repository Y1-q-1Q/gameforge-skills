# Hybrid Patterns: ECS + MonoBehaviour

## When to Go Hybrid

Most real games aren't 100% ECS. The sweet spot:

| Layer | Technology | Examples |
|-------|-----------|----------|
| Simulation | ECS + Jobs + Burst | AI, physics, bullets, spawning |
| Presentation | MonoBehaviour | Camera, UI, audio, VFX |
| Input | MonoBehaviour | Player input, touch handling |
| Networking | Either | ECS for state, MonoBehaviour for transport |

## Pattern 1: MonoBehaviour Reads ECS Data

```csharp
// ECS handles 10K enemies. MonoBehaviour handles the health bar UI for the selected one.
public class SelectedEnemyUI : MonoBehaviour
{
    [SerializeField] Slider healthBar;
    Entity _selectedEntity;
    EntityManager _em;

    void Start() => _em = World.DefaultGameObjectInjectionWorld.EntityManager;

    public void Select(Entity entity) => _selectedEntity = entity;

    void LateUpdate()
    {
        if (_selectedEntity == Entity.Null || !_em.Exists(_selectedEntity)) return;
        var health = _em.GetComponentData<Health>(_selectedEntity);
        healthBar.value = (float)health.Current / health.Max;
    }
}
```

## Pattern 2: MonoBehaviour Writes to ECS

```csharp
// Player input (MonoBehaviour) → ECS movement system
public class PlayerInputBridge : MonoBehaviour
{
    Entity _playerEntity;
    EntityManager _em;

    void Start()
    {
        _em = World.DefaultGameObjectInjectionWorld.EntityManager;
        // Find player entity by tag component
        var query = _em.CreateEntityQuery(typeof(PlayerTag));
        if (query.CalculateEntityCount() > 0)
            _playerEntity = query.GetSingletonEntity();
    }

    void Update()
    {
        if (_playerEntity == Entity.Null) return;
        var input = new PlayerInput
        {
            Move = new float2(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical")),
            Fire = Input.GetButton("Fire1"),
        };
        _em.SetComponentData(_playerEntity, input);
    }
}
```

## Pattern 3: ECS Triggers MonoBehaviour Events

```csharp
// ECS detects death → MonoBehaviour plays VFX + sound
public struct DeathEvent : IComponentData
{
    public float3 Position;
    public int EntityType;
}

// System creates event entities
[BurstCompile]
public partial struct CreateDeathEventSystem : ISystem
{
    public void OnUpdate(ref SystemState state)
    {
        var ecb = new EntityCommandBuffer(Allocator.Temp);
        foreach (var (health, transform, entity) in
            SystemAPI.Query<RefRO<Health>, RefRO<LocalTransform>>().WithEntityAccess())
        {
            if (health.ValueRO.Current <= 0)
            {
                var evt = ecb.CreateEntity();
                ecb.AddComponent(evt, new DeathEvent
                {
                    Position = transform.ValueRO.Position,
                    EntityType = 1,
                });
                ecb.DestroyEntity(entity);
            }
        }
        ecb.Playback(state.EntityManager);
        ecb.Dispose();
    }
}

// MonoBehaviour consumes events
public class DeathVFXHandler : MonoBehaviour
{
    [SerializeField] GameObject deathVFXPrefab;
    EntityQuery _eventQuery;

    void Start()
    {
        var em = World.DefaultGameObjectInjectionWorld.EntityManager;
        _eventQuery = em.CreateEntityQuery(typeof(DeathEvent));
    }

    void LateUpdate()
    {
        var em = World.DefaultGameObjectInjectionWorld.EntityManager;
        var events = _eventQuery.ToComponentDataArray<DeathEvent>(Allocator.Temp);
        var entities = _eventQuery.ToEntityArray(Allocator.Temp);

        for (int i = 0; i < events.Length; i++)
        {
            Instantiate(deathVFXPrefab, events[i].Position, Quaternion.identity);
            em.DestroyEntity(entities[i]); // Consume event
        }

        events.Dispose();
        entities.Dispose();
    }
}
```

## Managed Components (Escape Hatch)

When you need class references in ECS (textures, GameObjects, etc.):

```csharp
// Managed component — NOT Burst-compatible, but bridges to managed world
public class ManagedVisual : IComponentData
{
    public GameObject Prefab;
    public Material Material;
}

// Can only be accessed from main thread, not in parallel jobs
// Use sparingly — defeats ECS performance benefits
```

## Migration Strategy: MonoBehaviour → ECS

```
Phase 1: Keep everything MonoBehaviour. Identify hot paths.
Phase 2: Move hot-path data to ECS components. Systems process them.
Phase 3: MonoBehaviours become thin bridges (input, UI, audio).
Phase 4: (Optional) Full ECS for simulation, MonoBehaviour only for presentation.
```

Don't rewrite everything at once. Migrate the bottleneck first.
