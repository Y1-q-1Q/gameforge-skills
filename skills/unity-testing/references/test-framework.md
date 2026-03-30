# Unity Test Framework

## Setup

```
com.unity.test-framework
```

Two test modes:
- **EditMode** — Runs in editor, no Play Mode. For pure logic, utilities, data.
- **PlayMode** — Runs in Play Mode. For MonoBehaviours, coroutines, physics.

## EditMode Test Example

```csharp
using NUnit.Framework;

[TestFixture]
public class InventoryTests
{
    private InventoryModel _inventory;

    [SetUp]
    public void Setup()
    {
        _inventory = new InventoryModel(maxSlots: 10);
    }

    [Test]
    public void AddItem_IncreasesCount()
    {
        var item = new ItemData { Id = "sword_01", Name = "Iron Sword" };
        _inventory.AddItem(item);
        Assert.AreEqual(1, _inventory.Items.Count);
    }

    [Test]
    public void AddItem_WhenFull_ReturnsFalse()
    {
        for (int i = 0; i < 10; i++)
            _inventory.AddItem(new ItemData { Id = $"item_{i}" });

        bool result = _inventory.AddItem(new ItemData { Id = "overflow" });
        Assert.IsFalse(result);
        Assert.AreEqual(10, _inventory.Items.Count);
    }

    [Test]
    public void RemoveItem_DecreasesCount()
    {
        var item = new ItemData { Id = "sword_01" };
        _inventory.AddItem(item);
        _inventory.RemoveItem(0);
        Assert.AreEqual(0, _inventory.Items.Count);
    }

    [TestCase(100, 50, 50)]
    [TestCase(100, 100, 0)]
    [TestCase(100, 150, 0)]
    public void TakeDamage_ReducesHealth(int maxHp, int damage, int expectedHp)
    {
        var health = new HealthModel(maxHp);
        health.TakeDamage(damage);
        Assert.AreEqual(expectedHp, health.Current);
    }
}
```

## PlayMode Test Example

```csharp
using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

public class PlayerMovementTests
{
    private GameObject _player;

    [UnitySetUp]
    public IEnumerator Setup()
    {
        _player = new GameObject("Player");
        _player.AddComponent<Rigidbody2D>();
        _player.AddComponent<PlayerMovement>();
        yield return null; // Wait one frame for Awake/Start
    }

    [UnityTearDown]
    public IEnumerator TearDown()
    {
        Object.Destroy(_player);
        yield return null;
    }

    [UnityTest]
    public IEnumerator Move_ChangesPosition()
    {
        var movement = _player.GetComponent<PlayerMovement>();
        var startPos = _player.transform.position;

        movement.SetInput(Vector2.right);
        yield return new WaitForSeconds(0.5f);

        Assert.Greater(_player.transform.position.x, startPos.x);
    }
}
```

## What to Test

| Test | EditMode | PlayMode |
|------|----------|----------|
| Math/utility functions | ✅ | |
| Data models (inventory, stats) | ✅ | |
| State machines (logic only) | ✅ | |
| Serialization/deserialization | ✅ | |
| MonoBehaviour lifecycle | | ✅ |
| Physics interactions | | ✅ |
| Coroutines | | ✅ |
| UI interactions | | ✅ |
| Scene loading | | ✅ |

**Rule:** Test logic in EditMode (fast). Test Unity integration in PlayMode (slow).
