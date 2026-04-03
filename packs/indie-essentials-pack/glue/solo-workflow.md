# Solo Developer Workflow

## Daily Rhythm

### Morning (2-3 hours)
- **Deep work** — Core gameplay, complex systems
- No meetings, no social media
- Single task focus

### Afternoon (2-3 hours)
- **Implementation** — UI, polish, content
- Can handle interruptions
- Asset integration

### Evening (1 hour)
- **Planning** — Tomorrow's tasks
- Bug triage
- Community/marketing

## Weekly Sprint

| Day | Focus |
|-----|-------|
| Monday | Core features |
| Tuesday | Core features |
| Wednesday | Integration, testing |
| Thursday | Polish, bug fixes |
| Friday | Content, marketing |
| Weekend | Rest OR game jam |

## Project Organization

```
Assets/
├── _Project/           # Your game-specific code
│   ├── Core/          # Gameplay systems
│   ├── UI/            # Screens, HUD
│   └── Content/       # Level data, configs
├── Plugins/           # Third-party assets
└── Resources/         # Runtime-loaded assets
```

## Git Workflow

```bash
# Daily cycle
git checkout -b feature/player-movement
# ... work ...
git commit -m "Add player movement with acceleration"
git checkout main
git merge feature/player-movement
git push

# Weekly tag
git tag -a v0.3.0 -m "Week 3: Combat system"
git push origin v0.3.0
```

## Scope Management

### The "Cut List"
Keep a running list of features to cut if behind schedule:
1. Online multiplayer (cut first)
2. Procedural generation
3. Complex AI
4. Multiple endings
5. Voice acting

### MVP Definition
Define your Minimum Viable Product in one sentence:
> "A 30-minute experience where [player] does [core loop] to achieve [goal]."
