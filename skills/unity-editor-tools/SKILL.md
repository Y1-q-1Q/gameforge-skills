---
name: unity-editor-tools
version: 2.0.0
description: "Create custom inspectors, editor windows, property drawers, gizmos, and workflow automation tools for Unity Editor"
engine: unity
category: tools
license: Apache-2.0

interface:
  input:
    required:
      - tool_requirements             # what editor tool is needed
    optional:
      - ui_system                     # imgui, ui-toolkit
      - tool_type                     # inspector, window, property-drawer, gizmo

  output:
    - type: code                      # Editor scripts, tools
    - type: configuration             # Editor settings
    - type: architecture              # Tool architecture design

  context_blocks:
    - id: editor-tools
      description: "Create custom inspectors, drawers, and windows"
      references: [editor-tools.md]
    - id: handles-scene-tools
      description: "Build scene view tools with Handles and overlays"
      references: [handles-scene-tools.md]
    - id: asset-pipeline
      description: "Automate asset pipeline with processors and hooks"
      references: [asset-pipeline.md]

references:
  - file: references/editor-tools.md
    relevance: [editor, inspector, property-drawer, editorwindow, imgui, ui-toolkit]
    size: 4KB
    priority: high
  - file: references/handles-scene-tools.md
    relevance: [handles, scene-view, gizmos, overlay, tools]
    size: 4KB
    priority: medium
  - file: references/asset-pipeline.md
    relevance: [asset, pipeline, postprocessor, build-hooks, automation]
    size: 7KB
    priority: medium

triggers:
  keywords:
    - "editor tool"
    - "custom inspector"
    - "property drawer"
    - "editor window"
    - "gizmo"
    - "handles"
    - "scene view"
    - "imgui"
    - "ui toolkit"
    - "asset postprocessor"
    - "menu item"
    - "serializedproperty"
  files:
    - "Assets/Editor/**/*.cs"
    - "**/Editor/**"
  context:
    - has_unity_project: true

composition:
  combines_with:
    - unity-build                # build preprocessing
    - unity-architect            # project setup tools
  depends_on: []
  conflicts_with: []
  provides:
    - editor-automation
    - custom-tools
    - workflow-optimization

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux]
  render_pipelines: [built-in, urp, hdrp]
---

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
