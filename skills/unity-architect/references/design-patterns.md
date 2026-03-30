# Design Patterns for Game Development

## Pattern Quick Reference

| Pattern | Use Case | Complexity |
|---------|----------|------------|
| Singleton | Global managers (audio, input, save) | ⭐ |
| Observer/Event | Decoupled communication | ⭐ |
| State Machine | Character states, game flow, AI | ⭐⭐ |
| Command | Input handling, undo/redo, networking | ⭐⭐ |
| Object Pool | Bullets, particles, enemies | ⭐⭐ |
| Strategy | Swappable behaviors (AI, weapons, movement) | ⭐⭐ |
| Factory | Creating game objects with complex setup | ⭐⭐ |
| Component | Entity composition (Unity's core pattern) | ⭐ |
| Flyweight | Shared data (ScriptableObjects) | ⭐ |
| Service Locator | Dependency management without DI framework | ⭐⭐ |
| MVC/MVP | UI architecture | ⭐⭐ |
| Blackboard | AI knowledge sharing | ⭐⭐⭐ |
| Behavior Tree | Complex AI decision making | ⭐⭐⭐ |

---

## Game-Specific Pattern Combinations

### Action / Platformer
```
Core:     State Machine (player states) + Observer (events)
Combat:   Strategy (weapon behaviors) + Object Pool (projectiles)
Level:    Factory (enemy spawning) + Flyweight (shared enemy data)
UI:       MVC (health bar, score)
```

### RPG
```
Core:     Service Locator + Observer
Combat:   Command (turn actions) + Strategy (skills/spells)
Items:    Flyweight (item data as SO) + Factory (item creation)
Dialog:   State Machine (dialog flow) + Observer (quest triggers)
Save:     Memento (save states)
AI:       Behavior Tree + Blackboard
```

### Multiplayer (MOBA / FPS)
```
Core:     Service Locator + Observer
Network:  Command (input replication) + State Machine (connection states)
Gameplay: Object Pool (projectiles, effects) + Factory (character spawning)
Sync:     Command (deterministic replay) + Observer (state changes)
UI:       MVP (scoreboard, minimap)
```

### Casual / Puzzle
```
Core:     Singleton + Observer (keep it simple)
Gameplay: State Machine (game flow) + Strategy (level rules)
UI:       MVC (score, moves)
Data:     Flyweight (level configs as SO)
```

---

## ScriptableObject as Flyweight

One of Unity's most powerful patterns — use ScriptableObjects for shared, read-only data:

```csharp
[CreateAssetMenu(fileName = "WeaponData", menuName = "Game/Weapon Data")]
public class WeaponData : ScriptableObject
{
    public string weaponName;
    public int damage;
    public float attackSpeed;
    public float range;
    public GameObject projectilePrefab;
    public AudioClip attackSound;
}
```

**Benefits:**
- Data shared across all instances (no duplication in memory)
- Editable in Inspector without code changes
- Hot-reloadable in Editor
- Serializable for save/load
- Perfect for items, enemies, skills, levels, configs

---

## Strategy Pattern for Swappable Behaviors

```csharp
public interface IMovementStrategy
{
    void Move(Transform transform, Vector3 input, float speed);
}

public class GroundMovement : IMovementStrategy
{
    public void Move(Transform transform, Vector3 input, float speed)
    {
        var velocity = input * speed;
        transform.position += velocity * Time.deltaTime;
    }
}

public class FlyingMovement : IMovementStrategy
{
    public void Move(Transform transform, Vector3 input, float speed)
    {
        var velocity = input * speed;
        transform.position += velocity * Time.deltaTime; // No gravity
    }
}

public class SwimmingMovement : IMovementStrategy
{
    public void Move(Transform transform, Vector3 input, float speed)
    {
        var velocity = input * (speed * 0.6f); // Slower in water
        transform.position += velocity * Time.deltaTime;
    }
}

// Usage
public class PlayerMovement : MonoBehaviour
{
    private IMovementStrategy _strategy;

    public void SetStrategy(IMovementStrategy strategy) => _strategy = strategy;

    private void Update()
    {
        var input = new Vector3(Input.GetAxisRaw("Horizontal"), 0, Input.GetAxisRaw("Vertical"));
        _strategy?.Move(transform, input, 5f);
    }
}
```

---

## Factory Pattern for Complex Object Creation

```csharp
public class EnemyFactory
{
    private readonly Dictionary<string, EnemyData> _enemyDatabase;
    private readonly ObjectPool<Enemy> _pool;

    public Enemy Create(string enemyId, Vector3 position)
    {
        if (!_enemyDatabase.TryGetValue(enemyId, out var data))
            throw new ArgumentException($"Unknown enemy: {enemyId}");

        var enemy = _pool.Get();
        enemy.Initialize(data);
        enemy.transform.position = position;
        return enemy;
    }

    public void Recycle(Enemy enemy)
    {
        enemy.Reset();
        _pool.Release(enemy);
    }
}
```

---

## MVC for Game UI

```
Model (data)     ←→  Controller (logic)  ←→  View (display)
PlayerHealth          HealthController         HealthBarUI
  - current              - TakeDamage()          - UpdateBar()
  - max                  - Heal()                - PlayHitEffect()
  - OnChanged            - CheckDeath()          - ShowDamageNumber()
```

```csharp
// Model — pure data, no Unity dependencies
public class PlayerHealthModel
{
    public int Current { get; private set; }
    public int Max { get; private set; }
    public event Action<int, int> OnChanged; // current, max

    public PlayerHealthModel(int max)
    {
        Max = max;
        Current = max;
    }

    public void TakeDamage(int amount)
    {
        Current = Mathf.Max(0, Current - amount);
        OnChanged?.Invoke(Current, Max);
    }

    public void Heal(int amount)
    {
        Current = Mathf.Min(Max, Current + amount);
        OnChanged?.Invoke(Current, Max);
    }
}

// View — only handles display
public class HealthBarView : MonoBehaviour
{
    [SerializeField] private Image _fillImage;

    public void UpdateDisplay(int current, int max)
    {
        _fillImage.fillAmount = (float)current / max;
    }
}

// Controller — connects model and view
public class HealthController : MonoBehaviour
{
    [SerializeField] private HealthBarView _view;
    private PlayerHealthModel _model;

    public void Initialize(int maxHealth)
    {
        _model = new PlayerHealthModel(maxHealth);
        _model.OnChanged += _view.UpdateDisplay;
        _view.UpdateDisplay(_model.Current, _model.Max);
    }

    public void TakeDamage(int amount) => _model.TakeDamage(amount);
    public void Heal(int amount) => _model.Heal(amount);
    public bool IsDead => _model.Current <= 0;
}
```
