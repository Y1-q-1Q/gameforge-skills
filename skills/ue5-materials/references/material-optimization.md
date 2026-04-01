# Material Optimization

## Shader Complexity

### Measuring

```
Viewport → Optimization Viewmodes → Shader Complexity
  Green = cheap
  Red = expensive
  White = very expensive (overdraw + complex shader)

Target: Keep most surfaces green/yellow.
```

### Reducing Complexity

| Technique | Savings | How |
|-----------|---------|-----|
| Texture packing (ORM) | 2 fewer samples | Pack AO/Roughness/Metallic into RGB |
| Material Instances | Shared compilation | One parent, many instances |
| Remove unused inputs | Varies | Disconnect unused material inputs |
| Simplify math | Varies | Use LUT textures instead of complex math |
| Reduce texture samples | ~10% per sample | Combine channels, use vertex color |
| Static switches | Compile-time | Branch at compile, not runtime |

### Static Switch Parameters

```
Parent material with static switches:
  [StaticSwitch] UseDetailTexture = false
  [StaticSwitch] UseEmissive = false
  [StaticSwitch] UseWindAnimation = false

Material Instance:
  MI_Tree_Leaves: UseWindAnimation = true, UseDetailTexture = false
  MI_Brick_Wall: UseDetailTexture = true, UseWindAnimation = false

Each combination compiles a separate shader permutation.
Only the needed features are included — no runtime branching cost.
```

## LOD Materials

```
LOD 0 (close): Full material (normal map, detail texture, parallax)
LOD 1 (medium): Simplified (no detail texture, no parallax)
LOD 2 (far): Minimal (base color + roughness only)
LOD 3 (very far): Flat color (no textures, vertex color only)

Set per-LOD material in Static Mesh Editor → LOD Settings → Material Slots
```

## Material Instance Dynamic (MID)

```cpp
// For runtime parameter changes (health bar color, damage flash)
UMaterialInstanceDynamic* MID = UMaterialInstanceDynamic::Create(BaseMaterial, this);
MeshComponent->SetMaterial(0, MID);

// Change parameters at runtime
MID->SetScalarParameterValue("DamageFlash", 1.0f);
MID->SetVectorParameterValue("TintColor", FLinearColor::Red);

// IMPORTANT: Create MID once, reuse. Don't create every frame.
```

## Texture Streaming

```
Texture streaming settings per-material:
  - Streaming Priority: Normal (default), Higher (important surfaces)
  - Max texture size: Set per-platform in texture asset

For mobile/low-end:
  - Max texture size: 1024 (most), 2048 (hero assets)
  - Use texture compression: BC7 (PC), ASTC (mobile)
  - Reduce unique textures: use tiling + detail maps
```

## Instancing

```
Material instancing hierarchy:
  M_Master_Opaque (parent — compiled once)
    ├── MI_Brick_Red (instance — no recompile)
    ├── MI_Brick_Gray (instance)
    ├── MI_Concrete (instance)
    └── MI_Metal_Rusty (instance)

All instances share the same shader. Only parameter values differ.
This enables GPU instancing and reduces draw calls.
```
