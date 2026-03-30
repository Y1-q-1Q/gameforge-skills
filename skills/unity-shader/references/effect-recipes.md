# Effect Recipes

Production-ready shader effects for common game visuals.

---

## 1. Dissolve Effect

```hlsl
// Add to Properties:
_DissolveMap ("Dissolve Noise", 2D) = "white" 
_DissolveAmount ("Dissolve", Range(0,1)) = 0
_EdgeColor ("Edge Color", Color) = (1, 0.5, 0, 1)
_EdgeWidth ("Edge Width", Range(0, 0.1)) = 0.02

// In fragment:
half dissolveNoise = SAMPLE_TEXTURE2D(_DissolveMap, sampler_DissolveMap, input.uv).r;
half dissolveEdge = dissolveNoise - _DissolveAmount;
clip(dissolveEdge);

// Glowing edge
half edgeFactor = 1 - saturate(dissolveEdge / _EdgeWidth);
color.rgb = lerp(color.rgb, _EdgeColor.rgb, edgeFactor);
```

---

## 2. Outline (Inverted Hull)

```hlsl
// Second pass — renders backfaces expanded along normals
Pass
{
    Name "Outline"
    Cull Front  // Render back faces only

    HLSLPROGRAM
    #pragma vertex vert
    #pragma fragment frag
    #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

    float _OutlineWidth;
    half4 _OutlineColor;

    struct Attributes { float4 positionOS : POSITION; float3 normalOS : NORMAL; };
    struct Varyings { float4 positionCS : SV_POSITION; };

    Varyings vert(Attributes input)
    {
        Varyings output;
        // Expand vertices along normals in clip space
        float3 posWS = TransformObjectToWorld(input.positionOS.xyz);
        float3 normWS = TransformObjectToWorldNormal(input.normalOS);
        posWS += normWS * _OutlineWidth * 0.01;
        output.positionCS = TransformWorldToHClip(posWS);
        return output;
    }

    half4 frag(Varyings input) : SV_Target { return _OutlineColor; }
    ENDHLSL
}
```

---

## 3. Toon / Cel Shading

```hlsl
// Replace PBR lighting with stepped lighting:
half4 frag(Varyings input) : SV_Target
{
    half4 baseColor = SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, input.uv) * _BaseColor;

    // Main light
    Light mainLight = GetMainLight();
    half NdotL = dot(input.normalWS, mainLight.direction);

    // Step the lighting into bands
    half toonLight = smoothstep(_ShadowThreshold - _ShadowSmooth,
                                _ShadowThreshold + _ShadowSmooth, NdotL);

    // Apply shadow color in dark areas
    half3 finalColor = lerp(baseColor.rgb * _ShadowColor.rgb,
                            baseColor.rgb, toonLight);

    // Specular highlight (hard edge)
    half3 viewDir = GetWorldSpaceNormalizeViewDir(input.positionWS);
    half3 halfDir = normalize(mainLight.direction + viewDir);
    half spec = pow(saturate(dot(input.normalWS, halfDir)), _SpecularPower);
    spec = step(_SpecularThreshold, spec);
    finalColor += spec * _SpecularColor.rgb;

    return half4(finalColor * mainLight.color, baseColor.a);
}
```

---

## 4. Hologram

```hlsl
half4 frag(Varyings input) : SV_Target
{
    // Scanlines
    half scanline = frac(input.positionWS.y * _ScanlineFrequency + _Time.y * _ScanlineSpeed);
    scanline = step(_ScanlineThreshold, scanline);

    // Fresnel glow (brighter at edges)
    half3 viewDir = GetWorldSpaceNormalizeViewDir(input.positionWS);
    half fresnel = 1 - saturate(dot(input.normalWS, viewDir));
    fresnel = pow(fresnel, _FresnelPower);

    // Flicker
    half flicker = 0.95 + 0.05 * sin(_Time.y * 50);

    half alpha = (scanline * 0.5 + fresnel) * _BaseColor.a * flicker;
    return half4(_BaseColor.rgb * (fresnel + 0.3), saturate(alpha));
}
```

---

## 5. Water Surface (Simple)

```hlsl
// Vertex: wave displacement
Varyings vert(Attributes input)
{
    Varyings output;
    float3 posOS = input.positionOS.xyz;

    // Two overlapping sine waves
    float wave1 = sin(posOS.x * _WaveFreq1 + _Time.y * _WaveSpeed1) * _WaveAmp1;
    float wave2 = sin(posOS.z * _WaveFreq2 + _Time.y * _WaveSpeed2) * _WaveAmp2;
    posOS.y += wave1 + wave2;

    output.positionCS = TransformObjectToHClip(posOS);
    output.positionWS = TransformObjectToWorld(posOS);
    output.uv = input.uv + _Time.y * _FlowSpeed; // Scrolling UVs
    // ... normals, etc.
    return output;
}

// Fragment: depth-based transparency + fresnel
half4 frag(Varyings input) : SV_Target
{
    // Scene depth for shore fade
    float sceneDepth = LinearEyeDepth(
        SAMPLE_TEXTURE2D(_CameraDepthTexture, sampler_CameraDepthTexture,
        input.positionCS.xy / _ScreenParams.xy).r, _ZBufferParams);
    float surfaceDepth = input.positionCS.w;
    float depthDiff = sceneDepth - surfaceDepth;
    half shoreFade = saturate(depthDiff * _ShoreBlend);

    // Fresnel
    half3 viewDir = GetWorldSpaceNormalizeViewDir(input.positionWS);
    half fresnel = pow(1 - saturate(dot(input.normalWS, viewDir)), 3);

    half4 color = lerp(_ShallowColor, _DeepColor, shoreFade);
    color.rgb += fresnel * _FresnelColor.rgb;
    color.a = shoreFade;
    return color;
}
```

---

## 6. UV Scrolling (Lava, Conveyor, Energy)

```hlsl
// Simplest animated texture effect
half4 frag(Varyings input) : SV_Target
{
    float2 uv = input.uv;
    uv += _Time.y * _ScrollSpeed.xy; // _ScrollSpeed is float2
    return SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, uv) * _BaseColor;
}
```

---

## 7. Rim Light / Fresnel Glow

```hlsl
// Add to any shader's fragment:
half3 viewDir = GetWorldSpaceNormalizeViewDir(input.positionWS);
half rim = 1 - saturate(dot(input.normalWS, viewDir));
rim = pow(rim, _RimPower);
color.rgb += _RimColor.rgb * rim * _RimIntensity;
```

---

## Effect Complexity Guide

| Effect | Draw Calls | GPU Cost | Mobile OK? |
|--------|-----------|----------|------------|
| UV Scroll | +0 | ⭐ | ✅ |
| Rim Light | +0 | ⭐ | ✅ |
| Dissolve | +0 | ⭐ | ✅ |
| Toon Shading | +0 | ⭐⭐ | ✅ |
| Outline (hull) | +1 per object | ⭐⭐ | ⚠️ (watch vertex count) |
| Hologram | +0 | ⭐⭐ | ✅ |
| Water (simple) | +0 | ⭐⭐⭐ | ⚠️ (no depth on some devices) |
| Water (full) | +1 (refraction) | ⭐⭐⭐⭐ | ❌ |
