---
name: ue5-materials
version: 2.0.0
description: "Create materials, leverage Nanite and Lumen, virtual textures, and material optimization for Unreal Engine 5"
engine: unreal
category: rendering
license: Apache-2.0

interface:
  input:
    required:
      - material_requirements         # what materials/effects needed
    optional:
      - use_nanite                    # true/false
      - use_lumen                     # true/false
      - target_platform               # pc, console, mobile

  output:
    - type: code                      # Material graphs, HLSL
    - type: configuration             # Material instances, VT
    - type: architecture              # Material pipeline design

  context_blocks:
    - id: material-patterns
      description: "Create PBR and layered materials"
      references: [material-patterns.md]
    - id: nanite-lumen
      description: "Optimize materials for Nanite and Lumen"
      references: [nanite-lumen.md]
    - id: material-optimization
      description: "Optimize shader complexity and performance"
      references: [material-optimization.md]

references:
  - file: references/material-patterns.md
    relevance: [material, pbr, layered, function, custom-expression]
    size: 3KB
    priority: high
  - file: references/nanite-lumen.md
    relevance: [nanite, lumen, virtual-shadow-map, ue5, rendering]
    size: 3KB
    priority: high
  - file: references/material-optimization.md
    relevance: [optimization, complexity, instancing, lod, shader]
    size: 3KB
    priority: medium

triggers:
  keywords:
    - "material"
    - "ue5 material"
    - "nanite"
    - "lumen"
    - "virtual texture"
    - "runtime virtual texture"
    - "landscape material"
    - "layered material"
    - "material function"
    - "shader complexity"
    - "post-process"
  files:
    - "**/*.uasset"
    - "Content/Materials/**"
    - "**/*Material*.uasset"
  context:
    - has_unreal_project: true

composition:
  combines_with:
    - ue5-blueprint              # material parameter control
    - ue5-multiplayer            # networked material effects
    - game-design-doc            # visual direction
  depends_on: []
  conflicts_with: []
  provides:
    - material-system
    - rendering-setup
    - visual-effects

engine_versions:
  unreal:
    minimum: "5.1"
    recommended: "5.3"
    tested: ["5.1", "5.2", "5.3", "5.4"]
  platforms: [windows, macos, linux, ios, android, playstation, xbox]
---

# ue5-materials

Create materials, leverage Nanite and Lumen, virtual textures, and material optimization for Unreal Engine 5.

## When to use

Activate when the user mentions:
- UE5 materials, material editor, material instances
- Nanite, Lumen, virtual shadow maps
- Material optimization, shader complexity
- Landscape materials, layered materials
- Material functions, custom expressions
- Virtual textures, runtime virtual textures
- Post-process materials

## Capabilities

1. **Material patterns** — PBR setup, layered materials, material functions
2. **Nanite + Lumen** — Optimal material setup for UE5 rendering features
3. **Virtual textures** — Runtime virtual textures for landscape and large worlds
4. **Optimization** — Shader complexity reduction, material instances, LOD materials

## Engine version support

| Version | Nanite | Lumen | Virtual Textures |
|---------|--------|-------|-----------------|
| UE 5.4+ | ✅ Full | ✅ Full | ✅ Full |
| UE 5.3 | ✅ | ✅ | ✅ |
| UE 5.1-5.2 | ⚠️ Limited | ⚠️ Limited | ✅ |

## References

- [material-patterns.md](references/material-patterns.md) — PBR setup, layered materials, material functions
- [nanite-lumen.md](references/nanite-lumen.md) — Nanite-compatible materials, Lumen best practices
- [material-optimization.md](references/material-optimization.md) — Shader complexity, instancing, LOD materials

## Limitations

- Nanite requires specific mesh setup (no deformation)
- Lumen has platform limitations (no mobile)
- Complex material graphs impact compile times
- Virtual textures have memory overhead
