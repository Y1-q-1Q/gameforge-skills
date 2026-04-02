---
name: unity-ui
version: 2.0.0
description: "Generate UGUI and UI Toolkit code with responsive layouts, data binding, animation, and game-specific UI patterns"
engine: unity
category: ui
license: Apache-2.0

interface:
  input:
    required:
      - ui_requirements               # what UI elements are needed
    optional:
      - ui_system                     # ugui, ui-toolkit, or hybrid
      - target_platform               # mobile, pc, console
      - data_binding_required         # true/false
      - animation_complexity          # simple, moderate, complex

  output:
    - type: code                      # UI scripts, controllers
    - type: configuration             # UXML, USS, prefabs
    - type: architecture              # UI architecture documentation

  context_blocks:
    - id: ui-architecture
      description: "Design UI architecture and panel management"
      references: [ui-architecture.md]
    - id: responsive-layout
      description: "Implement multi-resolution responsive layouts"
      references: [responsive-layout.md]
    - id: game-ui-patterns
      description: "Create game-specific UI components"
      references: [game-ui-patterns.md]

references:
  - file: references/ui-architecture.md
    relevance: [architecture, panel, mvc, mvp, addressables, navigation]
    size: 5KB
    priority: high
  - file: references/responsive-layout.md
    relevance: [responsive, layout, resolution, safe-area, aspect-ratio]
    size: 3KB
    priority: medium
  - file: references/game-ui-patterns.md
    relevance: [inventory, cooldown, damage-numbers, virtual-scroll, minimap]
    size: 8KB
    priority: high

triggers:
  keywords:
    - "ui"
    - "ugui"
    - "ui toolkit"
    - "canvas"
    - "panel"
    - "hud"
    - "menu"
    - "inventory"
    - "responsive"
    - "data binding"
    - "virtual scroll"
    - "drag and drop"
  files:
    - "Assets/UI/**/*.prefab"
    - "Assets/UI/**/*.uxml"
    - "Assets/UI/**/*.uss"
    - "**/UIManager*.cs"
  context:
    - has_unity_project: true

composition:
  combines_with:
    - unity-animation            # UI animations and transitions
    - unity-addressables         # UI asset loading
    - unity-localization         # multi-language UI
    - unity-performance          # UI optimization
  depends_on: []
  conflicts_with: []
  provides:
    - ui-system
    - panel-management
    - responsive-layout

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android, webgl]
  render_pipelines: [built-in, urp, hdrp]
---

# unity-ui

Generate UGUI and UI Toolkit code with responsive layouts, data binding, animation, and game-specific UI patterns.

## When to use

Activate when the user mentions:
- Creating UI panels, menus, HUD, dialogs
- UGUI or UI Toolkit / UI Builder
- Responsive layout for multiple resolutions
- UI animations and transitions (DOTween, USS)
- Data binding for UI elements
- Virtual scroll lists (inventory, leaderboard)
- Drag and drop UI
- Radial menus, cooldown indicators, health bars

## Capabilities

1. **Panel management** — Open/close/stack panels with transitions
2. **Layout systems** — Responsive layouts for mobile/tablet/desktop
3. **UI architecture** — MVC/MVP patterns for game UI
4. **Component library** — Reusable components (buttons, lists, popups)
5. **UI Toolkit** — USS styling, UXML templates, data binding
6. **Game UI patterns** — Inventory grids, cooldown radials, damage numbers, minimaps
7. **Performance** — Canvas optimization, batching, virtual scroll

## Architecture Decision Guide

| Need | Solution |
|------|----------|
| Game HUD (health, ammo, minimap) | UGUI + Canvas |
| Inventory / shop grid | UGUI + virtual scroll |
| Settings menu | UI Toolkit (data-driven) |
| Editor tools | UI Toolkit |
| Animated transitions | DOTween + CanvasGroup |
| Data-heavy lists (1000+ items) | UI Toolkit ListView or custom virtual scroll |

## Unity version support

| Version | UGUI | UI Toolkit |
|---------|------|-----------|
| Unity 6+ | ✅ | ✅ Full runtime |
| 2022.3 LTS | ✅ | ✅ Runtime |
| 2021.3 LTS | ✅ | ⚠️ Editor only |

## References

- [ui-architecture.md](references/ui-architecture.md) — Panel manager, MVC pattern, Addressables loading
- [responsive-layout.md](references/responsive-layout.md) — Multi-resolution, safe area, aspect ratio handling
- [game-ui-patterns.md](references/game-ui-patterns.md) — Inventory grid, cooldown radial, damage numbers, virtual scroll

## Limitations

- UGUI Canvas rebuilds can be expensive — split into multiple canvases
- UI Toolkit runtime support is still maturing (no built-in animation system)
- Drag-and-drop in UGUI requires manual implementation
- Deep nesting of layout groups kills performance
