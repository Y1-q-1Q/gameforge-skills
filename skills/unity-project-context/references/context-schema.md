# PROJECT.md Generation Schema

## Auto-Detection Rules

When scanning a Unity project, extract and organize:

### 1. Project Identity
```markdown
# {ProjectName}

**Engine**: Unity {version}
**Render Pipeline**: {URP|HDRP|BiRP}
**Scripting Backend**: {IL2CPP|Mono}
**Target Platforms**: {Android, iOS, Windows, ...}
**Package Manager**: {list key packages}
```

Detection sources:
- `ProjectSettings/ProjectVersion.txt` → Unity version
- `Packages/manifest.json` → packages, render pipeline
- `ProjectSettings/ProjectSettings.asset` → scripting backend, platforms

### 2. Architecture Overview
```markdown
## Architecture

**Pattern**: {MVC|ECS|Hybrid|Custom}
**Entry Point**: {main scene or bootstrap class}
**Scene Flow**: {scene list and transitions}
**Assembly Definitions**: {list .asmdef files}
```

Detection:
- Scan for `*.asmdef` files → assembly structure
- Look for common patterns: GameManager, Bootstrap, SceneLoader
- Check for ECS packages → DOTS architecture
- Check for Zenject/VContainer → DI pattern

### 3. Key Systems
```markdown
## Systems

| System | Implementation | Key Files |
|--------|---------------|-----------|
| Networking | {Netcode/Mirror/Custom} | {paths} |
| Asset Loading | {Addressables/Resources/Bundles} | {paths} |
| UI | {UGUI/UI Toolkit} | {paths} |
| Audio | {FMOD/Wwise/Unity Audio} | {paths} |
| Localization | {Unity Localization/I2/Custom} | {paths} |
```

Detection:
- Package dependencies reveal middleware choices
- Folder names and namespaces reveal system boundaries

### 4. Build Configuration
```markdown
## Build

**Hot Update**: {HybridCLR|None}
**CI/CD**: {GitHub Actions|Jenkins|Unity Cloud Build}
**Addressable Groups**: {list groups}
**Build Targets**: {list with settings}
```

### 5. Conventions (Auto-Detected)
```markdown
## Conventions

**Naming**:
- Classes: PascalCase
- Private fields: _camelCase / m_camelCase
- Constants: UPPER_SNAKE / PascalCase

**Folder Structure**:
- By feature / By type / Hybrid

**Patterns Detected**:
- Singleton usage: {yes/no, which classes}
- Event system: {UnityEvent/C# events/ScriptableObject events/custom}
- Dependency injection: {Zenject/VContainer/manual}
```

Detection:
- Sample 20+ C# files for naming patterns
- Analyze folder structure depth and organization
- Grep for common pattern signatures

## Refresh Strategy

PROJECT.md should be regenerated when:
- Major package added/removed
- New assembly definition created
- Significant architecture change
- User requests refresh

Keep it under 200 lines — this is a summary, not documentation.
