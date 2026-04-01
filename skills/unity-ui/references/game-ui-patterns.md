# Game UI Patterns

## Virtual Scroll List (Inventory, Leaderboard)

When you have 1000+ items, instantiating all UI elements kills performance. Use virtual scrolling.

```csharp
public class VirtualInventoryGrid : MonoBehaviour
{
    [SerializeField] RectTransform _content;
    [SerializeField] GameObject _itemPrefab;
    [SerializeField] int _poolSize = 20;
    [SerializeField] Vector2 _cellSize = new(100, 100);
    [SerializeField] Vector2 _spacing = new(10, 10);

    List<ItemData> _items = new();
    List<InventoryItemUI> _pool = new();
    int _visibleStart = -1, _visibleEnd = -1;

    void Start()
    {
        // Create pool
        for (int i = 0; i < _poolSize; i++)
        {
            var go = Instantiate(_itemPrefab, _content);
            _pool.Add(go.GetComponent<InventoryItemUI>());
            go.SetActive(false);
        }

        // Listen to scroll
        GetComponent<ScrollRect>().onValueChanged.AddListener(OnScroll);
    }

    public void SetData(List<ItemData> items)
    {
        _items = items;
        // Set content size based on total items
        int rows = Mathf.CeilToInt(items.Count / 5f); // 5 columns
        _content.sizeDelta = new Vector2(0, rows * (_cellSize.y + _spacing.y));
        UpdateVisibleItems();
    }

    void OnScroll(Vector2 pos) => UpdateVisibleItems();

    void UpdateVisibleItems()
    {
        float scrollY = _content.anchoredPosition.y;
        int startRow = Mathf.FloorToInt(scrollY / (_cellSize.y + _spacing.y));
        int visibleRows = Mathf.CeilToInt(GetComponent<RectTransform>().rect.height / (_cellSize.y + _spacing.y));

        int newStart = Mathf.Max(0, startRow * 5); // 5 columns
        int newEnd = Mathf.Min(_items.Count, (startRow + visibleRows + 1) * 5);

        if (newStart == _visibleStart && newEnd == _visibleEnd) return;

        // Recycle pool items
        int poolIndex = 0;
        for (int i = newStart; i < newEnd && poolIndex < _pool.Count; i++)
        {
            _pool[poolIndex].gameObject.SetActive(true);
            _pool[poolIndex].SetData(_items[i]);
            // Position in grid
            int row = i / 5, col = i % 5;
            _pool[poolIndex].GetComponent<RectTransform>().anchoredPosition = new Vector2(
                col * (_cellSize.x + _spacing.x),
                -row * (_cellSize.y + _spacing.y));
            poolIndex++;
        }

        // Hide unused pool items
        for (int i = poolIndex; i < _pool.Count; i++)
            _pool[i].gameObject.SetActive(false);

        _visibleStart = newStart;
        _visibleEnd = newEnd;
    }
}
```

## Cooldown Radial Indicator

```csharp
public class CooldownIndicator : MonoBehaviour
{
    [SerializeField] Image _radialFill; // Image with Fill method: Radial 360
    [SerializeField] TextMeshProUGUI _timerText;
    float _cooldownDuration, _remaining;

    public void StartCooldown(float duration)
    {
        _cooldownDuration = duration;
        _remaining = duration;
        _radialFill.gameObject.SetActive(true);
    }

    void Update()
    {
        if (_remaining <= 0) return;

        _remaining -= Time.deltaTime;
        float progress = 1f - (_remaining / _cooldownDuration);
        _radialFill.fillAmount = progress;
        _timerText.text = Mathf.Ceil(_remaining).ToString();

        if (_remaining <= 0)
        {
            _radialFill.gameObject.SetActive(false);
            _timerText.text = "";
        }
    }
}
```

## Damage Numbers (Floating Text)

