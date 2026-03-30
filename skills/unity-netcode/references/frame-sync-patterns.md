# Frame-Sync (Lockstep) Patterns

## Core Concept

In frame-sync (lockstep), all clients run the **same simulation** with the **same inputs**. Only inputs are transmitted, not game state. This means:
- Bandwidth is minimal (only inputs, not positions/states)
- All clients must be **deterministic** (same input → same output, always)
- Desync = game-breaking bug

## Architecture Overview

```
Client A                    Server                    Client B
   │                          │                          │
   ├─── Input(frame=10) ────►│                          │
   │                          │◄── Input(frame=10) ─────┤
   │                          │                          │
   │◄── AllInputs(frame=10) ─┤── AllInputs(frame=10) ──►│
   │                          │                          │
   ├─── Simulate(frame=10)   │   Simulate(frame=10) ───┤
   │    (deterministic)       │   (deterministic)        │
   │                          │                          │
```

## Core Implementation

### 1. Lockstep Simulation Loop

```csharp
/// <summary>
/// Core lockstep simulation manager. Advances simulation only when
/// all player inputs for the current frame are received.
/// </summary>
public class LockstepManager : MonoBehaviour
{
    public int CurrentFrame { get; private set; }
    public int InputDelay { get; set; } = 2; // frames of input delay

    private readonly Dictionary<int, FrameInput[]> _inputBuffer = new();
    private readonly List<ISimulationSystem> _systems = new();
    private int _playerCount;
    private bool _running;

    /// <summary>
    /// Fixed timestep for deterministic simulation (60fps = 16.67ms).
    /// Must match across all clients.
    /// </summary>
    public const float FIXED_DELTA = 1f / 60f;

    public void Initialize(int playerCount, List<ISimulationSystem> systems)
    {
        _playerCount = playerCount;
        _systems.AddRange(systems);
        CurrentFrame = 0;
        _running = true;
    }

    private void FixedUpdate()
    {
        if (!_running) return;

        // Only advance if we have all inputs for current frame
        if (HasAllInputs(CurrentFrame))
        {
            var inputs = _inputBuffer[CurrentFrame];
            SimulateFrame(CurrentFrame, inputs);
            CurrentFrame++;
        }
        // else: wait (game freezes until inputs arrive)
    }

    private bool HasAllInputs(int frame)
    {
        return _inputBuffer.ContainsKey(frame) &&
               _inputBuffer[frame].Length == _playerCount &&
               _inputBuffer[frame].All(i => i != null);
    }

    private void SimulateFrame(int frame, FrameInput[] inputs)
    {
        foreach (var system in _systems)
            system.Simulate(frame, inputs, FIXED_DELTA);
    }

    /// <summary>
    /// Called when inputs are received from the network.
    /// </summary>
    public void ReceiveInput(int frame, int playerId, FrameInput input)
    {
        if (!_inputBuffer.ContainsKey(frame))
            _inputBuffer[frame] = new FrameInput[_playerCount];
        _inputBuffer[frame][playerId] = input;
    }
}
```

### 2. Input Definition

```csharp
/// <summary>
/// Serializable input for one player in one frame.
/// Keep this as small as possible — it's sent every frame.
/// </summary>
[System.Serializable]
public struct FrameInput
{
    public int Frame;
    public int PlayerId;

    // Movement (use fixed-point for determinism)
    public FixedPoint MoveX;
    public FixedPoint MoveY;

    // Actions (bitfield for bandwidth efficiency)
    public uint ActionFlags;

    // Target (for MOBA-style click-to-move)
    public FixedPoint TargetX;
    public FixedPoint TargetY;

    // Checksum for desync detection
    public uint Checksum;

    public bool HasAction(ActionType action) => (ActionFlags & (1u << (int)action)) != 0;
    public void SetAction(ActionType action) => ActionFlags |= (1u << (int)action);
}

[System.Flags]
public enum ActionType
{
    None = 0,
    Attack = 1,
    Skill1 = 2,
    Skill2 = 4,
    Skill3 = 8,
    Skill4 = 16,
    Item1 = 32,
    Item2 = 64,
}
```

