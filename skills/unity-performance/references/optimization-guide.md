# Performance Optimization Guide

## Profiling Workflow

```
1. Profile → Identify bottleneck → Fix → Measure → Repeat
   Never optimize without profiling first.
```

### Unity Profiler Modules

| Module | What It Shows | Common Issues |
|--------|--------------|---------------|
| CPU | Script execution time | Expensive Update(), GC spikes |
| GPU | Draw calls, shader time | Too many draw calls, complex shaders |
| Memory | Allocations, GC | Texture memory, mesh duplication |
| Rendering | Batching stats | Broken batches, overdraw |
| Physics | Collision checks | Too many colliders, complex meshes |

## GC-Free Patterns (Critical for 60fps)

```csharp
// ❌ Allocates every frame
void Update()
{
    var enemies = FindObjectsOfType<Enemy>();           // Allocates array
    var nearby = enemies.Where(e => e.IsAlive).ToList(); // Allocates list + LINQ
    foreach (var e in nearby) { }                        // Enumerator allocation
}

// ✅ Zero allocation
private readonly List<Enemy> _enemyCache = new();
private readonly Collider[] _overlapResults = new Collider[32];

void Update()
{
    int count = Physics.OverlapSphereNonAlloc(transform.position, 10f, _overlapResults);
    for (int i = 0; i < count; i++)
    {
        if (_overlapResults[i].TryGetComponent<Enemy>(out var enemy) && enemy.IsAlive)
            _enemyCache.Add(enemy);
    }
    // Process _enemyCache...
    _enemyCache.Clear(); // Reuse, don't reallocate
}
```

### String Concatenation

```csharp
// ❌ Creates garbage every frame
scoreText.text = "Score: " + score.ToString();

// ✅ Use StringBuilder or cached format
private readonly StringBuilder _sb = new(32);
void UpdateScore(int score)
{
    _sb.Clear();
    _sb.Append("Score: ").Append(score);
    scoreText.text = _sb.ToString();
}

// ✅ Or use TextMeshPro SetText (zero-alloc)
tmpText.SetText("Score: {0}", score);
```

## Draw Call Optimization

| Technique | Savings | Effort |
|-----------|---------|--------|
| Static Batching | Combines static meshes | ⭐ (checkbox) |
| Dynamic Batching | Combines small meshes | ⭐ (automatic) |
| GPU Instancing | Same mesh, different transforms | ⭐⭐ |
| SRP Batcher | Same shader, different materials | ⭐ (URP default) |
| Texture Atlasing | Combine textures → fewer materials | ⭐⭐ |
| LOD Groups | Reduce poly count at distance | ⭐⭐ |
| Occlusion Culling | Skip hidden objects | ⭐⭐ |

## Mobile Performance Budget

| Resource | Budget (mid-range) | Budget (low-end) |
|----------|-------------------|-------------------|
| Draw calls | < 200 | < 100 |
| Triangles | < 300K | < 100K |
| Texture memory | < 200 MB | < 100 MB |
| SetPass calls | < 50 | < 30 |
| Script CPU | < 5ms | < 3ms |
| Target FPS | 60 | 30 |

## Object Pooling Checklist

Pool these (frequently created/destroyed):
- ✅ Bullets / projectiles
- ✅ Particle effects
- ✅ Enemy spawns
- ✅ Damage numbers / floating text
- ✅ Audio sources (one-shot SFX)
- ✅ UI list items

Don't pool these:
- ❌ Singletons / managers
- ❌ Player character
- ❌ Scene-lifetime objects
