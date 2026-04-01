# Audio Optimization

## Compression Format Selection

| Format | Quality | Size | CPU Decode | Best For |
|--------|---------|------|-----------|----------|
| PCM (uncompressed) | Perfect | Huge | None | Short UI clicks (< 1s) |
| ADPCM | Good | ~3.5x smaller | Low | Short SFX (< 5s) |
| Vorbis | Great | ~10x smaller | Medium | BGM, long audio |
| MP3 | Good | ~10x smaller | Medium | Streaming BGM (legacy) |
| AAC | Great | ~10x smaller | Low (HW) | iOS preferred |

### Recommended Settings by Type

| Audio Type | Load Type | Compression | Sample Rate | Channels |
|-----------|-----------|-------------|-------------|----------|
| UI clicks | Decompress on Load | ADPCM | 22050 | Mono |
| SFX (short) | Decompress on Load | ADPCM | 44100 | Mono |
| SFX (long) | Compressed in Memory | Vorbis 70% | 44100 | Mono |
| BGM | Streaming | Vorbis 50% | 44100 | Stereo |
| Voice/Dialogue | Streaming | Vorbis 70% | 22050 | Mono |
| Ambient loops | Compressed in Memory | Vorbis 50% | 44100 | Stereo |

## Load Type Explained

| Load Type | Memory | CPU | When |
|-----------|--------|-----|------|
| Decompress on Load | High (full PCM in RAM) | None at play | Frequent short sounds |
| Compressed in Memory | Low (compressed in RAM) | Decode on play | Infrequent or long sounds |
| Streaming | Minimal (buffer only) | Disk I/O + decode | BGM, dialogue, very long clips |

## Memory Budget

| Platform | Audio Memory Budget | Max Simultaneous Voices |
|----------|-------------------|------------------------|
| Mobile (low) | 20-30 MB | 16-24 |
| Mobile (mid) | 40-60 MB | 32 |
| PC | 100-200 MB | 64+ |
| Console | 80-150 MB | 64 |

### Quick Calculation

```
Mono 44100Hz PCM: ~86 KB/sec
Stereo 44100Hz PCM: ~172 KB/sec
Vorbis 50%: ~12 KB/sec (mono)

Example: 3-minute BGM stereo Vorbis 50%
= 180s × 24 KB/s ≈ 4.3 MB (compressed in memory)
= 180s × 172 KB/s ≈ 30 MB (decompressed)
```

## Voice Count Optimization

Every playing AudioSource costs CPU. On mobile, this matters.

```csharp
// Priority system: low-priority sounds get culled first
public enum AudioPriority
{
    Critical = 0,   // Player damage, UI confirm
    High = 64,      // Weapon fire, explosions
    Medium = 128,   // Footsteps, ambient
    Low = 200,      // Distant effects
    Lowest = 255,   // Background detail
}

// Set on AudioSource
source.priority = (int)AudioPriority.High;
```

Unity culls lowest-priority sources when voice limit is reached. Set `AudioSettings.GetConfiguration().numRealVoices` appropriately.

## Platform-Specific Notes

### Mobile
- **Force Mono** for all SFX — halves memory, players use phone speakers anyway
- **Lower sample rate** (22050) for non-music audio
- **Limit simultaneous voices** to 24-32
- **Avoid Streaming** on many clips simultaneously — disk I/O bottleneck

### WebGL
- Audio won't play until user interaction (browser policy)
- No streaming — all audio must be loaded
- Use smaller files, fewer simultaneous sources

### Console
- Platform-specific hardware decoders (Atrac on PS, XMA on Xbox)
- Unity handles this automatically with platform override settings
- Budget more voices (64+) — hardware can handle it

## Common Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| All clips Decompress on Load | Memory explosion | Use Compressed in Memory for long clips |
| Stereo SFX | 2x memory waste | Force Mono for all SFX |
| No AudioSource pooling | GC spikes from Instantiate/Destroy | Pool AudioSources |
| BGM not streaming | 30MB+ in memory per track | Set Load Type to Streaming |
| Max distance too high on 3D sounds | Unnecessary voice usage | Set realistic max distance (20-50m) |