### 3. Simulation System Interface

```csharp
/// <summary>
/// All game systems that participate in lockstep must implement this.
/// Systems are updated in registration order — order matters for determinism.
/// </summary>
public interface ISimulationSystem
{
    /// <summary>
    /// Simulate one frame. Must be fully deterministic.
    /// </summary>
    void Simulate(int frame, FrameInput[] inputs, float deltaTime);

    /// <summary>
    /// Save current state for rollback.
    /// </summary>
    byte[] SaveState();

    /// <summary>
    /// Restore state from snapshot.
    /// </summary>
    void LoadState(byte[] state);
}
```

### 4. Fixed-Point Math (Critical for Determinism)

```csharp
/// <summary>
/// Fixed-point number with 16.16 format.
/// Ensures identical results across all platforms (no floating-point variance).
/// </summary>
[System.Serializable]
public struct FixedPoint : IEquatable<FixedPoint>, IComparable<FixedPoint>
{
    public const int FRACTIONAL_BITS = 16;
    public const int ONE = 1 << FRACTIONAL_BITS; // 65536

    public long RawValue;

    public static readonly FixedPoint Zero = new() { RawValue = 0 };
    public static readonly FixedPoint One = new() { RawValue = ONE };
    public static readonly FixedPoint Half = new() { RawValue = ONE / 2 };

    public static FixedPoint FromInt(int value) => new() { RawValue = (long)value << FRACTIONAL_BITS };
    public static FixedPoint FromFloat(float value) => new() { RawValue = (long)(value * ONE) };

    public float ToFloat() => (float)RawValue / ONE;
    public int ToInt() => (int)(RawValue >> FRACTIONAL_BITS);

    // Arithmetic
    public static FixedPoint operator +(FixedPoint a, FixedPoint b) => new() { RawValue = a.RawValue + b.RawValue };
    public static FixedPoint operator -(FixedPoint a, FixedPoint b) => new() { RawValue = a.RawValue - b.RawValue };
    public static FixedPoint operator *(FixedPoint a, FixedPoint b) => new() { RawValue = (a.RawValue * b.RawValue) >> FRACTIONAL_BITS };
    public static FixedPoint operator /(FixedPoint a, FixedPoint b) => new() { RawValue = (a.RawValue << FRACTIONAL_BITS) / b.RawValue };
    public static FixedPoint operator -(FixedPoint a) => new() { RawValue = -a.RawValue };

    // Comparison
    public static bool operator >(FixedPoint a, FixedPoint b) => a.RawValue > b.RawValue;
    public static bool operator <(FixedPoint a, FixedPoint b) => a.RawValue < b.RawValue;
    public static bool operator >=(FixedPoint a, FixedPoint b) => a.RawValue >= b.RawValue;
    public static bool operator <=(FixedPoint a, FixedPoint b) => a.RawValue <= b.RawValue;
    public static bool operator ==(FixedPoint a, FixedPoint b) => a.RawValue == b.RawValue;
    public static bool operator !=(FixedPoint a, FixedPoint b) => a.RawValue != b.RawValue;

    public bool Equals(FixedPoint other) => RawValue == other.RawValue;
    public int CompareTo(FixedPoint other) => RawValue.CompareTo(other.RawValue);
    public override bool Equals(object obj) => obj is FixedPoint fp && Equals(fp);
    public override int GetHashCode() => RawValue.GetHashCode();
    public override string ToString() => ToFloat().ToString("F4");

    // Math functions
    public static FixedPoint Abs(FixedPoint a) => new() { RawValue = Math.Abs(a.RawValue) };
    public static FixedPoint Min(FixedPoint a, FixedPoint b) => a < b ? a : b;
    public static FixedPoint Max(FixedPoint a, FixedPoint b) => a > b ? a : b;

    public static FixedPoint Sqrt(FixedPoint a)
    {
        if (a.RawValue <= 0) return Zero;
        long val = a.RawValue << FRACTIONAL_BITS;
        long result = (long)Math.Sqrt(val);
        return new FixedPoint { RawValue = result };
    }
}

/// <summary>
/// Fixed-point 2D vector for deterministic simulation.
/// </summary>
public struct FPVector2
{
    public FixedPoint X;
    public FixedPoint Y;

    public FPVector2(FixedPoint x, FixedPoint y) { X = x; Y = y; }

    public static FPVector2 operator +(FPVector2 a, FPVector2 b) => new(a.X + b.X, a.Y + b.Y);
    public static FPVector2 operator -(FPVector2 a, FPVector2 b) => new(a.X - b.X, a.Y - b.Y);
    public static FPVector2 operator *(FPVector2 a, FixedPoint s) => new(a.X * s, a.Y * s);

    public FixedPoint SqrMagnitude => X * X + Y * Y;
    public FixedPoint Magnitude => FixedPoint.Sqrt(SqrMagnitude);

    public FPVector2 Normalized
    {
        get
        {
            var mag = Magnitude;
            if (mag == FixedPoint.Zero) return new FPVector2(FixedPoint.Zero, FixedPoint.Zero);
            return new FPVector2(X / mag, Y / mag);
        }
    }

    public static FixedPoint Distance(FPVector2 a, FPVector2 b) => (a - b).Magnitude;
    public static readonly FPVector2 Zero = new(FixedPoint.Zero, FixedPoint.Zero);
}
```

