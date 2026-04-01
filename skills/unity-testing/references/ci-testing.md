# CI Testing & Code Coverage

## GitHub Actions Test Runner

```yaml
name: Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true

      - uses: game-ci/unity-test-runner@v4
        id: tests
        env:
          UNITY_LICENSE: ${{ secrets.UNITY_LICENSE }}
        with:
          testMode: all  # editmode, playmode, or all
          artifactsPath: test-results
          coverageOptions: 'generateAdditionalMetrics;generateHtmlReport;generateBadgeReport;assemblyFilters:+Assembly-CSharp'

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: Test Results
          path: test-results

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: Coverage Report
          path: CodeCoverage
```

## Test Assembly Structure

```
Assets/
├── Scripts/
│   ├── Runtime/
│   │   ├── MyGame.asmdef          ← Production code
│   │   └── ...
│   └── Tests/
│       ├── EditMode/
│       │   ├── MyGame.Tests.EditMode.asmdef
│       │   └── InventoryTests.cs
│       └── PlayMode/
│           ├── MyGame.Tests.PlayMode.asmdef
│           └── PlayerMovementTests.cs
```

### EditMode Test Assembly Definition

```json
{
    "name": "MyGame.Tests.EditMode",
    "rootNamespace": "MyGame.Tests",
    "references": ["MyGame"],
    "includePlatforms": ["Editor"],
    "optionalUnityReferences": ["TestAssemblies"]
}
```

### PlayMode Test Assembly Definition

```json
{
    "name": "MyGame.Tests.PlayMode",
    "rootNamespace": "MyGame.Tests",
    "references": ["MyGame"],
    "includePlatforms": [],
    "optionalUnityReferences": ["TestAssemblies"]
}
```

## Code Coverage

### Enable Coverage

```
Window → General → Code Coverage
Enable Code Coverage ✅
```

### Coverage Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Core game logic | > 80% | Critical, easy to test |
| Data models | > 90% | Pure data, must be correct |
| State machines | > 85% | All transitions covered |
| Utility functions | > 90% | Reused everywhere |
| MonoBehaviour glue | > 30% | Hard to test, less value |
| UI code | > 10% | Fragile tests, low ROI |

### Coverage in CI

```yaml
# Add to game-ci/unity-test-runner
coverageOptions: >-
  generateAdditionalMetrics;
  generateHtmlReport;
  generateBadgeReport;
  assemblyFilters:+Assembly-CSharp;
  pathFilters:-*/Tests/*
```

## Running Tests from Command Line

```bash
# EditMode tests
Unity -batchmode -nographics -runTests -testPlatform EditMode \
  -testResults results-editmode.xml -projectPath .

# PlayMode tests
Unity -batchmode -nographics -runTests -testPlatform PlayMode \
  -testResults results-playmode.xml -projectPath .
```

## Test Naming Convention

```csharp
// Pattern: MethodName_Scenario_ExpectedResult
[Test] public void TakeDamage_WhenShielded_ReducesDamageByHalf() { }
[Test] public void AddItem_WhenInventoryFull_ReturnsFalse() { }
[Test] public void Transition_FromIdleToChase_WhenPlayerDetected() { }
```

## What NOT to Test

- Unity's built-in systems (physics engine, rendering)
- Third-party plugins (test your integration, not their code)
- Visual appearance (use screenshot comparison tools instead)
- Exact floating-point values (use `Assert.AreEqual(expected, actual, tolerance)`)
