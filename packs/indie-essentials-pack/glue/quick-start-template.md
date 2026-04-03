# Quick-Start Project Template

## One-Command Setup

```bash
# Clone template
git clone https://github.com/Y1-q-1Q/gameforge-indie-template MyGame
cd MyGame

# Setup Unity project
# (Open in Unity 2022.3 LTS)
```

## Pre-Wired Systems

### Scene Structure
```
BootStrap (first scene)
├── GameManager (persists)
├── AudioManager
├── InputManager
└── SaveManager

MainMenu
├── UI Canvas
│   ├── MainMenuController
│   └── SettingsPanel

GameLevel (template)
├── PlayerSpawn
├── GameplaySystems
│   ├── PlayerController
│   ├── CameraSystem
│   └── GameLoop
└── UI Canvas
    ├── HUDController
    └── PauseMenu
```

### Included Scripts

| Script | Purpose |
|--------|---------|
| `GameManager.cs` | Scene flow, state machine |
| `SaveManager.cs` | Auto-save, load profiles |
| `AudioManager.cs` | Music, SFX, pooling |
| `InputHandler.cs` | Device abstraction |
| `UIManager.cs` | Screen navigation |

### First Playable Checklist

Day 1:
- [ ] Player can move
- [ ] Basic camera follows
- [ ] One interaction works
- [ ] Can restart level

Day 2-3:
- [ ] Core loop complete
- [ ] Win/lose conditions
- [ ] Basic UI feedback
- [ ] Can play for 5 minutes

## Customization Guide

### Change Game Genre
1. Replace `PlayerController` with genre-specific script
2. Modify `GameLoop` rules
3. Update UI layouts

### Add New Input
```csharp
// In InputHandler.cs
public void OnAttack(InputAction.CallbackContext context) {
    if (context.performed) {
        GameEvents.RaiseAttack();
    }
}
```

### Setup Save Data
```csharp
// In SaveData.cs
[System.Serializable]
public class GameProgress {
    public int currentLevel;
    public float playTime;
    public Dictionary<string, bool> unlocked;
}
```