### 5. Desync Detection

```csharp
/// <summary>
/// Checksum calculator for desync detection.
/// Each client computes a checksum of game state every N frames.
/// If checksums differ, a desync has occurred.
/// </summary>
public static class SyncChecker
{
    /// <summary>
    /// Compute checksum of all simulation state.
    /// Call this on every client and compare results.
    /// </summary>
    public static uint ComputeChecksum(List<ISimulationSystem> systems)
    {
        uint hash = 0;
        foreach (var system in systems)
        {
            var state = system.SaveState();
            hash = CRC32(state, hash);
        }
        return hash;
    }

    private static uint CRC32(byte[] data, uint seed)
    {
        uint crc = seed ^ 0xFFFFFFFF;
        for (int i = 0; i < data.Length; i++)
        {
            crc ^= data[i];
            for (int j = 0; j < 8; j++)
                crc = (crc >> 1) ^ (0xEDB88320 & ~((crc & 1) - 1));
        }
        return crc ^ 0xFFFFFFFF;
    }
}
```

---

## Determinism Checklist

**Your simulation MUST follow these rules:**

- ✅ Use `FixedPoint` instead of `float`/`double` for all game logic
- ✅ Use `FPVector2`/`FPVector3` instead of `Vector2`/`Vector3` in simulation
- ✅ Process inputs in the same order on all clients (sort by player ID)
- ✅ Update systems in the same order on all clients
- ✅ Use seeded random (`System.Random` with shared seed, NOT `UnityEngine.Random`)
- ✅ Use fixed timestep (not `Time.deltaTime`)
- ❌ Never use `UnityEngine.Physics` in simulation (non-deterministic)
- ❌ Never use `float` in simulation logic
- ❌ Never use `UnityEngine.Random` in simulation
- ❌ Never use `Dictionary` iteration order in simulation (use `SortedDictionary` or sorted lists)
- ❌ Never use `async/await` in simulation
- ❌ Never use `DateTime.Now` in simulation

---

## Input Delay vs Rollback

### Input Delay (simpler)
```
Frame 10: Collect input → Send to server
Frame 12: Receive confirmed inputs → Simulate frame 10
```
- 2-frame delay = ~33ms at 60fps
- Simple to implement
- Feels slightly laggy

### Rollback (complex, better feel)
```
Frame 10: Collect input → Predict locally → Send to server
Frame 12: Receive confirmed inputs for frame 10
           If prediction was wrong → Rollback to frame 10 → Re-simulate 10,11,12
```
- Zero perceived delay
- Complex to implement (need state save/load)
- See [rollback-netcode.md](rollback-netcode.md) for full implementation
