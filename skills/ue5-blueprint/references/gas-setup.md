# GameplayAbilitySystem (GAS) Setup

## Architecture Overview

```
AbilitySystemComponent (ASC) — lives on the actor
  ├── GameplayAbilities — things the actor can do
  ├── GameplayEffects — modifications to attributes
  ├── GameplayTags — state flags
  └── AttributeSet — numeric stats (Health, Mana, etc.)
```

## Minimal Setup

### 1. AttributeSet

```cpp
UCLASS()
class UCombatAttributeSet : public UAttributeSet
{
    GENERATED_BODY()
public:
    UPROPERTY(BlueprintReadOnly, ReplicatedUsing = OnRep_Health)
    FGameplayAttributeData Health;
    ATTRIBUTE_ACCESSORS(UCombatAttributeSet, Health)

    UPROPERTY(BlueprintReadOnly, ReplicatedUsing = OnRep_MaxHealth)
    FGameplayAttributeData MaxHealth;
    ATTRIBUTE_ACCESSORS(UCombatAttributeSet, MaxHealth)

    UPROPERTY(BlueprintReadOnly)
    FGameplayAttributeData AttackPower;
    ATTRIBUTE_ACCESSORS(UCombatAttributeSet, AttackPower)

    virtual void PreAttributeChange(const FGameplayAttribute& Attribute, float& NewValue) override
    {
        if (Attribute == GetHealthAttribute())
            NewValue = FMath::Clamp(NewValue, 0.f, GetMaxHealth());
    }

    UFUNCTION()
    void OnRep_Health(const FGameplayAttributeData& OldHealth) {}
    UFUNCTION()
    void OnRep_MaxHealth(const FGameplayAttributeData& OldMaxHealth) {}
};
```

### 2. AbilitySystemComponent on Character

```cpp
UCLASS()
class AGameCharacter : public ACharacter, public IAbilitySystemInterface
{
    GENERATED_BODY()
public:
    AGameCharacter();

    virtual UAbilitySystemComponent* GetAbilitySystemComponent() const override { return ASC; }

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
    UAbilitySystemComponent* ASC;

    UPROPERTY()
    UCombatAttributeSet* Attributes;

    virtual void PossessedBy(AController* NewController) override
    {
        Super::PossessedBy(NewController);
        ASC->InitAbilityActorInfo(this, this);

        // Grant default abilities
        for (auto& AbilityClass : DefaultAbilities)
            ASC->GiveAbility(FGameplayAbilitySpec(AbilityClass, 1, INDEX_NONE, this));
    }

protected:
    UPROPERTY(EditDefaultsOnly, Category = "Abilities")
    TArray<TSubclassOf<UGameplayAbility>> DefaultAbilities;
};
```

### 3. GameplayAbility (C++ Base)

```cpp
UCLASS(Abstract, Blueprintable)
class UGameAbilityBase : public UGameplayAbility
{
    GENERATED_BODY()
public:
    // Blueprint subclasses override ActivateAbility
    // C++ handles cost checking, cooldown, targeting
};
```

## Tag-Based State Machine

```
Character.State.Idle
Character.State.Attacking
Character.State.Stunned
Character.State.Dead

// Block abilities while stunned
AbilitySpec.ActivationBlockedTags.AddTag("Character.State.Stunned");

// Cancel abilities on death
AbilitySpec.CancelAbilitiesWithTag.AddTag("Character.State.Dead");
```

## When to Use GAS

| Scenario | Use GAS? |
|----------|----------|
| RPG with many abilities | ✅ Absolutely |
| Simple platformer | ❌ Overkill |
| MOBA/hero shooter | ✅ Perfect fit |
| Multiplayer with abilities | ✅ Built-in replication |
| Prototype/game jam | ❌ Too much setup time |
