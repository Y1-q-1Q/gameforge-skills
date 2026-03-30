# Shader Math Reference

Essential math functions and techniques for shader development.

---

## Built-in Functions (HLSL)

| Function | Description | Common Use |
|----------|-------------|------------|
| `saturate(x)` | Clamp to [0,1] | Safe dot products |
| `lerp(a, b, t)` | Linear interpolation | Blending, transitions |
| `step(edge, x)` | 0 if x < edge, else 1 | Hard cutoffs |
| `smoothstep(a, b, x)` | Smooth 0→1 between a and b | Soft transitions |
| `frac(x)` | Fractional part | Repeating patterns, UV tiling |
| `fmod(x, y)` | Modulo | Repeating patterns |
| `abs(x)` | Absolute value | Symmetry |
| `sign(x)` | -1, 0, or 1 | Direction |
| `pow(x, n)` | Power | Falloff curves, specular |
| `sqrt(x)` | Square root | Distance |
| `rsqrt(x)` | 1/sqrt(x) | Fast normalization |
| `dot(a, b)` | Dot product | Lighting, projection |
| `cross(a, b)` | Cross product | Normal calculation |
| `normalize(v)` | Unit vector | Direction vectors |
| `reflect(i, n)` | Reflection vector | Specular, mirrors |
| `refract(i, n, eta)` | Refraction vector | Glass, water |
| `ddx(x)` / `ddy(x)` | Screen-space derivatives | Edge detection, mip selection |

---

## Common Patterns

### Remap Value

```hlsl
// Remap from [inMin, inMax] to [outMin, outMax]
half remap(half value, half inMin, half inMax, half outMin, half outMax)
{
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}
```

### Fresnel (View-Dependent Glow)

```hlsl
half fresnel(half3 normal, half3 viewDir, half power)
{
    return pow(1 - saturate(dot(normal, viewDir)), power);
}
// power=1: linear falloff
// power=3: subtle edge glow
// power=5: sharp edge glow
```

### Rotation (2D UV)

```hlsl
float2 rotateUV(float2 uv, float angle, float2 pivot)
{
    float s = sin(angle);
    float c = cos(angle);
    uv -= pivot;
    return float2(uv.x * c - uv.y * s, uv.x * s + uv.y * c) + pivot;
}
```

### Polar Coordinates

```hlsl
float2 toPolar(float2 uv, float2 center)
{
    float2 delta = uv - center;
    float radius = length(delta);
    float angle = atan2(delta.y, delta.x) / (2 * PI) + 0.5; // 0-1
    return float2(angle, radius);
}
```

### Noise (Simple Hash)

```hlsl
// Fast pseudo-random for shader use (not cryptographic)
half hash(float2 p)
{
    float3 p3 = frac(float3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return frac((p3.x + p3.y) * p3.z);
}

// Value noise
half valueNoise(float2 uv)
{
    float2 i = floor(uv);
    float2 f = frac(uv);
    f = f * f * (3.0 - 2.0 * f); // smoothstep

    half a = hash(i);
    half b = hash(i + float2(1, 0));
    half c = hash(i + float2(0, 1));
    half d = hash(i + float2(1, 1));

    return lerp(lerp(a, b, f.x), lerp(c, d, f.x), f.y);
}
```

### SDF (Signed Distance Functions)

```hlsl
// Circle
half sdCircle(float2 p, float r) { return length(p) - r; }

// Box
half sdBox(float2 p, float2 b)
{
    float2 d = abs(p) - b;
    return length(max(d, 0)) + min(max(d.x, d.y), 0);
}

// Rounded box
half sdRoundedBox(float2 p, float2 b, float r)
{
    return sdBox(p, b - r) - r;
}

// Usage: sharp edge from SDF
half mask = 1 - step(0, sdf);           // hard edge
half mask = 1 - smoothstep(0, 0.01, sdf); // anti-aliased edge
```

---

## Color Space

```hlsl
// Linear ↔ Gamma conversion (when needed)
half3 linearToGamma(half3 color) { return pow(color, 1.0 / 2.2); }
half3 gammaToLinear(half3 color) { return pow(color, 2.2); }

// HSV ↔ RGB
half3 hsvToRgb(half3 hsv)
{
    half4 K = half4(1, 2.0/3.0, 1.0/3.0, 3);
    half3 p = abs(frac(hsv.xxx + K.xyz) * 6 - K.www);
    return hsv.z * lerp(K.xxx, saturate(p - K.xxx), hsv.y);
}
```

---

## Time Variables (Unity Built-in)

| Variable | Type | Description |
|----------|------|-------------|
| `_Time.y` | float | Time in seconds |
| `_Time.z` | float | Time * 2 |
| `_Time.w` | float | Time * 3 |
| `_SinTime.w` | float | sin(time) |
| `_CosTime.w` | float | cos(time) |
| `unity_DeltaTime.x` | float | Delta time |
