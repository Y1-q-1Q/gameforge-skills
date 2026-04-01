# Game-Specific Test Patterns

## Testing State Machines

```csharp
[TestFixture]
public class EnemyStateMachineTests
{
    private EnemyStateMachine _sm;

    [SetUp]
    public void Setup() => _sm = new EnemyStateMachine();

    [Test]
    public void InitialState_IsIdle()
    {
        Assert.AreEqual(EnemyState.Idle, _sm.CurrentState);
    }

    [Test]
    public void PlayerDetected_TransitionsToChase()
    {
        _sm.OnPlayerDetected(distance: 5f);
        Assert.AreEqual(EnemyState.Chase, _sm.CurrentState);
    }

    [Test]
    public void InAttackRange_TransitionsToAttack()
    {
        _sm.OnPlayerDetected(distance: 5f); // → Chase
        _sm.OnPlayerInRange(distance: 1.5f); // → Attack
        Assert.AreEqual(EnemyState.Attack, _sm.CurrentState);
    }

    [Test]
    public void HealthZero_TransitionsToDead_FromAnyState()
    {
        _sm.OnPlayerDetected(distance: 5f); // → Chase
        _sm.OnHealthDepleted();
        Assert.AreEqual(EnemyState.Dead, _sm.CurrentState);
    }

    [Test]
    public void Dead_IgnoresAllTransitions()
    {
        _sm.OnHealthDepleted();
        _sm.OnPlayerDetected(distance: 5f);
        Assert.AreEqual(EnemyState.Dead, _sm.CurrentState); // Still dead
    }
}
```

**Key principle**: Separate state machine logic from MonoBehaviour. Test the logic in EditMode.

## Testing Event Systems

```csharp
[TestFixture]
public class EventBusTests
{
    private GameEventBus _bus;
    private int _callCount;
    private float _lastDamage;

    [SetUp]
    public void Setup()
    {
        _bus = new GameEventBus();
        _callCount = 0;
        _lastDamage = 0;
    }

    [Test]
    public void Subscribe_ReceivesEvent()
    {
        _bus.Subscribe<DamageEvent>(OnDamage);
        _bus.Publish(new DamageEvent { Amount = 50f });

        Assert.AreEqual(1, _callCount);
        Assert.AreEqual(50f, _lastDamage);
    }

    [Test]
    public void Unsubscribe_StopsReceiving()
    {
        _bus.Subscribe<DamageEvent>(OnDamage);
        _bus.Unsubscribe<DamageEvent>(OnDamage);
        _bus.Publish(new DamageEvent { Amount = 50f });

        Assert.AreEqual(0, _callCount);
    }

    [Test]
    public void MultipleSubscribers_AllReceive()
    {
        _bus.Subscribe<DamageEvent>(OnDamage);
        _bus.Subscribe<DamageEvent>(OnDamage);
        _bus.Publish(new DamageEvent { Amount = 25f });

        Assert.AreEqual(2, _callCount);
    }

    void OnDamage(DamageEvent e) { _callCount++; _lastDamage = e.Amount; }
}
```

## Testing Async / UniTask

```csharp
[TestFixture]
public class AsyncLoadTests
{
    [Test]
    public async Task LoadConfig_ReturnsValidData()
    {
        var loader = new ConfigLoader();
        var config = await loader.LoadAsync("test-config.json");

        Assert.IsNotNull(config);
        Assert.Greater(config.MaxHealth, 0);
    }

    [Test]
    public async Task LoadConfig_InvalidPath_ThrowsException()
    {
        var loader = new ConfigLoader();
        Assert.ThrowsAsync<FileNotFoundException>(
            async () => await loader.LoadAsync("nonexistent.json"));
    }
}
```

## Testing ScriptableObject Data

```csharp
[TestFixture]
public class WeaponDataTests
{
    [Test]
    public void DamageCalculation_AppliesMultiplier()
    {
        var weapon = ScriptableObject.CreateInstance<WeaponData>();
        weapon.baseDamage = 100;
        weapon.critMultiplier = 2.5f;

        Assert.AreEqual(100f, weapon.CalculateDamage(isCrit: false));
        Assert.AreEqual(250f, weapon.CalculateDamage(isCrit: true));

        Object.DestroyImmediate(weapon); // Clean up
    }

    [TestCase(1, 100)]
    [TestCase(5, 120)]
    [TestCase(10, 150)]
    public void LevelScaling_MatchesDesign(int level, float expectedDamage)
    {
        var weapon = ScriptableObject.CreateInstance<WeaponData>();
        weapon.baseDamage = 100;
        weapon.scalingPerLevel = 0.05f;

        float actual = weapon.GetDamageAtLevel(level);
        Assert.AreEqual(expectedDamage, actual, 0.1f);

        Object.DestroyImmediate(weapon);
    }
}
```

## Test Architecture: Separate Logic from Unity

```
// ❌ Hard to test — logic mixed with MonoBehaviour
public class Enemy : MonoBehaviour
{
    void Update()
    {
        if (hp <= 0) Die();
        if (Vector3.Distance(transform.position, player.position) < range) Attack();
    }
}

// ✅ Easy to test — logic in pure C# class
public class EnemyBrain  // Pure C#, no MonoBehaviour
{
    public EnemyState Evaluate(float hp, float distToPlayer, float range)
    {
        if (hp <= 0) return EnemyState.Dead;
        if (distToPlayer < range) return EnemyState.Attack;
        return EnemyState.Chase;
    }
}

public class EnemyController : MonoBehaviour  // Thin wrapper
{
    EnemyBrain _brain = new();
    void Update()
    {
        var state = _brain.Evaluate(hp, dist, range);
        // Apply state...
    }
}
```

This pattern makes 80% of game logic testable in EditMode (fast, reliable).
