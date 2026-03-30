# Rollback Netcode

## Overview

Rollback netcode provides zero-latency feel by predicting the future locally, then correcting when the real inputs arrive. Used in fighting games (GGPO) and increasingly in other competitive genres.

## Core Loop

```
1. Collect local input for frame N
2. Predict remote player input (usually: repeat last known input)
3. Simulate frame N with local + predicted inputs
4. Send local input to remote
5. When remote input for frame N arrives:
   a. If prediction was correct → do nothing
   b. If prediction was wrong → rollback to frame N, re-simulate N..current
```

## Implementation

```csharp
/// <summary>
/// Rollback manager. Saves state snapshots and re-simulates on misprediction.
/// </summary>
public class RollbackManager
{
    private readonly Dictionary<int, byte[]> _snapshots = new();
    private readonly Dictionary<int, FrameInput[]> _confirmedInputs = new();
    private readonly Dictionary<int, FrameInput[]> _predictedInputs = new();
    private readonly List<ISimulationSystem> _systems;
    private readonly int _maxRollbackFrames;

    public int CurrentFrame { get; private set; }

    public RollbackManager(List<ISimulationSystem> systems, int maxRollbackFrames = 8)
    {
        _systems = systems;
        _maxRollbackFrames = maxRollbackFrames;
    }

    /// <summary>
    /// Save snapshot before simulating a frame.
    /// </summary>
    public void SaveSnapshot(int frame)
    {
        using var ms = new MemoryStream();
        using var writer = new BinaryWriter(ms);
        foreach (var system in _systems)
        {
            var state = system.SaveState();
            writer.Write(state.Length);
            writer.Write(state);
        }
        _snapshots[frame] = ms.ToArray();

        // Prune old snapshots
        if (_snapshots.ContainsKey(frame - _maxRollbackFrames - 1))
            _snapshots.Remove(frame - _maxRollbackFrames - 1);
    }

    /// <summary>
    /// Called when confirmed remote input arrives.
    /// If it differs from prediction, rollback and re-simulate.
    /// </summary>
    public void OnConfirmedInput(int frame, int playerId, FrameInput input)
    {
        if (!_confirmedInputs.ContainsKey(frame))
            _confirmedInputs[frame] = new FrameInput[2]; // assuming 2 players

        _confirmedInputs[frame][playerId] = input;

        // Check if prediction was wrong
        if (_predictedInputs.ContainsKey(frame))
        {
            var predicted = _predictedInputs[frame][playerId];
            if (!InputsEqual(predicted, input))
            {
                Rollback(frame);
            }
        }
    }

    private void Rollback(int toFrame)
    {
        if (!_snapshots.ContainsKey(toFrame)) return;

        // Restore state
        LoadSnapshot(toFrame);

        // Re-simulate from toFrame to CurrentFrame
        for (int f = toFrame; f < CurrentFrame; f++)
        {
            var inputs = _confirmedInputs.ContainsKey(f)
                ? _confirmedInputs[f]
                : _predictedInputs[f];

            foreach (var system in _systems)
                system.Simulate(f, inputs, LockstepManager.FIXED_DELTA);
        }
    }

    private void LoadSnapshot(int frame)
    {
        var data = _snapshots[frame];
        using var ms = new MemoryStream(data);
        using var reader = new BinaryReader(ms);
        foreach (var system in _systems)
        {
            int len = reader.ReadInt32();
            var state = reader.ReadBytes(len);
            system.LoadState(state);
        }
    }

    private static bool InputsEqual(FrameInput a, FrameInput b)
    {
        return a.MoveX == b.MoveX && a.MoveY == b.MoveY && a.ActionFlags == b.ActionFlags;
    }
}
```

## Input Prediction Strategies

| Strategy | Description | Best For |
|----------|-------------|----------|
| Repeat last | Use the last confirmed input | Movement-heavy games |
| Neutral | Assume no input | Fighting games |
| Weighted | Blend recent inputs | Smooth movement |

## Rollback Limits

- **Max rollback frames:** 8 (at 60fps = 133ms)
- Beyond this, the game freezes (too much desync)
- If network latency > 133ms, consider input delay instead

## Visual Smoothing

After rollback, entities may "teleport." Smooth this visually:

```csharp
// After rollback re-simulation, blend visual position
Vector3 visualPos = Vector3.Lerp(previousVisualPos, simulationPos, 0.5f);
```
