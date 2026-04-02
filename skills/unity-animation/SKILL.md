---
name: unity-animation
version: 2.0.0
description: "Configure Animator controllers, state machines, blend trees, Timeline, procedural animation, and tweening libraries"
engine: unity
category: animation
license: Apache-2.0

interface:
  input:
    required:
      - animation_requirements        # what animation system is needed
    optional:
      - animation_type                # 2d, 3d, ui
      - complexity_level              # simple, moderate, complex
      - procedural_needed             # true/false for IK/procedural

  output:
    - type: code                      # Animator controllers, scripts
    - type: configuration             # Animator assets, Timeline assets
    - type: architecture              # Animation system design

  context_blocks:
    - id: animator-patterns
      description: "Design Animator controllers and state machines"
      references: [animator-patterns.md]
    - id: timeline-playable
      description: "Create Timeline sequences and Playable API integration"
      references: [timeline-playable.md]
    - id: procedural-animation
      description: "Implement IK and procedural animation"
      references: [procedural-animation.md]

references:
  - file: references/animator-patterns.md
    relevance: [animator, state-machine, blend-tree, animation-event, dotween]
    size: 3KB
    priority: high
  - file: references/timeline-playable.md
    relevance: [timeline, playable, cutscene, sequence, custom-track]
    size: 3KB
    priority: medium
  - file: references/procedural-animation.md
    relevance: [procedural, ik, animation-rigging, look-at, walk-cycle]
    size: 4KB
    priority: medium

triggers:
  keywords:
    - "animation"
    - "animator"
    - "state machine"
    - "blend tree"
    - "timeline"
    - "playable"
    - "dotween"
    - "tween"
    - "ik"
    - "procedural animation"
    - "root motion"
    - "animation event"
  files:
    - "Assets/Animations/**/*.controller"
    - "Assets/Animations/**/*.anim"
    - "Assets/Timeline/**/*.playable"
    - "**/Animator*.cs"
  context:
    - has_unity_project: true

composition:
  combines_with:
    - unity-performance          # animation optimization
    - unity-ecs                  # ECS animation (GPU skinning)
    - unity-ui                   # UI animations
  depends_on: []
  conflicts_with: []
  provides:
    - animation-system
    - state-machine
    - tweening-patterns

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android, webgl]
  render_pipelines: [built-in, urp, hdrp]
---

# unity-animation

Configure Animator controllers, state machines, blend trees, Timeline, procedural animation, and tweening libraries for Unity games.

## When to use

Activate when the user mentions:
- Animator controller design, state machines
- Blend trees (1D, 2D, direct)
- Animation layers, avatar masks
- Timeline, Playable API
- DOTween, LeanTween, tweening
- Procedural animation, IK
- Animation events, root motion
- Sprite animation (2D)
- Animation performance optimization

## Capabilities

1. **Animator architecture** — State machine design, sub-state machines, parameter strategy
2. **Blend trees** — Locomotion blending, directional movement, aim offsets
3. **Animation layers** — Upper/lower body split, additive layers, avatar masks
4. **Timeline** — Cutscenes, sequencing, custom tracks
5. **Procedural animation** — IK, look-at, procedural walk cycles
6. **Tweening** — DOTween patterns, UI animation, juice effects
7. **2D animation** — Sprite sheets, skeletal (2D Animation package), frame-by-frame

## Architecture Decision Guide

| Need | Solution |
|------|----------|
| Character locomotion | Animator + Blend Tree (2D Freeform) |
| Combat combos | Sub-state machine + AnimatorOverrideController |
| Cutscenes | Timeline + Cinemachine |
| UI transitions | DOTween or USS transitions |
| Procedural movement | Playable API or Animation Rigging |
| Thousands of animated entities | GPU instancing + custom animation |

## Unity version support

| Version | Status |
|---------|--------|
| Unity 6+ | ✅ Full (Animation Rigging 2.0) |
| 2022.3 LTS | ✅ Full |
| 2021.3 LTS | ✅ Supported |

## References

- [animator-patterns.md](references/animator-patterns.md) — Animator architecture, blend trees, animation events, DOTween
- [timeline-playable.md](references/timeline-playable.md) — Timeline workflow, custom tracks, Playable API
- [procedural-animation.md](references/procedural-animation.md) — IK, Animation Rigging, procedural locomotion

## Limitations

- Animator controllers can become unwieldy for complex characters (consider Animancer for code-driven approach)
- Root motion requires careful setup to avoid sliding
- Timeline is powerful but heavy for simple sequences (use DOTween for UI/juice)
