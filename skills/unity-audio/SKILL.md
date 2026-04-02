---
name: unity-audio
version: 2.0.0
description: "Set up audio systems with pooled sources, mixer control, spatial audio, and middleware integration"
engine: unity
category: audio
license: Apache-2.0

interface:
  input:
    required:
      - audio_requirements            # what audio features are needed
    optional:
      - audio_middleware              # fmod, wwise, or unity
      - target_platform               # mobile, pc, console
      - sound_count                   # expected number of simultaneous sounds

  output:
    - type: code                      # AudioManager, pooling systems
    - type: configuration             # AudioMixer, snapshots
    - type: architecture              # audio system design

  context_blocks:
    - id: audio-system
      description: "Build core audio system with pooling and mixer control"
      references: [audio-system.md]
    - id: adaptive-audio
      description: "Implement dynamic music and ambient systems"
      references: [adaptive-audio.md]
    - id: audio-optimization
      description: "Optimize audio for platform constraints"
      references: [audio-optimization.md]

references:
  - file: references/audio-system.md
    relevance: [audio, manager, pooling, crossfade, mixer, sfx, bgm]
    size: 3KB
    priority: high
  - file: references/adaptive-audio.md
    relevance: [adaptive, dynamic, music, combat, intensity, ambient]
    size: 5KB
    priority: medium
  - file: references/audio-optimization.md
    relevance: [optimization, compression, memory, streaming, platform]
    size: 4KB
    priority: medium

triggers:
  keywords:
    - "audio"
    - "sound"
    - "sfx"
    - "bgm"
    - "music"
    - "audiomixer"
    - "spatial audio"
    - "fmod"
    - "wwise"
    - "audio pooling"
    - "crossfade"
    - "reverb"
  files:
    - "**/AudioManager*.cs"
    - "Assets/Audio/**/*.mixer"
    - "**/*Audio*.cs"
  context:
    - has_unity_project: true

composition:
  combines_with:
    - unity-performance          # audio optimization
    - unity-addressables         # streaming audio assets
  depends_on: []
  conflicts_with: []
  provides:
    - audio-system
    - sound-pooling
    - mixer-control

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android, webgl]
  render_pipelines: [built-in, urp, hdrp]
---

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
