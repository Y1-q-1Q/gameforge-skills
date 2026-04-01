# Subsystem Patterns

## Subsystem Types

| Type | Lifetime | Access | Use Case |
|------|----------|--------|----------|
| UEngineSubsystem | Engine lifetime | GEngine | Global services (analytics, crash reporting) |
| UGameInstanceSubsystem | Game instance | GameInstance | Save system, player profile |
| UWorldSubsystem | World/level | World | Level-specific managers (spawning, weather) |
| ULocalPlayerSubsystem | Per local player | LocalPlayer | Input, UI state, camera |

## Why Subsystems > Singletons

```
Singleton problems:
  - Hard to test (global state)
  - Unclear lifetime (when created? when destroyed?)
  - No engine integration (no tick, no serialization)

Subsystem advantages:
  - Automatic lifetime management
  - Engine-integrated (tick, serialize, GC)
  - Easy to access from anywhere
  - Testable (can mock)
```

## Example: Quest Subsystem

```cpp
UCLASS()
class UQuestSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()
public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override
    {
        // Load saved quest state
        LoadQuestProgress();
    }

    UFUNCTION(BlueprintCallable, Category = "Quests")
    void AcceptQuest(FName QuestId)
    {
        if (!ActiveQuests.Contains(QuestId))
        {
            ActiveQuests.Add(QuestId);
            OnQuestAccepted.Broadcast(QuestId);
        }
    }

    UFUNCTION(BlueprintCallable, Category = "Quests")
    void CompleteObjective(FName QuestId, FName ObjectiveId)
    {
        // Update progress, check completion
        OnObjectiveCompleted.Broadcast(QuestId, ObjectiveId);
    }

    UPROPERTY(BlueprintAssignable)
    FOnQuestAccepted OnQuestAccepted;

    UPROPERTY(BlueprintAssignable)
    FOnObjectiveCompleted OnObjectiveCompleted;

private:
    TSet<FName> ActiveQuests;
    void LoadQuestProgress();
};

// Access from anywhere:
UQuestSubsystem* Quests = GetGameInstance()->GetSubsystem<UQuestSubsystem>();
Quests->AcceptQuest("MainQuest_01");
```

## Example: Combat World Subsystem

```cpp
UCLASS()
class UCombatWorldSubsystem : public UWorldSubsystem
{
    GENERATED_BODY()
public:
    // Automatically created/destroyed with the world
    virtual void Initialize(FSubsystemCollectionBase& Collection) override {}

    UFUNCTION(BlueprintCallable)
    void RegisterCombatant(AActor* Actor) { Combatants.Add(Actor); }

    UFUNCTION(BlueprintCallable)
    void UnregisterCombatant(AActor* Actor) { Combatants.Remove(Actor); }

    UFUNCTION(BlueprintCallable)
    TArray<AActor*> GetCombatantsInRadius(FVector Origin, float Radius) const
    {
        TArray<AActor*> Result;
        for (auto* A : Combatants)
            if (A && FVector::Dist(A->GetActorLocation(), Origin) <= Radius)
                Result.Add(A);
        return Result;
    }

private:
    TArray<TWeakObjectPtr<AActor>> Combatants;
};
```
