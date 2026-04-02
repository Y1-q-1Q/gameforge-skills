---
name: unity-testing
version: 2.0.0
description: "Set up Unity Test Framework with EditMode and PlayMode tests, test architecture, and CI integration"
engine: unity
category: testing
license: Apache-2.0

interface:
  input:
    required:
      - testing_scope                 # what needs testing
    optional:
      - test_types                    # editmode, playmode, both
      - ci_integration                # true/false
      - coverage_required             # true/false

  output:
    - type: code                      # test scripts, test utilities
    - type: configuration             # test assembly definitions
    - type: architecture              # test architecture design

  context_blocks:
    - id: test-framework
      description: "Set up Unity Test Framework and project structure"
      references: [test-framework.md]
    - id: game-test-patterns
      description: "Learn patterns for testing game systems"
      references: [game-test-patterns.md]
    - id: ci-testing
      description: "Integrate tests into CI/CD pipeline"
      references: [ci-testing.md]

references:
  - file: references/test-framework.md
    relevance: [testing, editmode, playmode, nunit, framework]
    size: 3KB
    priority: high
  - file: references/game-test-patterns.md
    relevance: [testing, patterns, state-machine, events, async, scriptableobject]
    size: 5KB
    priority: high
  - file: references/ci-testing.md
    relevance: [ci, testing, automation, coverage, reporting]
    size: 3KB
    priority: medium

triggers:
  keywords:
    - "testing"
    - "test"
    - "unit test"
    - "integration test"
    - "editmode"
    - "playmode"
    - "nunit"
    - "test framework"
    - "tdd"
    - "code coverage"
    - "automated test"
  files:
    - "Assets/Tests/**/*.cs"
    - "**/*Tests*.cs"
    - "**/*Test*.cs"
  context:
    - has_unity_project: true

composition:
  combines_with:
    - unity-build                # CI test automation
    - unity-architect            # testable architecture
    - unity-performance          # performance regression tests
  depends_on: []
  conflicts_with: []
  provides:
    - test-framework
    - test-patterns
    - ci-testing

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android, webgl]
  render_pipelines: [built-in, urp, hdrp]
---

# unity-testing

Set up Unity Test Framework with EditMode and PlayMode tests, test architecture, and CI integration.

## When to use

Activate when the user mentions:
- Unit testing, integration testing in Unity
- EditMode tests, PlayMode tests
- NUnit, Unity Test Framework
- Test-driven development (TDD) for games
- CI test automation
- Code coverage
- Testing game systems (inventory, combat, AI)

## Capabilities

1. **Test setup** — Assembly definitions, test project structure
2. **EditMode tests** — Pure logic testing (fast, no Play Mode)
3. **PlayMode tests** — MonoBehaviour, physics, coroutine testing
4. **Test patterns** — Game-specific patterns (state machines, events, async)
5. **CI integration** — Running tests in GitHub Actions / Jenkins
6. **Coverage** — Code coverage analysis and reporting

## Architecture Decision Guide

| What to Test | Mode | Priority |
|-------------|------|----------|
| Core game logic (damage calc, inventory) | EditMode | High |
| State machines | EditMode | High |
| Serialization (save/load) | EditMode | High |
| MonoBehaviour integration | PlayMode | Medium |
| UI flows | PlayMode | Low (fragile) |
| Visual correctness | Manual / Screenshot | Low |

## Unity version support

| Version | Status |
|---------|--------|
| Unity 6+ | ✅ Full (Test Framework 2.0) |
| 2022.3 LTS | ✅ Full |
| 2021.3 LTS | ✅ Supported |

## References

- [test-framework.md](references/test-framework.md) — EditMode/PlayMode tests, NUnit patterns, what to test
- [game-test-patterns.md](references/game-test-patterns.md) — Testing state machines, events, async, ScriptableObjects
- [ci-testing.md](references/ci-testing.md) — Automated testing in CI, code coverage, test reporting

## Limitations

- PlayMode tests are slow (require Play Mode startup)
- Testing visual/rendering correctness is hard to automate
- Physics tests can be flaky due to floating-point timing
- UI tests are fragile and break with layout changes
