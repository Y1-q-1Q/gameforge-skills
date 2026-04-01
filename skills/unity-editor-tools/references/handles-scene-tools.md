# Scene View Handles & Custom Tools

## Handles (Interactive Scene Editing)

Handles let users manipulate data directly in the Scene view.

```csharp
[CustomEditor(typeof(PatrolRoute))]
public class PatrolRouteEditor : Editor
{
    void OnSceneGUI()
    {
        var route = (PatrolRoute)target;
        if (route.waypoints == null) return;

        Handles.color = Color.cyan;

        for (int i = 0; i < route.waypoints.Length; i++)
        {
            // Draggable position handle
            EditorGUI.BeginChangeCheck();
            Vector3 newPos = Handles.PositionHandle(route.waypoints[i], Quaternion.identity);
            if (EditorGUI.EndChangeCheck())
            {
                Undo.RecordObject(route, "Move Waypoint");
                route.waypoints[i] = newPos;
            }

            // Label
            Handles.Label(route.waypoints[i] + Vector3.up * 0.5f, $"WP {i}");

            // Line to next waypoint
            if (i < route.waypoints.Length - 1)
                Handles.DrawDottedLine(route.waypoints[i], route.waypoints[i + 1], 4f);
        }

        // Close loop
        if (route.loop && route.waypoints.Length > 1)
            Handles.DrawDottedLine(route.waypoints[^1], route.waypoints[0], 4f);
    }
}
```

## Handle Types

| Handle | Use Case | Method |
|--------|----------|--------|
| Position | Move a point | `Handles.PositionHandle()` |
| Rotation | Rotate an object | `Handles.RotationHandle()` |
| Scale | Resize | `Handles.ScaleHandle()` |
| Free Move | Drag without axis constraint | `Handles.FreeMoveHandle()` |
| Disc | Rotate around axis | `Handles.Disc()` |
| Radius | Adjust sphere radius | `Handles.RadiusHandle()` |
| Slider | Move along one axis | `Handles.Slider()` |

## Scene View Overlay (Unity 2022+)

```csharp
using UnityEditor.Overlays;
using UnityEditor;
using UnityEngine.UIElements;

[Overlay(typeof(SceneView), "Spawn Tools", true)]
public class SpawnToolsOverlay : Overlay
{
    public override VisualElement CreatePanelContent()
    {
        var root = new VisualElement();

        var btn = new Button(() => SpawnEnemy()) { text = "Spawn Enemy" };
        root.Add(btn);

        var slider = new SliderInt("Count", 1, 50) { value = 5 };
        root.Add(slider);

        return root;
    }

    void SpawnEnemy()
    {
        // Spawn at scene view camera position
        var cam = SceneView.lastActiveSceneView.camera;
        Debug.Log($"Spawn at {cam.transform.position}");
    }
}
```

## Custom Scene Tool (Unity 2022+)

```csharp
using UnityEditor.EditorTools;

[EditorTool("Place Objects", typeof(ObjectPlacer))]
public class PlaceObjectTool : EditorTool
{
    public override void OnToolGUI(EditorWindow window)
    {
        if (window is not SceneView) return;

        HandleUtility.AddDefaultControl(GUIUtility.GetControlID(FocusType.Passive));

        Event e = Event.current;
        if (e.type == EventType.MouseDown && e.button == 0)
        {
            Ray ray = HandleUtility.GUIPointToWorldRay(e.mousePosition);
            if (Physics.Raycast(ray, out var hit))
            {
                var placer = (ObjectPlacer)target;
                Undo.RegisterCreatedObjectUndo(
                    Instantiate(placer.prefab, hit.point, Quaternion.identity),
                    "Place Object");
                e.Use();
            }
        }
    }
}
```

## Gizmos Advanced Patterns

```csharp
// Draw only when selected
void OnDrawGizmosSelected()
{
    Gizmos.color = new Color(0, 1, 0, 0.2f);
    Gizmos.DrawCube(transform.position, triggerSize);
}

// Draw always (use sparingly)
void OnDrawGizmos()
{
    Gizmos.DrawIcon(transform.position, "enemy_icon.png", true);
}

// Custom gizmo for any component
[DrawGizmo(GizmoType.Selected | GizmoType.NonSelected)]
static void DrawSpawnerGizmo(EnemySpawner spawner, GizmoType type)
{
    bool selected = (type & GizmoType.Selected) != 0;
    Gizmos.color = selected ? Color.red : new Color(1, 0, 0, 0.3f);
    Gizmos.DrawWireSphere(spawner.transform.position, spawner.spawnRadius);
}
```
