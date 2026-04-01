# C# Job System + Burst Compiler Guide

## When to Use Jobs+Burst

Use for CPU-heavy parallel workloads:
- Pathfinding (A*, flow fields)
- Spatial queries (nearest neighbor, range checks)
- Procedural generation (terrain, mesh, noise)
- Physics simulation (custom, not Unity's built-in)
- AI decision making (utility scoring, flocking)
- Particle/VFX computation
- Animation blending (custom IK, procedural)

**Rule of thumb**: If it runs on >1000 entities per frame, consider Jobs+Burst.

## Basic Job Pattern

```csharp
using Unity.Burst;
using Unity.Collections;
using Unity.Jobs;
using Unity.Mathematics;

[BurstCompile]
struct DamageCalculationJob : IJobParallelFor
{
    [ReadOnly] public NativeArray<float> AttackPower;
    [ReadOnly] public NativeArray<float> Defense;
    public NativeArray<float> FinalDamage;

    public void Execute(int index)
    {
        float raw = AttackPower[index] - Defense[index] * 0.5f;
        FinalDamage[index] = math.max(raw, 1f);
    }
}

// Schedule from MonoBehaviour
void CalculateDamage(NativeArray<float> atk, NativeArray<float> def, NativeArray<float> result)
{
    var job = new DamageCalculationJob
    {
        AttackPower = atk,
        Defense = def,
        FinalDamage = result,
    };
    JobHandle handle = job.Schedule(atk.Length, 64); // batch size 64
    handle.Complete(); // or store handle for later completion
}
```

## Spatial Query with Jobs (Game-Critical Pattern)

```csharp
[BurstCompile]
struct FindNearestEnemyJob : IJobParallelFor
{
    [ReadOnly] public NativeArray<float3> EnemyPositions;
    [ReadOnly] public NativeArray<float3> QueryPositions;
    public NativeArray<int> NearestIndex;
    public NativeArray<float> NearestDistSq;

    public void Execute(int qi)
    {
        float3 pos = QueryPositions[qi];
        float bestDist = float.MaxValue;
        int bestIdx = -1;

        for (int i = 0; i < EnemyPositions.Length; i++)
        {
            float d = math.distancesq(pos, EnemyPositions[i]);
            if (d < bestDist)
            {
                bestDist = d;
                bestIdx = i;
            }
        }
        NearestIndex[qi] = bestIdx;
        NearestDistSq[qi] = bestDist;
    }
}
```

## Job Chaining (Dependency Graph)

```csharp
// Step 1: Calculate positions
var moveJob = new MoveJob { ... };
JobHandle moveHandle = moveJob.Schedule(count, 64);

// Step 2: After move, check collisions (depends on move)
var collisionJob = new CollisionJob { ... };
JobHandle collisionHandle = collisionJob.Schedule(count, 64, moveHandle);

// Step 3: After collision, apply damage (depends on collision)
var damageJob = new DamageJob { ... };
JobHandle damageHandle = damageJob.Schedule(count, 64, collisionHandle);

// Complete at end of frame
damageHandle.Complete();
```

## Burst Compiler Constraints

| Allowed | Not Allowed |
|---------|-------------|
| `NativeArray<T>` | Managed arrays (`T[]`) |
| `Unity.Mathematics` (float3, math) | `System.Math`, `Vector3` |
| `struct` types | `class` types |
| Fixed-size buffers | `string`, `List<T>` |
| `SharedStatic<T>` | Static fields |
| Function pointers | Virtual methods, interfaces |

## NativeContainer Cheat Sheet

| Container | Use Case | Thread Safety |
|-----------|----------|---------------|
| `NativeArray<T>` | Fixed-size buffer | ParallelFor with `[ReadOnly]` |
| `NativeList<T>` | Dynamic-size buffer | Single writer only |
| `NativeHashMap<K,V>` | Key-value lookup | `ParallelWriter` for concurrent add |
| `NativeQueue<T>` | FIFO processing | `ParallelWriter` for enqueue |
| `NativeMultiHashMap<K,V>` | One key → many values | Spatial bucketing |

## Allocator Lifetime

| Allocator | Lifetime | Use Case |
|-----------|----------|----------|
| `Temp` | 1 frame | Within a single method |
| `TempJob` | 4 frames | Job input/output |
| `Persistent` | Manual dispose | Long-lived data |

**Always dispose NativeContainers** — memory leaks crash the editor.

## Performance Comparison

Typical speedups with Burst vs managed C#:

| Operation | Managed | Burst | Speedup |
|-----------|---------|-------|---------|
| 10K distance checks | ~2.1ms | ~0.05ms | 42x |
| 1K pathfinding (A*) | ~8ms | ~0.3ms | 27x |
| 50K particle update | ~12ms | ~0.2ms | 60x |
| Matrix multiplication (1K) | ~0.8ms | ~0.02ms | 40x |

## Common Pitfalls

1. **Forgetting `[BurstCompile]`** — Job runs in managed mode, no speedup
2. **Too small batch size** — Scheduling overhead > computation. Use 32-128 for light jobs
3. **Completing immediately** — `handle.Complete()` blocks main thread. Schedule early, complete late
4. **NativeContainer leaks** — Use `[DeallocateOnJobCompletion]` or explicit Dispose
5. **Accessing managed data in Burst** — Compile error. Convert to NativeArray first
