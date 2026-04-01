# Replication Guide

## Property Replication

```cpp
UCLASS()
class ANetCharacter : public ACharacter
{
    GENERATED_BODY()
public:
    // Replicated property — server → all clients
    UPROPERTY(Replicated)
    float Health;

    // With notification — calls OnRep when value changes on client
    UPROPERTY(ReplicatedUsing = OnRep_Ammo)
    int32 Ammo;

    UFUNCTION()
    void OnRep_Ammo()
    {
        // Update UI on client
        UpdateAmmoDisplay(Ammo);
    }

    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override
    {
        Super::GetLifetimeReplicatedProps(OutLifetimeProps);
        DOREPLIFETIME(ANetCharacter, Health);
        DOREPLIFETIME_CONDITION(ANetCharacter, Ammo, COND_OwnerOnly); // Only to owning client
    }
};
```

## Replication Conditions

| Condition | Replicates To | Use Case |
|-----------|--------------|----------|
| COND_None | All clients | Position, health (everyone sees) |
| COND_OwnerOnly | Owning client | Ammo, inventory, cooldowns |
| COND_SkipOwner | All except owner | Third-person animations |
| COND_SimulatedOnly | Simulated proxies | Visual-only state |
| COND_InitialOnly | Once on spawn | Team, character class |

## RPCs (Remote Procedure Calls)

```cpp
// Client → Server (request action)
UFUNCTION(Server, Reliable, WithValidation)
void ServerFire(FVector AimLocation);
bool ServerFire_Validate(FVector AimLocation) { return true; } // Anti-cheat check
void ServerFire_Implementation(FVector AimLocation)
{
    // Server validates and executes
    if (Ammo <= 0) return;
    Ammo--;
    SpawnProjectile(AimLocation);
    MulticastPlayFireEffect(); // Tell everyone
}

// Server → All Clients (broadcast effect)
UFUNCTION(NetMulticast, Unreliable)
void MulticastPlayFireEffect();
void MulticastPlayFireEffect_Implementation()
{
    // Play VFX/SFX on all clients
    PlayFireAnimation();
    PlayFireSound();
}

// Server → Specific Client
UFUNCTION(Client, Reliable)
void ClientShowDamageNumber(float Damage);
void ClientShowDamageNumber_Implementation(float Damage)
{
    // Only this client sees it
    SpawnDamageWidget(Damage);
}
```

## RPC Decision Guide

| Direction | Reliable? | Use Case |
|-----------|-----------|----------|
| Server, Reliable | ✅ | Gameplay actions (fire, use item, interact) |
| Server, Unreliable | ❌ rare | Non-critical updates |
| Client, Reliable | ✅ | UI updates, notifications |
| Multicast, Unreliable | ✅ | VFX, SFX, cosmetic effects |
| Multicast, Reliable | ⚠️ Careful | Important state changes (round start) |

## Authority Pattern

```cpp
void ANetCharacter::TakeDamage(float Damage)
{
    if (!HasAuthority()) return; // Only server processes damage

    Health -= Damage;
    if (Health <= 0)
    {
        Health = 0;
        MulticastOnDeath(); // Tell all clients
    }
    // Health is replicated — clients auto-update
}
```
