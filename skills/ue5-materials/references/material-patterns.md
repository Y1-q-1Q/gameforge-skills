# Material Patterns

## Standard PBR Material Setup

```
Material Inputs:
  Base Color    ← Texture or color (sRGB)
  Metallic      ← 0 (dielectric) or 1 (metal), rarely in between
  Roughness     ← 0 (mirror) to 1 (matte)
  Normal        ← Normal map (tangent space)
  Emissive      ← Self-illumination (for Lumen)
```

### Texture Packing (ORM)

Pack Occlusion/Roughness/Metallic into one texture:
```
R = Ambient Occlusion
G = Roughness
B = Metallic
```
This saves texture samples and memory. Standard in UE5 projects.

## Layered Material (Landscape)

```
Material Function: MF_TerrainLayer
  Inputs: BaseColor, Normal, Roughness, Height
  Output: MaterialAttributes

Master Material:
  Layer 1: Grass (MF_TerrainLayer)
  Layer 2: Dirt (MF_TerrainLayer)
  Layer 3: Rock (MF_TerrainLayer)
  Layer 4: Snow (MF_TerrainLayer)

  Blend: Height-based lerp between layers
    → Avoids flat blending, creates natural transitions
```

### Height-Based Blending

```
// Custom expression for height blend
float HeightBlend(float H1, float H2, float Alpha, float Contrast)
{
    float MA = max(H1 + (1 - Alpha), H2 + Alpha) - Contrast;
    float B1 = max(H1 + (1 - Alpha) - MA, 0);
    float B2 = max(H2 + Alpha - MA, 0);
    return B2 / (B1 + B2);
}
```

## Material Functions (Reusable)

```
MF_DetailTexture:
  Input: UV, DetailTexture, DetailScale, DetailStrength
  Output: Modified BaseColor
  → Adds micro-detail at close range, fades at distance

MF_Wetness:
  Input: BaseColor, Roughness, WetnessMask, WetnessAmount
  Output: Modified BaseColor (darker), Modified Roughness (smoother)
  → Simulates wet surfaces

MF_WindAnimation:
  Input: WorldPosition, Time, WindStrength, WindDirection
  Output: WorldPositionOffset
  → Vertex animation for foliage
```

## Material Instances

```
Parent Material: M_Master_Opaque
  Parameters:
    - BaseColor (Texture2D)
    - NormalMap (Texture2D)
    - ORM (Texture2D)
    - Tint (LinearColor)
    - RoughnessMultiplier (Scalar, default 1.0)
    - UVScale (Scalar, default 1.0)

Material Instances (no shader recompile):
  MI_Brick_Red    → BaseColor=T_Brick_Red, Tint=warm
  MI_Brick_Gray   → BaseColor=T_Brick_Gray, Tint=cool
  MI_Concrete     → BaseColor=T_Concrete, RoughnessMultiplier=1.2
```

**Rule**: Always use Material Instances for variations. Never duplicate the parent material.

## Common Material Types

| Type | Blend Mode | Shading Model | Use Case |
|------|-----------|---------------|----------|
| Opaque | Opaque | Default Lit | Most surfaces |
| Masked | Masked | Default Lit | Foliage, fences |
| Translucent | Translucent | Default Lit | Glass, water |
| Unlit | Opaque | Unlit | UI, hologram |
| Subsurface | Opaque | Subsurface | Skin, wax, leaves |
| Two-sided foliage | Masked | Two Sided Foliage | Tree leaves |
