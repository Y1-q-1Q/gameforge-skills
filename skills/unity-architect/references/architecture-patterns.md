# Unity Architecture Patterns

## Pattern Selection Guide

| Game Type | Recommended Pattern | Why |
|-----------|-------------------|-----|
| Small/Jam | Singleton + Event | Fast to set up, low overhead |
| Medium (solo/small team) | Service Locator + MVC | Testable, moderate complexity |
| Large (team) | Dependency Injection + ECS | Scalable, decoupled, team-friendly |
| Multiplayer | Command + State Machine | Deterministic, replayable, syncable |

---

## 1. Singleton Pattern (with improvements)

**When:** Small projects, game jams, prototypes.
**Problem with naive singletons:** Hard to test, hidden dependencies, initialization order issues.

**Improved approach — Lazy Singleton with ScriptableObject:**

```csharp
/// <summary>
/// Base class for singleton ScriptableObjects. Avoids MonoBehaviour lifecycle issues.
/// </summary>
public abstract class SingletonSO<T> : ScriptableObject where T : ScriptableObject
{
    private static T _instance;

    public static T Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = Resources.Load<T>(typeof(T).Name);
#if UNITY_EDITOR
                if (_instance == null)
                    Debug.LogError($"[SingletonSO] {typeof(T).Name} not found in Resources/");
#endif
            }
            return _instance;
        }
    }
}
```

---

## 2. Service Locator Pattern

**When:** Medium projects where you want decoupling without a DI framework.

```csharp
/// <summary>
/// Lightweight service locator. Register services at startup, resolve anywhere.
/// </summary>
public static class ServiceLocator
{
    private static readonly Dictionary<Type, object> _services = new();

    public static void Register<T>(T service) where T : class
    {
        _services[typeof(T)] = service;
    }

    public static T Get<T>() where T : class
    {
        if (_services.TryGetValue(typeof(T), out var service))
            return (T)service;
        throw new InvalidOperationException($"Service {typeof(T).Name} not registered");
    }

    public static void Clear() => _services.Clear();
}
```

**Bootstrap example:**

```csharp
public class GameBootstrap : MonoBehaviour
{
    private void Awake()
    {
        ServiceLocator.Register<IAudioService>(new AudioService());
        ServiceLocator.Register<ISaveService>(new SaveService());
        ServiceLocator.Register<IInputService>(new InputService());
    }
}
```

---

## 3. Event Bus / Message System

**When:** Any project that needs decoupled communication between systems.

```csharp
/// <summary>
/// Type-safe event bus. Zero-allocation for common cases.
/// </summary>
public static class EventBus
{
    private static readonly Dictionary<Type, List<Delegate>> _handlers = new();

    public static void Subscribe<T>(Action<T> handler) where T : struct
    {
        var type = typeof(T);
        if (!_handlers.ContainsKey(type))
            _handlers[type] = new List<Delegate>();
        _handlers[type].Add(handler);
    }

    public static void Unsubscribe<T>(Action<T> handler) where T : struct
    {
        if (_handlers.TryGetValue(typeof(T), out var list))
            list.Remove(handler);
    }

    public static void Publish<T>(T evt) where T : struct
    {
        if (_handlers.TryGetValue(typeof(T), out var list))
        {
            // Iterate copy to allow subscribe/unsubscribe during publish
            for (int i = list.Count - 1; i >= 0; i--)
                ((Action<T>)list[i]).Invoke(evt);
        }
    }

    public static void Clear() => _handlers.Clear();
}
```

**Usage:**

```csharp
// Define event
public struct PlayerDiedEvent
{
    public int PlayerId;
    public Vector3 Position;
}

// Subscribe
EventBus.Subscribe<PlayerDiedEvent>(OnPlayerDied);

// Publish
EventBus.Publish(new PlayerDiedEvent { PlayerId = 1, Position = transform.position });
```

---

## 4. State Machine Pattern

**When:** Character controllers, AI, game flow, UI navigation.

```csharp
/// <summary>
/// Generic finite state machine. States are classes, transitions are explicit.
/// </summary>
public class StateMachine<T> where T : class
{
    private IState<T> _currentState;
    private readonly T _context;

    public StateMachine(T context) => _context = context;

    public void SetState(IState<T> newState)
    {
        _currentState?.Exit(_context);
        _currentState = newState;
        _currentState.Enter(_context);
    }

    public void Update() => _currentState?.Update(_context);
    public void FixedUpdate() => _currentState?.FixedUpdate(_context);
}

public interface IState<T> where T : class
{
    void Enter(T context);
    void Update(T context);
    void FixedUpdate(T context);
    void Exit(T context);
}
```

---

## 5. Command Pattern

**When:** Multiplayer (input replication), undo/redo, replay systems.

```csharp
/// <summary>
/// Serializable command for network sync and replay.
/// </summary>
public interface ICommand
{
    int Frame { get; }
    void Execute();
    void Undo();
}

public class CommandBuffer
{
    private readonly List<ICommand> _history = new();
    private int _pointer = -1;

    public void Execute(ICommand cmd)
    {
        // Remove any undone commands
        if (_pointer < _history.Count - 1)
            _history.RemoveRange(_pointer + 1, _history.Count - _pointer - 1);

        cmd.Execute();
        _history.Add(cmd);
        _pointer++;
    }

    public void Undo()
    {
        if (_pointer >= 0)
        {
            _history[_pointer].Undo();
            _pointer--;
        }
    }

    public void Redo()
    {
        if (_pointer < _history.Count - 1)
        {
            _pointer++;
            _history[_pointer].Execute();
        }
    }
}
```

---

## 6. Object Pool Pattern

**When:** Any game with frequent instantiation — bullets, particles, enemies, UI elements.

```csharp
/// <summary>
/// Generic object pool. Pre-warms on init, grows on demand.
/// </summary>
public class ObjectPool<T> where T : class
{
    private readonly Stack<T> _pool;
    private readonly Func<T> _createFunc;
    private readonly Action<T> _onGet;
    private readonly Action<T> _onRelease;

    public ObjectPool(Func<T> createFunc, Action<T> onGet, Action<T> onRelease, int initialSize = 16)
    {
        _pool = new Stack<T>(initialSize);
        _createFunc = createFunc;
        _onGet = onGet;
        _onRelease = onRelease;

        for (int i = 0; i < initialSize; i++)
            _pool.Push(_createFunc());
    }

    public T Get()
    {
        var item = _pool.Count > 0 ? _pool.Pop() : _createFunc();
        _onGet?.Invoke(item);
        return item;
    }

    public void Release(T item)
    {
        _onRelease?.Invoke(item);
        _pool.Push(item);
    }

    public int CountInactive => _pool.Count;
}
```

---

## Pattern Combinations by Project Scale

### Solo / Game Jam
```
EventBus + Singleton + State Machine
├── Simple, fast to implement
├── GameManager (singleton) orchestrates
├── Events for cross-system communication
└── State machines for player + game flow
```

### Small Team (2-5)
```
Service Locator + Event Bus + Command + Object Pool
├── Services registered at bootstrap
├── Events for loose coupling
├── Commands for input (enables replay/undo)
└── Pools for performance-critical objects
```

### Large Team (5+)
```
DI Container + ECS + Event Bus + Command + Object Pool
├── VContainer or Zenject for dependency injection
├── ECS for data-heavy systems (AI, physics, rendering)
├── Events for UI and cross-domain communication
├── Commands for networking and replay
└── Pools managed by DI container lifecycle
```
