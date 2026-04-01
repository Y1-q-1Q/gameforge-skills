# Nanite & Lumen Material Best Practices

## Nanite-Compatible Materials

### Requirements

| Feature | Nanite Support |
|---------|---------------|
| Opaque materials | ✅ |
| Masked materials | ✅ (UE 5.4+, with cost) |
| Translucent | ❌ Not supported |
| World Position Offset | ❌ Not supported |
| Tessellation | ❌ Replaced by Nanite |
| Two-sided | ✅ |
| Custom depth | ✅ |

### Optimization for Nanite

```
DO:
  ✅ Use opaque materials whenever possible
  ✅ Pack textures (ORM) to reduce samples
  ✅ Use Material Instances (shared shader)
  ✅ Keep material complexity low (Nanite already handles geometry)

DON'T:
  ❌ Use World Position Offset (breaks Nanite clustering)
  ❌ Use pixel depth offset
  ❌ Use excessive texture samples (>8 per material)
  ❌ Use translucency on Nanite meshes
```

### Masked Materials on Nanite

```
UE 5.4+: Nanite supports masked materials but with performance cost.

For foliage on Nanite:
  - Use Opacity Mask with clean alpha
  - Set Dithered LOD Transition = true
  - Keep mask threshold at 0.33 (default)
  - Consider using geometry instead of alpha cutout for close-up foliage
```

## Lumen Material Setup

### Emissive for Lumen GI

```
Emissive materials contribute to Lumen global illumination:

  Emissive Color = BaseColor * EmissiveStrength

  EmissiveStrength guidelines:
    - Subtle glow: 1-5
    - Light source (lamp): 10-50
    - Bright neon: 50-200
    - Sun-like: 1000+

  Note: Lumen uses screen-space + hardware ray tracing.
  Emissive surfaces MUST be visible to camera to contribute GI.
  For off-screen emissive, use actual light actors instead.
```

### Lumen Reflections

```
For best Lumen reflections:
  - Keep Roughness accurate (Lumen traces based on roughness)
  - Metallic surfaces get mirror-like reflections at Roughness < 0.1
  - Use Reflection Capture actors as fallback for off-screen reflections
  - Avoid very thin geometry (Lumen traces may miss it)
```

## Virtual Shadow Maps

```
Nanite + Virtual Shadow Maps = automatic high-quality shadows

Material considerations:
  - Masked materials are more expensive for VSM (each pixel needs evaluation)
  - Opaque materials are cheapest
  - Two-sided materials double shadow cost
  - Keep opacity mask simple for shadow pass
```

## Performance Budget

| Material Feature | GPU Cost | Nanite Compatible |
|-----------------|----------|-------------------|
| Base PBR (4 textures) | Low | ✅ |
| + Detail texture | Low-Medium | ✅ |
| + Parallax occlusion | Medium | ❌ (use Nanite geometry) |
| + Subsurface scattering | Medium | ✅ |
| + Translucency | High | ❌ |
| + Refraction | High | ❌ |