```csharp
public class DamageNumber : MonoBehaviour
{
    [SerializeField] TextMeshProUGUI _text;
    [SerializeField] float _moveSpeed = 100f;
    [SerializeField] float _fadeDuration = 1f;

    Vector3 _worldPos;
    Camera _mainCam;

    public void Init(float damage, Vector3 worldPos, bool isCrit)
    {
        _worldPos = worldPos;
        _mainCam = Camera.main;
        _text.text = damage.ToString("F0");
        _text.color = isCrit ? Color.red : Color.white;
        if (isCrit) _text.fontSize *= 1.5f;

        // Animate up and fade
        transform.DOMoveY(transform.position.y + 50f, _fadeDuration)
            .SetEase(Ease.OutQuad);
        _text.DOFade(0, _fadeDuration)
            .OnComplete(() => Destroy(gameObject));
    }

    void Update()
    {
        // Follow world position
        transform.position = _mainCam.WorldToScreenPoint(_worldPos);
    }
}

// Spawner (object pool this in production)
public class DamageNumberSpawner : MonoBehaviour
{
    [SerializeField] GameObject _prefab;
    [SerializeField] Canvas _canvas;

    public void Spawn(float damage, Vector3 worldPos, bool isCrit)
    {
        var go = Instantiate(_prefab, _canvas.transform);
        go.GetComponent<DamageNumber>().Init(damage, worldPos, isCrit);
    }
}
```

## Health Bar (World Space + Screen Space)

```csharp
public class HealthBar : MonoBehaviour
{
    [SerializeField] Image _fillImage;
    [SerializeField] float _smoothSpeed = 5f;
    float _currentFill = 1f;

    Transform _target; // The entity this bar follows
    Camera _mainCam;
    Vector3 _offset = new Vector3(0, 2f, 0);

    void Start() => _mainCam = Camera.main;

    public void SetTarget(Transform target) => _target = target;

    public void SetHealth(float current, float max)
    {
        _currentFill = current / max;
    }

    void Update()
    {
        // Smooth fill
        _fillImage.fillAmount = Mathf.MoveTowards(
            _fillImage.fillAmount, _currentFill, _smoothSpeed * Time.deltaTime);

        // Follow target
        if (_target)
            transform.position = _mainCam.WorldToScreenPoint(_target.position + _offset);
    }
}
```

## Drag and Drop (Inventory)

```csharp
public class DraggableItem : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler
{
    Transform _originalParent;
    CanvasGroup _canvasGroup;

    void Awake() => _canvasGroup = GetComponent<CanvasGroup>();

    public void OnBeginDrag(PointerEventData eventData)
    {
        _originalParent = transform.parent;
        transform.SetParent(GetComponentInParent<Canvas>().transform); // Move to top
        _canvasGroup.blocksRaycasts = false;
    }

    public void OnDrag(PointerEventData eventData)
    {
        transform.position = eventData.position;
    }

    public void OnEndDrag(PointerEventData eventData)
    {
        _canvasGroup.blocksRaycasts = true;

        // Check if dropped on valid slot
        var slot = eventData.pointerEnter?.GetComponent<InventorySlot>();
        if (slot != null && slot.CanAccept(this))
        {
            slot.PlaceItem(this);
        }
        else
        {
            // Return to original slot
            transform.SetParent(_originalParent);
            transform.localPosition = Vector3.zero;
        }
    }
}

public class InventorySlot : MonoBehaviour, IDropHandler
{
    public bool CanAccept(DraggableItem item) => transform.childCount == 0;

    public void PlaceItem(DraggableItem item)
    {
        item.transform.SetParent(transform);
        item.transform.localPosition = Vector3.zero;
    }

    public void OnDrop(PointerEventData eventData)
    {
        // Handled by DraggableItem's OnEndDrag
    }
}
```

## Canvas Performance Optimization

```
Canvas Splitting Strategy:

Canvas 1: Static HUD (health, ammo) — No rebuilds
  └── Graphic Raycaster (for clicks)

Canvas 2: Dynamic HUD (damage numbers, popups) — Frequent rebuilds
  └── Sorting Order: 1 (above static)

Canvas 3: Menus/Panels — Rebuild only when open
  └── Sorting Order: 10

Canvas 4: Screen-space effects (screen flash, fade)
  └── Sorting Order: 100
```

### Rules

- **One Canvas per "rebuild group"** — separate static from dynamic
- **Don't nest Layout Groups deeply** — each group rebuilds children
- **Use `CanvasGroup` for visibility** — cheaper than enabling/disabling GameObjects
- **Mark non-interactive elements** — `raycastTarget = false` on decorative images
