# State-Sync Patterns

## Core Concept

In state-sync, the **server is authoritative** — it runs the simulation and sends state snapshots to clients. Clients render the state and send inputs to the server.

```
Client A                    Server                    Client B
   │                          │                          │
   ├─── Input ───────────────►│                          │
   │                          │◄── Input ────────────────┤
   │                          │                          │
   │                          ├── Simulate ──┤           │
   │                          │              │           │
   │◄── State Snapshot ───────┤── State Snapshot ───────►│
   │                          │                          │
   ├─── Interpolate/Render    │    Interpolate/Render ──┤
```

## When to Use State-Sync

- FPS / TPS (server authority prevents cheating)
- MMO (too many entities for lockstep)
- Physics-heavy games (Unity physics is non-deterministic)
- Games where "feel" matters more than perfect sync

---

## Core Implementation

### 1. Network Entity

```csharp
/// <summary>
/// Base class for any networked game object.
/// Handles state serialization and interpolation.
/// </summary>
public class NetworkEntity : MonoBehaviour
{
    public uint NetId { get; set; }
    public int OwnerId { get; set; }
    public bool IsLocalPlayer => OwnerId == NetworkManager.LocalPlayerId;

    private StateBuffer _stateBuffer = new(60); // 1 second at 60fps

    /// <summary>
    /// Server: serialize current state for network transmission.
    /// </summary>
    public virtual void SerializeState(BinaryWriter writer)
    {
        writer.Write(transform.position.x);
        writer.Write(transform.position.y);
        writer.Write(transform.position.z);
        writer.Write(transform.rotation.eulerAngles.y);
    }

    /// <summary>
    /// Client: deserialize and buffer state for interpolation.
    /// </summary>
    public virtual void DeserializeState(BinaryReader reader, float serverTime)
    {
        var state = new EntityState
        {
            Timestamp = serverTime,
            Position = new Vector3(reader.ReadSingle(), reader.ReadSingle(), reader.ReadSingle()),
            RotationY = reader.ReadSingle()
        };
        _stateBuffer.Add(state);
    }

    /// <summary>
    /// Client: interpolate between buffered states for smooth rendering.
    /// </summary>
    public virtual void Interpolate(float renderTime)
    {
        if (IsLocalPlayer) return; // Local player uses prediction

        var (a, b, t) = _stateBuffer.GetInterpolationPair(renderTime);
        if (a.HasValue && b.HasValue)
        {
            transform.position = Vector3.Lerp(a.Value.Position, b.Value.Position, t);
            var rot = transform.eulerAngles;
            rot.y = Mathf.LerpAngle(a.Value.RotationY, b.Value.RotationY, t);
            transform.eulerAngles = rot;
        }
    }
}
```

### 2. State Buffer for Interpolation

```csharp
/// <summary>
/// Circular buffer of entity states for smooth interpolation.
/// Renders at (server_time - interpolation_delay) to always have
/// two states to interpolate between.
/// </summary>
public class StateBuffer
{
    private readonly EntityState[] _buffer;
    private int _head;
    private int _count;

    public StateBuffer(int capacity)
    {
        _buffer = new EntityState[capacity];
    }

    public void Add(EntityState state)
    {
        _buffer[_head] = state;
        _head = (_head + 1) % _buffer.Length;
        _count = Math.Min(_count + 1, _buffer.Length);
    }

    /// <summary>
    /// Find two states surrounding the render time and compute interpolation factor.
    /// </summary>
    public (EntityState? a, EntityState? b, float t) GetInterpolationPair(float renderTime)
    {
        EntityState? before = null, after = null;

        for (int i = 0; i < _count; i++)
        {
            int idx = ((_head - 1 - i) + _buffer.Length) % _buffer.Length;
            var state = _buffer[idx];

            if (state.Timestamp <= renderTime)
            {
                before = state;
                // Find the next state after renderTime
                if (i > 0)
                {
                    int nextIdx = (idx + 1) % _buffer.Length;
                    after = _buffer[nextIdx];
                }
                break;
            }
        }

        if (!before.HasValue || !after.HasValue) return (before, after, 0f);

        float duration = after.Value.Timestamp - before.Value.Timestamp;
        float t = duration > 0 ? (renderTime - before.Value.Timestamp) / duration : 0f;
        return (before, after, Mathf.Clamp01(t));
    }
}

public struct EntityState
{
    public float Timestamp;
    public Vector3 Position;
    public float RotationY;
}
```

