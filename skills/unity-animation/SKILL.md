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
