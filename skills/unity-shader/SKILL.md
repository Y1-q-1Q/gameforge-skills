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
