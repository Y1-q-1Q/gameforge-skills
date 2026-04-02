---
name: unity-shader
version: 2.0.0
description: "Generate ShaderLab/HLSL code for Unity's URP, HDRP, and Built-in render pipelines — shaders, VFX, and post-processing"
engine: unity
category: rendering
license: Apache-2.0

interface:
  input:
    required:
      - effect_description            # what visual effect is needed
    optional:
      - render_pipeline               # urp, hdrp, built-in
      - target_platform               # mobile, pc, console
      - performance_budget            # e.g. "60fps mobile"
      - shader_graph_preferred        # true/false

  output:
    - type: code                      # ShaderLab/HLSL shaders
    - type: configuration             # Shader Graph assets, materials

  context_blocks:
    - id: urp-shaders
      description: "Generate URP-compatible shaders"
      references: [urp-shader-patterns.md]
    - id: effect-recipes
      description: "Create common game visual effects"
      references: [effect-recipes.md]
    - id: mobile-optimization
      description: "Optimize shaders for mobile performance"
      references: [mobile-optimization.md]

references:
  - file: references/urp-shader-patterns.md
    relevance: [urp, shaderlab, hlsl, patterns, templates]
    size: 9KB
    priority: high
  - file: references/effect-recipes.md
    relevance: [effects, dissolve, outline, water, toon, hologram, vfx]
    size: 6KB
    priority: high
  - file: references/mobile-optimization.md
    relevance: [mobile, optimization, performance, variants, lod, precision]
    size: 5KB
    priority: medium
  - file: references/shader-math.md
    relevance: [math, vector, matrix, noise, sdf, lighting]
    size: 4KB
    priority: low

triggers:
  keywords:
    - "shader"
    - "shaderlab"
    - "hlsl"
    - "shader graph"
    - "visual effect"
    - "post-processing"
    - "urp"
    - "hdrp"
    - "material"
    - "dissolve"
    - "outline"
    - "toon shading"
  files:
    - "Assets/Shaders/**/*.shader"
    - "Assets/Shaders/**/*.hlsl"
    - "Assets/Materials/**/*.mat"
  context:
    - has_unity_project: true
    - has_render_pipeline: [urp, hdrp, built-in]

composition:
  combines_with:
    - unity-performance          # shader performance optimization
    - unity-ui                   # UI shaders and effects
    - unity-animation            # vertex animation shaders
  depends_on: []
  conflicts_with: []
  provides:
    - shader-code
    - visual-effects
    - material-setup

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android, webgl]
  render_pipelines: [built-in, urp, hdrp]
---

# unity-shader

Generate ShaderLab/HLSL code for Unity's URP, HDRP, and Built-in render pipelines. Create production-ready shaders, visual effects, and post-processing.

## When to use

Activate when the user mentions:
- Writing shaders in Unity (ShaderLab, HLSL, Shader Graph)
- Visual effects (dissolve, outline, water, toon, hologram, etc.)
- Post-processing effects (bloom, blur, color grading)
- Render pipeline configuration (URP, HDRP, Built-in)
- Performance optimization for shaders
- Mobile shader optimization

## Capabilities

1. **Shader generation** — Complete ShaderLab/HLSL shaders for any render pipeline
2. **Effect recipes** — Common game effects with production-ready code
3. **Shader Graph guidance** — Node setups for visual shader authoring
4. **Post-processing** — Custom render passes and effects
5. **Mobile optimization** — Shader variants, LOD, precision optimization
6. **Debugging** — Shader debugging techniques and common pitfalls

## Render Pipeline Support

| Pipeline | Shader Language | Status |
|----------|----------------|--------|
| URP (Universal) | ShaderLab + HLSL | ✅ Full |
| HDRP (High Definition) | ShaderLab + HLSL | ✅ Full |
| Built-in | ShaderLab + Cg/HLSL | ✅ Full |
| Shader Graph | Visual nodes | ✅ Guidance |

## References

- [urp-shader-patterns.md](references/urp-shader-patterns.md) — URP shader templates and patterns
- [effect-recipes.md](references/effect-recipes.md) — Common game visual effects
- [mobile-optimization.md](references/mobile-optimization.md) — Mobile shader performance
- [shader-math.md](references/shader-math.md) — Essential shader math reference

## Limitations

- Compute shaders require platform support verification
- Ray tracing shaders are HDRP-only
- Shader Graph custom nodes require code generation
