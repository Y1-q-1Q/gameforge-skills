# Audio System Architecture

## Audio Manager

```csharp
/// <summary>
/// Centralized audio manager with pooled AudioSources, mixer control, and spatial audio.
/// </summary>
public class AudioManager : MonoBehaviour
{
    private static AudioManager _instance;
    public static AudioManager Instance => _instance;

    [SerializeField] private AudioMixer _masterMixer;
    [SerializeField] private int _sfxPoolSize = 16;

    private readonly Queue<AudioSource> _sfxPool = new();
    private AudioSource _bgmSource;
    private AudioSource _bgmCrossfadeSource;

    private void Awake()
    {
        _instance = this;
        DontDestroyOnLoad(gameObject);

        // BGM sources
        _bgmSource = CreateSource("BGM", true);
        _bgmCrossfadeSource = CreateSource("BGM_Crossfade", true);

        // SFX pool
        for (int i = 0; i < _sfxPoolSize; i++)
            _sfxPool.Enqueue(CreateSource($"SFX_{i}", false));
    }

    public void PlayBGM(AudioClip clip, float fadeDuration = 1f)
    {
        StartCoroutine(CrossfadeBGM(clip, fadeDuration));
    }

    public void PlaySFX(AudioClip clip, Vector3? position = null, float volume = 1f)
    {
        if (_sfxPool.Count == 0) return;

        var source = _sfxPool.Dequeue();
        source.clip = clip;
        source.volume = volume;
        source.spatialBlend = position.HasValue ? 1f : 0f;
        if (position.HasValue)
            source.transform.position = position.Value;
        source.Play();
        StartCoroutine(ReturnToPool(source, clip.length));
    }

    public void SetVolume(string param, float normalized)
    {
        // Convert 0-1 to decibels (-80 to 0)
        float db = normalized > 0.001f ? Mathf.Log10(normalized) * 20f : -80f;
        _masterMixer.SetFloat(param, db);
    }

    private IEnumerator CrossfadeBGM(AudioClip newClip, float duration)
    {
        _bgmCrossfadeSource.clip = newClip;
        _bgmCrossfadeSource.volume = 0;
        _bgmCrossfadeSource.Play();

        float t = 0;
        while (t < duration)
        {
            t += Time.unscaledDeltaTime;
            float progress = t / duration;
            _bgmSource.volume = 1 - progress;
            _bgmCrossfadeSource.volume = progress;
            yield return null;
        }

        _bgmSource.Stop();
        (_bgmSource, _bgmCrossfadeSource) = (_bgmCrossfadeSource, _bgmSource);
    }

    private IEnumerator ReturnToPool(AudioSource source, float delay)
    {
        yield return new WaitForSeconds(delay + 0.1f);
        source.Stop();
        _sfxPool.Enqueue(source);
    }

    private AudioSource CreateSource(string name, bool loop)
    {
        var go = new GameObject(name);
        go.transform.SetParent(transform);
        var source = go.AddComponent<AudioSource>();
        source.loop = loop;
        source.playOnAwake = false;
        return source;
    }
}
```

## AudioMixer Setup

```
Master (exposed: "MasterVolume")
├── BGM (exposed: "BGMVolume")
│   └── Lowpass filter (for underwater/pause effects)
├── SFX (exposed: "SFXVolume")
│   ├── UI
│   └── Gameplay
└── Voice (exposed: "VoiceVolume")
```

## Spatial Audio Quick Reference

| Setting | 2D Sound | 3D Sound |
|---------|----------|----------|
| Spatial Blend | 0 | 1 |
| Min Distance | N/A | 1-5m |
| Max Distance | N/A | 20-50m |
| Rolloff | N/A | Logarithmic |
| Use Case | BGM, UI clicks | Footsteps, explosions, voices |
