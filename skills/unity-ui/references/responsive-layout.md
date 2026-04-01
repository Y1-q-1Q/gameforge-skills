# Responsive Layout & Safe Area

## Canvas Scaler Setup

```
Canvas Scaler:
  UI Scale Mode: Scale With Screen Size
  Reference Resolution: 1920 x 1080 (landscape) or 1080 x 1920 (portrait)
  Screen Match Mode: Match Width Or Height
  Match: 0.5 (balanced) or 1.0 (match height for landscape games)
```

### Match Value Guide

| Game Type | Match Value | Why |
|-----------|------------|-----|
| Landscape game | 0.5 - 1.0 | Height matters more (HUD at top/bottom) |
| Portrait game | 0.0 - 0.5 | Width matters more (side panels) |
| UI-heavy (menus) | 0.5 | Balanced scaling |

## Safe Area (Notch / Cutout Handling)

```csharp
public class SafeAreaAdapter : MonoBehaviour
{
    RectTransform _panel;

    void Awake()
    {
        _panel = GetComponent<RectTransform>();
        ApplySafeArea();
    }

    void ApplySafeArea()
    {
        var safeArea = Screen.safeArea;
        var anchorMin = safeArea.position;
        var anchorMax = safeArea.position + safeArea.size;

        anchorMin.x /= Screen.width;
        anchorMin.y /= Screen.height;
        anchorMax.x /= Screen.width;
        anchorMax.y /= Screen.height;

        _panel.anchorMin = anchorMin;
        _panel.anchorMax = anchorMax;
    }
}
```

Usage: Add to a RectTransform that wraps your entire UI. All children stay within safe area.

### Where to Apply Safe Area

| Element | Safe Area? | Why |
|---------|-----------|-----|
| HUD elements | ✅ | Must be visible, not behind notch |
| Background images | ❌ | Should extend to edges |
| Touch areas | ✅ | Must be reachable |
| Decorative borders | ❌ | Can extend behind notch |

## Aspect Ratio Handling

### Common Aspect Ratios

| Device | Ratio | Resolution |
|--------|-------|------------|
| iPhone 15 | 19.5:9 | 2556 x 1179 |
| iPad | 4:3 | 2048 x 1536 |
| Android phone | 20:9 | 2400 x 1080 |
| Android tablet | 16:10 | 2560 x 1600 |
| PC monitor | 16:9 | 1920 x 1080 |
| Ultrawide | 21:9 | 3440 x 1440 |

### Letterboxing / Pillarboxing

```csharp
// Force 16:9 with letterboxing on wider screens
public class AspectRatioEnforcer : MonoBehaviour
{
    [SerializeField] float _targetAspect = 16f / 9f;

    void Start()
    {
        float windowAspect = (float)Screen.width / Screen.height;
        float scaleHeight = windowAspect / _targetAspect;

        Camera cam = GetComponent<Camera>();
        if (scaleHeight < 1.0f)
        {
            // Pillarbox (wider than target)
            cam.rect = new Rect((1f - scaleHeight) / 2f, 0, scaleHeight, 1f);
        }
        else
        {
            // Letterbox (taller than target)
            float scaleWidth = 1f / scaleHeight;
            cam.rect = new Rect(0, (1f - scaleWidth) / 2f, 1f, scaleWidth);
        }
    }
}
```

## Anchor Patterns Cheat Sheet

| UI Element | Anchor | Pivot |
|-----------|--------|-------|
| Health bar (top-left) | Min(0,1) Max(0,1) | (0, 1) |
| Minimap (top-right) | Min(1,1) Max(1,1) | (1, 1) |
| Action buttons (bottom-right) | Min(1,0) Max(1,0) | (1, 0) |
| Dialog box (center) | Min(0.5,0.5) Max(0.5,0.5) | (0.5, 0.5) |
| Full-screen overlay | Min(0,0) Max(1,1) | (0.5, 0.5) |
| Bottom bar (stretch width) | Min(0,0) Max(1,0) | (0.5, 0) |

## Multi-Resolution Testing

Test these resolutions in Game view:

```
Mobile:    1080x1920 (9:16), 1080x2400 (9:20), 1179x2556 (iPhone)
Tablet:    1536x2048 (3:4 iPad), 1600x2560 (16:10)
PC:        1920x1080 (16:9), 2560x1440 (16:9), 3440x1440 (21:9)
```

Add them as custom resolutions in Game view for quick switching.
