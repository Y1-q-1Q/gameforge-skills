# unity-editor-tools

Create custom inspectors, editor windows, property drawers, gizmos, and workflow automation tools for Unity Editor.

## When to use

Activate when the user mentions:
- Custom Inspector, CustomEditor
- Property Drawer, PropertyAttribute
- Editor Window, EditorWindow
- Scene view tools, Gizmos, Handles
- ScriptableObject editors
- Build preprocessing, asset postprocessing
- Editor automation, menu items
- SerializedProperty, SerializedObject
- UI Toolkit for editor (IMGUI vs UI Toolkit)

## Capabilities

1. **Custom Inspectors** — Rich editors for MonoBehaviours and ScriptableObjects
2. **Property Drawers** — Reusable field renderers (MinMax, ReadOnly, Conditional)
3. **Editor Windows** — Standalone tool windows (level designer, batch tools)
4. **Scene Tools** — Gizmos, Handles, custom scene overlays
5. **Asset Pipeline** — Import/export processors, build hooks
6. **Automation** — Menu items, hotkeys, batch operations

## Architecture Decision Guide

| Need | Solution |
|------|----------|
| Better Inspector for one component | CustomEditor |
| Reusable field type (range, color, etc.) | PropertyDrawer |
| Standalone tool | EditorWindow |
| Visual scene editing | Handles + SceneView overlay |
| Asset import rules | AssetPostprocessor |
| Build hooks | IPreprocessBuildWithReport |

## Unity version support

| Version | IMGUI | UI Toolkit Editor |
|---------|-------|-------------------|
| Unity 6+ | ✅ | ✅ Full |
| 2022.3 LTS | ✅ | ✅ |
| 2021.3 LTS | ✅ | ⚠️ Partial |

## References

- [editor-tools.md](references/editor-tools.md) — Custom Inspector, PropertyDrawer, EditorWindow, Gizmos
- [handles-scene-tools.md](references/handles-scene-tools.md) — Scene view Handles, overlays, custom tools
- [asset-pipeline.md](references/asset-pipeline.md) — AssetPostprocessor, build hooks, automation scripts

## Limitations

- Editor scripts only run in Unity Editor, not in builds
- IMGUI is immediate-mode (redraws every frame) — can be slow for complex UIs
- UI Toolkit for editor is newer and has fewer community examples
- SerializedProperty API is verbose but necessary for undo/prefab support
