# unity-audio

Set up audio systems with pooled sources, mixer control, spatial audio, and middleware integration.

## When to use

Activate when the user mentions:
- Audio system architecture, AudioManager
- Sound effects (SFX) pooling, one-shot audio
- Background music (BGM), crossfade, playlists
- AudioMixer, volume control, snapshots
- Spatial/3D audio, occlusion, reverb zones
- FMOD or Wwise integration
- Audio optimization, compression formats
- Adaptive/dynamic music systems

## Capabilities

1. **Audio architecture** — Centralized AudioManager with pooled sources
2. **BGM system** — Crossfade, playlists, adaptive music layers
3. **SFX system** — Pooled one-shots, spatial audio, priority system
4. **Mixer control** — Volume, snapshots, effects (lowpass, reverb)
5. **Middleware** — FMOD/Wwise integration patterns
6. **Optimization** — Compression formats, memory budgets, streaming

## Architecture Decision Guide

| Need | Solution |
|------|----------|
| Simple game, < 50 sounds | Unity AudioManager + AudioMixer |
| Complex game, 100+ sounds | FMOD Studio (free for indie) |
| AAA production | Wwise |
| Adaptive music | FMOD adaptive tracks or custom layer system |
| Voice/dialogue | Middleware or custom queue system |

## Unity version support

| Version | Status |
|---------|--------|
| Unity 6+ | ✅ Full |
| 2022.3 LTS | ✅ Full |
| 2021.3 LTS | ✅ Supported |

## References

- [audio-system.md](references/audio-system.md) — AudioManager, crossfade BGM, SFX pooling, AudioMixer setup
- [adaptive-audio.md](references/adaptive-audio.md) — Dynamic music layers, combat intensity, ambient systems
- [audio-optimization.md](references/audio-optimization.md) — Compression formats, memory budgets, streaming, platform limits

## Limitations

- Unity's built-in audio lacks advanced features (occlusion, convolution reverb) — use middleware for those
- WebGL audio has restrictions (user interaction required to start)
- Mobile: simultaneous voice count affects performance significantly
