# Custom Editor Tools

## Custom Inspector

```csharp
using UnityEditor;
using UnityEngine;

[CustomEditor(typeof(EnemySpawner))]
public class EnemySpawnerEditor : Editor
{
    public override void OnInspectorGUI()
    {
        var spawner = (EnemySpawner)target;

        // Default fields
        DrawDefaultInspector();

        EditorGUILayout.Space(10);

        // Custom button
        if (GUILayout.Button("Spawn Test Enemy"))
        {
            spawner.SpawnEnemy(spawner.transform.position);
        }

        // Conditional warning
        if (spawner.MaxEnemies > 100)
        {
            EditorGUILayout.HelpBox("More than 100 enemies may cause performance issues on mobile.", MessageType.Warning);
        }

        // Progress bar
        if (Application.isPlaying)
        {
            float ratio = (float)spawner.ActiveCount / spawner.MaxEnemies;
            EditorGUI.ProgressBar(EditorGUILayout.GetControlRect(), ratio, $"{spawner.ActiveCount}/{spawner.MaxEnemies}");
        }
    }
}
```

## Property Drawer

```csharp
// Attribute
public class MinMaxAttribute : PropertyAttribute
{
    public float Min, Max;
    public MinMaxAttribute(float min, float max) { Min = min; Max = max; }
}

// Drawer
[CustomPropertyDrawer(typeof(MinMaxAttribute))]
public class MinMaxDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        var attr = (MinMaxAttribute)attribute;
        var minProp = property.FindPropertyRelative("min");
        var maxProp = property.FindPropertyRelative("max");

        float min = minProp.floatValue;
        float max = maxProp.floatValue;

        EditorGUI.BeginProperty(position, label, property);
        position = EditorGUI.PrefixLabel(position, label);

        float fieldWidth = 50;
        var sliderRect = new Rect(position.x + fieldWidth + 5, position.y, position.width - fieldWidth * 2 - 10, position.height);

        min = EditorGUI.FloatField(new Rect(position.x, position.y, fieldWidth, position.height), min);
        EditorGUI.MinMaxSlider(sliderRect, ref min, ref max, attr.Min, attr.Max);
        max = EditorGUI.FloatField(new Rect(position.xMax - fieldWidth, position.y, fieldWidth, position.height), max);

        minProp.floatValue = min;
        maxProp.floatValue = max;
        EditorGUI.EndProperty();
    }
}

// Usage
[System.Serializable]
public struct FloatRange
{
    public float min, max;
}

public class EnemyConfig : MonoBehaviour
{
    [MinMax(0, 100)]
    public FloatRange spawnDelay;

    [MinMax(1, 50)]
    public FloatRange moveSpeed;
}
```

## Editor Window

```csharp
public class LevelDesignerWindow : EditorWindow
{
    private Vector2 _scrollPos;
    private string _searchFilter = "";

    [MenuItem("GameForge/Level Designer")]
    public static void ShowWindow()
    {
        GetWindow<LevelDesignerWindow>("Level Designer");
    }

    private void OnGUI()
    {
        // Toolbar
        EditorGUILayout.BeginHorizontal(EditorStyles.toolbar);
        _searchFilter = EditorGUILayout.TextField(_searchFilter, EditorStyles.toolbarSearchField);
        if (GUILayout.Button("Refresh", EditorStyles.toolbarButton, GUILayout.Width(60)))
            RefreshData();
        EditorGUILayout.EndHorizontal();

        // Content
        _scrollPos = EditorGUILayout.BeginScrollView(_scrollPos);
        // ... draw level list, properties, etc.
        EditorGUILayout.EndScrollView();
    }

    private void RefreshData() { /* reload level data */ }
}
```

## Gizmos (Scene View Visualization)

```csharp
public class EnemySpawner : MonoBehaviour
{
    public float spawnRadius = 5f;

    private void OnDrawGizmosSelected()
    {
        Gizmos.color = new Color(1, 0, 0, 0.3f);
        Gizmos.DrawSphere(transform.position, spawnRadius);
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, spawnRadius);
    }
}
```