### 3. Client-Side Prediction

```csharp
/// <summary>
/// Client-side prediction for the local player.
/// Apply inputs immediately, then reconcile when server confirms.
/// </summary>
public class ClientPrediction
{
    private readonly List<PredictedInput> _pendingInputs = new();

    /// <summary>
    /// Apply input locally (prediction) and send to server.
    /// </summary>
    public void PredictInput(PlayerInput input, PlayerController controller)
    {
        // Apply locally
        controller.ApplyInput(input);

        // Store for reconciliation
        _pendingInputs.Add(new PredictedInput
        {
            SequenceNumber = input.SequenceNumber,
            Input = input
        });

        // Send to server
        NetworkManager.SendInput(input);
    }

    /// <summary>
    /// Server confirmed state. Reconcile: if server state differs from
    /// our prediction, snap to server state and re-apply unconfirmed inputs.
    /// </summary>
    public void Reconcile(int lastProcessedInput, Vector3 serverPosition, PlayerController controller)
    {
        // Remove confirmed inputs
        _pendingInputs.RemoveAll(p => p.SequenceNumber <= lastProcessedInput);

        // Check if prediction was correct
        float error = Vector3.Distance(controller.transform.position, serverPosition);
        if (error > 0.01f) // Threshold
        {
            // Snap to server state
            controller.transform.position = serverPosition;

            // Re-apply unconfirmed inputs
            foreach (var pending in _pendingInputs)
                controller.ApplyInput(pending.Input);
        }
    }

    private struct PredictedInput
    {
        public int SequenceNumber;
        public PlayerInput Input;
    }
}
```

---

## Bandwidth Optimization

### Delta Compression

Only send what changed since last snapshot:

```csharp
public static class DeltaCompressor
{
    /// <summary>
    /// Compare two snapshots, return only the differences.
    /// Reduces bandwidth by 60-80% for typical game states.
    /// </summary>
    public static byte[] ComputeDelta(byte[] baseline, byte[] current)
    {
        using var ms = new MemoryStream();
        using var writer = new BinaryWriter(ms);

        int length = Math.Max(baseline.Length, current.Length);
        for (int i = 0; i < length; i++)
        {
            byte b = i < baseline.Length ? baseline[i] : (byte)0;
            byte c = i < current.Length ? current[i] : (byte)0;
            if (b != c)
            {
                writer.Write((ushort)i);  // offset
                writer.Write(c);           // new value
            }
        }
        return ms.ToArray();
    }
}
```

### Area of Interest (for MMO)

Only send entities that are relevant to each client:

```csharp
public class AreaOfInterest
{
    private const float VIEW_RADIUS = 50f;

    /// <summary>
    /// Filter entities to only those within the player's view radius.
    /// </summary>
    public List<NetworkEntity> GetRelevantEntities(Vector3 playerPos, List<NetworkEntity> allEntities)
    {
        var result = new List<NetworkEntity>();
        float sqrRadius = VIEW_RADIUS * VIEW_RADIUS;

        foreach (var entity in allEntities)
        {
            if ((entity.transform.position - playerPos).sqrMagnitude <= sqrRadius)
                result.Add(entity);
        }
        return result;
    }
}
```

---

## Tick Rate Guidelines

| Game Type | Server Tick Rate | Client Send Rate | Interpolation Delay |
|-----------|-----------------|-----------------|-------------------|
| FPS (competitive) | 128 Hz | 128 Hz | 1 tick |
| FPS (casual) | 60 Hz | 60 Hz | 2 ticks |
| MOBA | 30 Hz | 30 Hz | 2-3 ticks |
| MMO | 20 Hz | 20 Hz | 3-5 ticks |
| Turn-based | On event | On event | N/A |
