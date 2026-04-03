# MonoBehaviour ↔ ECS Component Mapping

## Basic Component Mapping

| MonoBehaviour | ECS Equivalent | Notes |
|---------------|----------------|-------|
| Transform | LocalTransform, LocalToWorld | Built-in |
| Rigidbody | PhysicsVelocity, PhysicsMass | Physics package |
| Collider | PhysicsCollider | Physics package |
| Animator | AnimatedEntity (custom) | Manual sync |

## Custom Component Example

### MonoBehaviour (Before)
```csharp
public class Health : MonoBehaviour {
    public float maxHealth = 100f;
    public float currentHealth;
    public float regenerationRate;
    
    void Update() {
        currentHealth += regenerationRate * Time.deltaTime;
    }
}
```

### ECS (After)
```csharp
// Component
public struct HealthData : IComponentData {
    public float maxHealth;
    public float currentHealth;
    public float regenerationRate;
}

// System
[UpdateInGroup(typeof(SimulationSystemGroup))]
public partial struct HealthRegenSystem : ISystem {
    [BurstCompile]
    public void OnUpdate(ref SystemState state) {
        float dt = SystemAPI.Time.DeltaTime;
        
        foreach (var health in SystemAPI.Query<RefRW<HealthData>>()) {
            health.ValueRW.currentHealth += 
                health.ValueRO.regenerationRate * dt;
        }
    }
}
```

## Event Bridging

### ECS → MonoBehaviour
```csharp
// ECS Event Component
public struct DamageEvent : IComponentData {
    public float amount;
    public Entity source;
}

// MonoBehaviour Bridge
public class DamageEventBridge : MonoBehaviour {
    void Update() {
        var eventQuery = World.DefaultGameObjectInjectionWorld
            .EntityManager
            .CreateEntityQuery(typeof(DamageEvent));
        
        // Process and raise C# event
    }
}
```
