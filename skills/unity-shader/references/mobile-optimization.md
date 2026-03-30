# Mobile Shader Optimization

## Golden Rules

1. **Fewer instructions = faster.** Mobile GPUs are instruction-bound.
2. **Use `half` everywhere possible.** `float` is 2x slower on many mobile GPUs.
3. **Minimize texture samples.** Each sample is expensive.
4. **Avoid branching.** Use `step`/`lerp`/`saturate` instead of `if`.
5. **Kill shader variants.** Each variant = separate shader to compile and cache.

---

## Precision Guide

```hlsl
// Use the lowest precision that works:
half    // 16-bit float. Range: -65504 to 65504. Use for: colors, normals, UV offsets
float   // 32-bit float. Use for: positions, depth, UV coordinates, time accumulation
fixed   // 11-bit (deprecated in URP, maps to half). Avoid.
int     // 32-bit integer. Use sparingly.
```

**Rule:** Start with `half` for everything. Only upgrade to `float` if you see artifacts.

| Data | Precision | Why |
|------|-----------|-----|
| Color (RGB/RGBA) | `half` | 0-1 range, no precision needed |
| Normal vectors | `half` | Normalized, small range |
| UV coordinates | `float` | Precision loss causes texture swimming |
| World position | `float` | Large values need precision |
| Time | `float` | Accumulates, `half` overflows |
| Depth | `float` | Precision critical |

---

## Instruction Budget

| Platform | Target Instructions (Frag) | Notes |
|----------|---------------------------|-------|
| High-end mobile (2024+) | < 128 | Flagship phones |
| Mid-range mobile | < 64 | Most Android devices |
| Low-end mobile | < 32 | Budget phones, older devices |
| VR mobile (Quest) | < 50 | Thermal throttling |

---

## Common Optimizations

### Texture Packing

Pack multiple data channels into one texture:

```hlsl
// Instead of 4 texture samples:
// SAMPLE_TEXTURE2D(_MetallicMap, ...)    // R only
// SAMPLE_TEXTURE2D(_RoughnessMap, ...)   // R only
// SAMPLE_TEXTURE2D(_AOMap, ...)          // R only
// SAMPLE_TEXTURE2D(_HeightMap, ...)      // R only

// Pack into one RGBA texture:
half4 packed = SAMPLE_TEXTURE2D(_PackedMap, sampler_PackedMap, input.uv);
half metallic  = packed.r;
half roughness = packed.g;
half ao        = packed.b;
half height    = packed.a;
// 1 sample instead of 4 = 4x faster
```

### Avoid Branching

```hlsl
// ❌ Bad (branch)
if (NdotL > 0)
    color = lit;
else
    color = shadow;

// ✅ Good (branchless)
color = lerp(shadow, lit, step(0, NdotL));

// ✅ Also good
color = lerp(shadow, lit, saturate(NdotL * 1000));
```

### Pre-compute in Vertex Shader

```hlsl
// ❌ Bad: computing per-pixel when per-vertex is enough
half4 frag(Varyings input) : SV_Target
{
    half3 viewDir = normalize(_WorldSpaceCameraPos - input.positionWS); // per pixel
    half fresnel = pow(1 - dot(input.normalWS, viewDir), 3);           // per pixel
    ...
}

// ✅ Good: compute fresnel in vertex shader
Varyings vert(Attributes input)
{
    ...
    half3 viewDir = normalize(_WorldSpaceCameraPos - output.positionWS);
    output.fresnel = pow(1 - saturate(dot(output.normalWS, viewDir)), 3);
    return output;
}
```

### Shader Variant Stripping

```hlsl
// ❌ Bad: generates 2^N variants
#pragma multi_compile _ _FEATURE_A
#pragma multi_compile _ _FEATURE_B
#pragma multi_compile _ _FEATURE_C
// = 8 variants

// ✅ Better: use shader_feature for material-specific keywords
#pragma shader_feature_local _ _FEATURE_A  // Only compiles if material uses it
```

---

## Mobile-Specific Techniques

### Baked Lighting Over Realtime

```
Realtime shadows: ~2ms on mobile
Baked shadows: ~0ms (free)

Rule: Bake everything you can. Only use realtime for the player and key dynamic objects.
```

### Simplified Lighting Model

```hlsl
// Instead of full PBR, use Lambert + Blinn-Phong on mobile:
half4 frag(Varyings input) : SV_Target
{
    Light mainLight = GetMainLight();
    half NdotL = saturate(dot(input.normalWS, mainLight.direction));

    // Diffuse (Lambert)
    half3 diffuse = baseColor.rgb * NdotL * mainLight.color;

    // Specular (Blinn-Phong, cheaper than GGX)
    half3 halfDir = normalize(mainLight.direction + viewDir);
    half spec = pow(saturate(dot(input.normalWS, halfDir)), _Shininess);

    return half4(diffuse + spec * _SpecColor.rgb + _AmbientColor.rgb * baseColor.rgb, 1);
}
```

### Texture LOD Bias

```hlsl
// Force lower mip level on mobile to reduce bandwidth
half4 color = SAMPLE_TEXTURE2D_LOD(_BaseMap, sampler_BaseMap, input.uv, _MipBias);
```

---

## Performance Profiling Checklist

- [ ] Check GPU time in Unity Frame Debugger
- [ ] Verify SRP Batcher compatibility (no red items in Frame Debugger)
- [ ] Count texture samples per fragment (target: ≤ 4 on mobile)
- [ ] Check shader variant count (`Edit → Project Settings → Graphics → Shader Stripping`)
- [ ] Test on lowest target device
- [ ] Monitor thermal throttling (sustained performance, not peak)
