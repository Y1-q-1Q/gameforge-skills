# Adaptive Audio & Dynamic Music

## Layer-Based Adaptive Music

The most common pattern for game music that reacts to gameplay:

```
Layer 0: Base melody (always playing)
Layer 1: Percussion (combat)
Layer 2: Strings (tension)
Layer 3: Choir (boss fight)
```

```csharp
public class AdaptiveMusicSystem : MonoBehaviour
{
    [System.Serializable]
    public struct MusicLayer
    {
        public AudioClip clip;
        public string name;
        [HideInInspector] public AudioSource source;
    }

    [SerializeField] MusicLayer[] _layers;
    [SerializeField] float _fadeSpeed = 2f;
    float[] _targetVolumes;

    void Start()
    {
        _targetVolumes = new float[_layers.Length];
        for (int i = 0; i < _layers.Length; i++)
        {
            _layers[i].source = gameObject.AddComponent<AudioSource>();
            _layers[i].source.clip = _layers[i].clip;
            _layers[i].source.loop = true;
            _layers[i].source.volume = i == 0 ? 1f : 0f;
            _layers[i].source.Play();
            _targetVolumes[i] = i == 0 ? 1f : 0f;
        }
    }

    /// <summary>Set intensity 0-1. Maps to layer activation thresholds.</summary>
    public void SetIntensity(float intensity)
    {
        // Layer 0: always on
        _targetVolumes[0] = 1f;
        // Layer 1: combat (> 0.3)
        if (_layers.Length > 1) _targetVolumes[1] = intensity > 0.3f ? intensity : 0f;
        // Layer 2: tension (> 0.6)
        if (_layers.Length > 2) _targetVolumes[2] = intensity > 0.6f ? (intensity - 0.6f) * 2.5f : 0f;
        // Layer 3: boss (> 0.9)
        if (_layers.Length > 3) _targetVolumes[3] = intensity > 0.9f ? 1f : 0f;
    }

    void Update()
    {
        for (int i = 0; i < _layers.Length; i++)
            _layers[i].source.volume = Mathf.MoveTowards(
                _layers[i].source.volume, _targetVolumes[i], _fadeSpeed * Time.unscaledDeltaTime);
    }
}
```

## Combat Intensity Tracker

```csharp
public class CombatIntensityTracker : MonoBehaviour
{
    [SerializeField] AdaptiveMusicSystem _music;
    float _intensity;

    // Call these from game events
    public void OnEnemySpotted() => _intensity = Mathf.Max(_intensity, 0.4f);
    public void OnCombatStart() => _intensity = 0.7f;
    public void OnBossEncounter() => _intensity = 1f;
    public void OnCombatEnd() => _intensity = 0f;

    void Update()
    {
        // Natural decay when nothing happens
        _intensity = Mathf.MoveTowards(_intensity, 0f, 0.05f * Time.deltaTime);
        _music.SetIntensity(_intensity);
    }
}
```

## Ambient Sound System

```csharp
public class AmbientZone : MonoBehaviour
{
    [SerializeField] AudioClip[] _ambientLoops;
    [SerializeField] AudioClip[] _oneShots; // Random bird chirps, wind gusts, etc.
    [SerializeField] float _oneShotMinInterval = 5f;
    [SerializeField] float _oneShotMaxInterval = 15f;

    AudioSource _loopSource;
    float _nextOneShot;

    void OnTriggerEnter(Collider other)
    {
        if (!other.CompareTag("Player")) return;
        if (!_loopSource)
        {
            _loopSource = gameObject.AddComponent<AudioSource>();
            _loopSource.loop = true;
            _loopSource.spatialBlend = 0f;
        }
        _loopSource.clip = _ambientLoops[Random.Range(0, _ambientLoops.Length)];
        _loopSource.Play();
        _nextOneShot = Time.time + Random.Range(_oneShotMinInterval, _oneShotMaxInterval);
    }

    void Update()
    {
        if (_oneShots.Length == 0 || Time.time < _nextOneShot) return;
        AudioSource.PlayClipAtPoint(
            _oneShots[Random.Range(0, _oneShots.Length)],
            transform.position + Random.insideUnitSphere * 10f);
        _nextOneShot = Time.time + Random.Range(_oneShotMinInterval, _oneShotMaxInterval);
    }

    void OnTriggerExit(Collider other)
    {
        if (other.CompareTag("Player") && _loopSource)
            _loopSource.Stop();
    }
}
```

## AudioMixer Snapshot Transitions

```csharp
// Snapshots for game states
public class AudioStateManager : MonoBehaviour
{
    [SerializeField] AudioMixerSnapshot _normalSnapshot;
    [SerializeField] AudioMixerSnapshot _pauseSnapshot;   // Lowpass on SFX, BGM quiet
    [SerializeField] AudioMixerSnapshot _underwaterSnapshot; // Heavy lowpass on everything
    [SerializeField] AudioMixerSnapshot _combatSnapshot;   // Boost SFX, compress BGM

    public void EnterPause() => _pauseSnapshot.TransitionTo(0.3f);
    public void ExitPause() => _normalSnapshot.TransitionTo(0.3f);
    public void EnterUnderwater() => _underwaterSnapshot.TransitionTo(1f);
    public void EnterCombat() => _combatSnapshot.TransitionTo(0.5f);
}
```
