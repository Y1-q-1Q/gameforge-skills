# Timeline & Playable API

## Timeline Workflow

### When to Use Timeline vs Code

| Scenario | Timeline | Code (DOTween/Coroutine) |
|----------|----------|--------------------------|
| Cutscenes | ✅ Visual authoring | Tedious |
| Boss intros | ✅ Precise timing | OK |
| UI sequences | Overkill | ✅ Simpler |
| Procedural events | ❌ | ✅ Dynamic |
| Dialogue + camera | ✅ Multi-track | Complex |

### Timeline Track Types

| Track | Controls | Use Case |
|-------|----------|----------|
| Animation | Animator clips | Character animation in cutscene |
| Activation | GameObject on/off | Show/hide objects at specific times |
| Audio | AudioSource | Music, SFX timing |
| Cinemachine | Virtual cameras | Camera cuts and blends |
| Signal | Fire events | Trigger game logic at specific frame |
| Control | Sub-timelines, prefabs | Spawn/control child objects |

### Signal Emitter Pattern (Timeline → Game Logic)

```csharp
// 1. Create SignalAsset: Assets → Create → Signal
// 2. Add Signal Emitter to Timeline at desired frame
// 3. Create receiver:

public class CutsceneSignalReceiver : MonoBehaviour, INotificationReceiver
{
    public void OnNotify(Playable origin, INotification notification, object context)
    {
        // React to signal — spawn enemy, play VFX, etc.
        if (notification is SignalEmitter signal)
        {
            Debug.Log($"Signal received: {signal.asset.name}");
        }
    }
}
```

## Playable API (Advanced)

For when you need full control over animation blending at runtime.

```csharp
using UnityEngine.Animations;
using UnityEngine.Playables;

public class CustomAnimationMixer : MonoBehaviour
{
    PlayableGraph _graph;
    AnimationMixerPlayable _mixer;

    void Start()
    {
        _graph = PlayableGraph.Create("CustomMixer");
        var output = AnimationPlayableOutput.Create(_graph, "output", GetComponent<Animator>());

        _mixer = AnimationMixerPlayable.Create(_graph, 2);
        output.SetSourcePlayable(_mixer);

        var idleClip = AnimationClipPlayable.Create(_graph, idleAnimation);
        var runClip = AnimationClipPlayable.Create(_graph, runAnimation);

        _graph.Connect(idleClip, 0, _mixer, 0);
        _graph.Connect(runClip, 0, _mixer, 1);

        _graph.Play();
    }

    void Update()
    {
        float speed = GetComponent<Rigidbody>().linearVelocity.magnitude;
        float blend = Mathf.Clamp01(speed / maxSpeed);
        _mixer.SetInputWeight(0, 1f - blend);
        _mixer.SetInputWeight(1, blend);
    }

    void OnDestroy() => _graph.Destroy();
}
```

### When to Use Playable API

- Custom animation blending logic that Animator can't express
- Runtime-generated animation graphs
- Mixing animation with other playable types (audio, custom)
- Performance-critical scenarios (skip Animator overhead)
