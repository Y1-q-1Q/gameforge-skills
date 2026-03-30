# UI Architecture

## Panel Management System

```csharp
/// <summary>
/// Centralized UI panel manager. Handles panel lifecycle, layering, and transitions.
/// </summary>
public class UIManager : MonoBehaviour
{
    private static UIManager _instance;
    public static UIManager Instance => _instance;

    [SerializeField] private Transform _normalLayer;
    [SerializeField] private Transform _popupLayer;
    [SerializeField] private Transform _topLayer;

    private readonly Dictionary<string, UIPanel> _panelCache = new();
    private readonly Stack<UIPanel> _panelStack = new();

    private void Awake() => _instance = this;

    public async Task<T> OpenPanel<T>(string address = null) where T : UIPanel
    {
        string key = address ?? typeof(T).Name;

        if (!_panelCache.TryGetValue(key, out var panel))
        {
            // Load via Addressables
            var prefab = await Addressables.LoadAssetAsync<GameObject>(key).Task;
            var go = Instantiate(prefab, GetLayer(prefab.GetComponent<UIPanel>().Layer));
            panel = go.GetComponent<T>();
            _panelCache[key] = panel;
        }

        panel.gameObject.SetActive(true);
        _panelStack.Push(panel);
        await panel.OnOpen();
        return (T)panel;
    }

    public async Task CloseTop()
    {
        if (_panelStack.Count == 0) return;
        var panel = _panelStack.Pop();
        await panel.OnClose();
        panel.gameObject.SetActive(false);
    }

    private Transform GetLayer(UILayer layer) => layer switch
    {
        UILayer.Normal => _normalLayer,
        UILayer.Popup => _popupLayer,
        UILayer.Top => _topLayer,
        _ => _normalLayer
    };
}

public enum UILayer { Normal, Popup, Top }

/// <summary>
/// Base class for all UI panels.
/// </summary>
public abstract class UIPanel : MonoBehaviour
{
    public virtual UILayer Layer => UILayer.Normal;

    public virtual Task OnOpen()
    {
        // Override for open animation
        transform.localScale = Vector3.zero;
        LeanTween.scale(gameObject, Vector3.one, 0.2f).setEaseOutBack();
        return Task.CompletedTask;
    }

    public virtual Task OnClose()
    {
        var tcs = new TaskCompletionSource<bool>();
        LeanTween.scale(gameObject, Vector3.zero, 0.15f)
            .setEaseInBack()
            .setOnComplete(() => tcs.SetResult(true));
        return tcs.Task;
    }
}
```

## MVP Pattern for Game UI

```
Model (data)          Presenter (logic)        View (display)
InventoryModel        InventoryPresenter       InventoryView
  - items[]             - OnItemClicked()        - RefreshList()
  - gold                - OnSortChanged()        - ShowItemDetail()
  - capacity            - OnUseItem()            - UpdateGold()
  - OnChanged           - OnDropItem()           - PlayAnimation()
```

```csharp
// Model — pure data, no MonoBehaviour
public class InventoryModel
{
    public List<ItemData> Items { get; } = new();
    public int Gold { get; set; }
    public event Action OnChanged;

    public void AddItem(ItemData item)
    {
        Items.Add(item);
        OnChanged?.Invoke();
    }

    public void RemoveItem(int index)
    {
        Items.RemoveAt(index);
        OnChanged?.Invoke();
    }
}

// View — only handles display, no logic
public class InventoryView : UIPanel
{
    [SerializeField] private Transform _itemContainer;
    [SerializeField] private GameObject _itemPrefab;
    [SerializeField] private Text _goldText;

    public event Action<int> OnItemClicked;

    public void Refresh(List<ItemData> items, int gold)
    {
        // Clear and rebuild list
        foreach (Transform child in _itemContainer)
            Destroy(child.gameObject);

        for (int i = 0; i < items.Count; i++)
        {
            var go = Instantiate(_itemPrefab, _itemContainer);
            int index = i; // Capture for closure
            go.GetComponent<Button>().onClick.AddListener(() => OnItemClicked?.Invoke(index));
            go.GetComponentInChildren<Text>().text = items[i].Name;
        }

        _goldText.text = gold.ToString();
    }
}

// Presenter — connects model and view
public class InventoryPresenter
{
    private readonly InventoryModel _model;
    private readonly InventoryView _view;

    public InventoryPresenter(InventoryModel model, InventoryView view)
    {
        _model = model;
        _view = view;

        _model.OnChanged += () => _view.Refresh(_model.Items, _model.Gold);
        _view.OnItemClicked += OnItemClicked;
    }

    private void OnItemClicked(int index)
    {
        // Business logic here
        var item = _model.Items[index];
        if (item.IsUsable)
        {
            item.Use();
            _model.RemoveItem(index);
        }
    }
}
```

## Canvas Scaler Settings

| Target | UI Scale Mode | Reference Resolution | Match |
|--------|--------------|---------------------|-------|
| Mobile (portrait) | Scale With Screen Size | 1080 × 1920 | Height (1) |
| Mobile (landscape) | Scale With Screen Size | 1920 × 1080 | Width (0) |
| PC / Console | Scale With Screen Size | 1920 × 1080 | 0.5 |
| VR | Constant Physical Size | N/A | N/A |
