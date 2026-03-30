# ECS/DOTS Quick Start

## When to Use ECS

| Scenario | MonoBehaviour | ECS |
|----------|--------------|-----|
| < 1000 entities | ✅ Simpler | Overkill |
| 1000-10000 entities | ⚠️ Getting slow | ✅ Worth it |
| > 10000 entities | ❌ Too slow | ✅ Required |
| Data-heavy simulation | ❌ | ✅ |
| Simple game logic | ✅ | Overkill |

## Core Concepts

```
Entity    = ID (just a number, no data)
Component = Data (struct, no logic)
System    = Logic (processes components)

Entity 1: [Position, Velocity, Health]
Entity 2: [Position, Velocity, Enemy]
Entity 3: [Position, Sprite]

MovementSystem: queries all (Position, Velocity) → updates Position
HealthSystem: queries all (Health) → checks death
RenderSystem: queries all (Position, Sprite) → draws
```

## Minimal Example

```csharp
// Component — pure data
public struct MoveSpeed : IComponentData
{
    public float Value;
}

public struct TargetPosition : IComponentData
{
    public float3 Value;
}

// System — pure logic
[BurstCompile]
public partial struct MoveToTargetSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        float dt = SystemAPI.Time.DeltaTime;

        foreach (var (transform, speed, target) in
            SystemAPI.Query<RefRW<LocalTransform>, RefRO<MoveSpeed>, RefRO<TargetPosition>>())
        {
            float3 direction = math.normalize(target.ValueRO.Value - transform.ValueRO.Position);
            transform.ValueRW.Position += direction * speed.ValueRO.Value * dt;
        }
    }
}

// Spawner (MonoBehaviour bridge)
public class EnemySpawner : MonoBehaviour
{
    [SerializeField] private GameObject prefab;

    public void SpawnEnemies(int count)
    {
        var entityManager = World.DefaultGameObjectInjectionWorld.EntityManager;
        var settings = GameObjectConversionSettings.FromWorld(World.DefaultGameObjectInjectionWorld, null);

        for (int i = 0; i < count; i++)
        {
            var entity = entityManager.Instantiate(/* converted prefab entity */);
            entityManager.SetComponentData(entity, new MoveSpeed { Value = UnityEngine.Random.Range(1f, 5f) });
            entityManager.SetComponentData(entity, new TargetPosition { Value = new float3(0, 0, 0) });
        }
    }
}
```

## Jobs + Burst (Performance Multiplier)

```csharp
// IJobEntity — processes entities in parallel with Burst compilation
[BurstCompile]
public partial struct DamageOverTimeJob : IJobEntity
{
    public float DeltaTime;

    void Execute(ref Health health, in PoisonEffect poison)
    {
        health.Current -= poison.DamagePerSecond * DeltaTime;
    }
}

// Schedule from system
[BurstCompile]
public partial struct DamageOverTimeSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        new DamageOverTimeJob { DeltaTime = SystemAPI.Time.DeltaTime }.ScheduleParallel();
    }
}
```

## Performance Comparison

| Operation (10K entities) | MonoBehaviour | ECS | ECS + Burst + Jobs |
|--------------------------|--------------|-----|-------------------|
| Move to target | ~8ms | ~1.5ms | ~0.2ms |
| Distance check | ~12ms | ~2ms | ~0.3ms |
| Spawn | ~45ms | ~3ms | ~3ms |
