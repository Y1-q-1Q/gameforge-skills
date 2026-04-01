# Balance Design & Progression

## Progression Curve Types

### Linear
```
Power: ████████████████████
Level: 1  2  3  4  5  6  7  8  9  10
```
Simple, predictable. Good for: story games, short experiences.

### Exponential
```
Power: ████
       ████████
       ████████████████
       ████████████████████████████████
Level: 1     5     10    20
```
Feels rewarding early, creates power fantasy. Good for: RPGs, idle games.
Risk: Late-game numbers become meaningless (inflation).

### Logarithmic (Diminishing Returns)
```
Power: ████████████████████
       ████████████████████████
       ██████████████████████████
       ████████████████████████████
Level: 1     5     10    20
```
Early gains feel big, late gains feel small. Good for: competitive games (prevents runaway advantage).

### S-Curve
```
Power: ████
       ████████████
       ████████████████████████
       ██████████████████████████
       ████████████████████████████
Level: 1     5     10    15    20
```
Slow start → rapid growth → plateau. Good for: games with skill ceiling.

## Economy Balancing

### Source-Sink Model

```
Sources (gold enters):          Sinks (gold leaves):
  Quest rewards                   Equipment purchase
  Enemy drops                     Upgrade costs
  Daily login                     Consumables
  Achievement rewards             Repair costs
  Selling items                   Cosmetics
                                  Tax/fees

Rule: Sinks must slightly exceed sources over time.
Otherwise: inflation → currency becomes worthless.
```

### Balancing Spreadsheet Template

```
| Item | Base Cost | Level Scaling | Formula |
|------|-----------|---------------|---------|
| Health Potion | 50 | ×1.0 | 50 |
| Weapon +1 | 100 | ×1.5^level | 100, 150, 225, 337... |
| Armor +1 | 120 | ×1.5^level | 120, 180, 270, 405... |
| Skill unlock | 500 | ×2.0^tier | 500, 1000, 2000, 4000... |

Gold per hour (target): 200 + (level × 50)
Time to next upgrade: 30-60 minutes (sweet spot)
```

### The "Time to Fun" Rule

```
First 5 minutes: Player should feel powerful
First 30 minutes: Core loop fully experienced
First 2 hours: First meaningful choice/upgrade
First session: Player knows if they want to come back
```

## Difficulty Tuning

### Dynamic Difficulty Adjustment (DDA)

```csharp
public class DifficultyManager
{
    float _difficulty = 1.0f; // 0.5 = easy, 1.0 = normal, 2.0 = hard

    public void OnPlayerDeath()
    {
        _difficulty = Mathf.Max(0.5f, _difficulty - 0.1f);
    }

    public void OnPlayerDominating(float winRate)
    {
        if (winRate > 0.8f)
            _difficulty = Mathf.Min(2.0f, _difficulty + 0.05f);
    }

    public float GetEnemyHealthMultiplier() => _difficulty;
    public float GetEnemyDamageMultiplier() => 0.8f + (_difficulty * 0.4f);
    public int GetEnemyCount(int base_count) => Mathf.RoundToInt(base_count * _difficulty);
}
```

**Important**: DDA should be invisible. Players hate knowing the game is going easy on them.

### Difficulty Presets

| Preset | Enemy HP | Enemy Damage | Resources | Checkpoints |
|--------|----------|-------------|-----------|-------------|
| Story | 0.5x | 0.5x | 2x | Generous |
| Normal | 1.0x | 1.0x | 1x | Standard |
| Hard | 1.5x | 1.5x | 0.7x | Fewer |
| Nightmare | 2.0x | 2.0x | 0.5x | None |

## Common Balance Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Linear scaling in RPG | Late game feels flat | Use exponential with soft cap |
| No gold sinks | Inflation, nothing to buy | Add consumables, repair costs |
| Upgrade too cheap | Players max out too fast | Exponential cost scaling |
| Upgrade too expensive | Players feel stuck | Ensure 30-60 min per upgrade |
| One dominant strategy | Everyone plays the same | Buff alternatives, don't just nerf |
| RNG too high | Feels unfair | Add pity system / bad luck protection |
