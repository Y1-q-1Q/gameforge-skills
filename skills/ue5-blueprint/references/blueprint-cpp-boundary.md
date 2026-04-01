# Blueprint / C++ Boundary

## The Golden Rule

```
C++ for the "what" (framework, interfaces, base classes)
Blueprint for the "how" (specific game logic, tuning, iteration)
```

## When to Use C++

- Base classes that many Blueprints inherit from
- Performance-critical code (math, AI, physics queries)
- Engine-level systems (custom movement, networking)
- Anything called every tick on many actors
- Plugin/module boundaries

## When to Use Blueprint

- One-off game logic (this specific boss behavior)
- Designer-tunable values (damage, speed, timing)
- UI layout and binding
- Quick prototyping
- Level scripting

## Integration Patterns

### Pattern 1: C++ Base, Blueprint Subclass

```cpp
// C++ — the framework
UCLASS(Abstract, Blueprintable)
class AWeaponBase : public AActor
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintCallable)
    void Fire();

    // Blueprint implements the specifics
    UFUNCTION(BlueprintImplementableEvent)
    void OnFire();

    UFUNCTION(BlueprintNativeEvent)
    float GetDamage() const;

protected:
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Weapon")
    float BaseDamage = 10.f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Weapon")
    float FireRate = 0.5f;
};

// Blueprint subclass: BP_Shotgun
// - Overrides OnFire() to spawn pellets
// - Overrides GetDamage() to add spread modifier
// - Sets BaseDamage = 25, FireRate = 1.2
```

### Pattern 2: Blueprint Function Library

```cpp
// Expose utility functions to Blueprint
UCLASS()
class UCombatFunctionLibrary : public UBlueprintFunctionLibrary
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintPure, Category = "Combat")
    static float CalculateDamage(float BaseDamage, float ArmorRating, float CritMultiplier);

    UFUNCTION(BlueprintCallable, Category = "Combat", meta = (WorldContext = "WorldContext"))
    static TArray<AActor*> GetEnemiesInRadius(UObject* WorldContext, FVector Origin, float Radius);
};
```

### Pattern 3: Blueprint Interface

```cpp
UINTERFACE(MinimalAPI, Blueprintable)
class UDamageable : public UInterface { GENERATED_BODY() };

class IDamageable
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintNativeEvent, BlueprintCallable)
    void TakeDamage(float Amount, AActor* Instigator);

    UFUNCTION(BlueprintNativeEvent, BlueprintCallable)
    bool IsDead() const;
};

// Any actor (C++ or Blueprint) can implement IDamageable
// Call via: IDamageable::Execute_TakeDamage(TargetActor, Damage, this);
```

## Performance Guidelines

| Operation | Blueprint | C++ | Speedup |
|-----------|-----------|-----|---------|
| Simple math | ~10ns | ~1ns | 10x |
| Array iteration (1000) | ~500μs | ~5μs | 100x |
| String operations | Slow | Fast | 50x+ |
| Tick function | OK for few actors | Required for many | — |

**Rule of thumb**: If it runs on >50 actors per frame, write it in C++.
