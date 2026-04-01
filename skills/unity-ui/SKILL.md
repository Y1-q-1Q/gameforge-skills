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
