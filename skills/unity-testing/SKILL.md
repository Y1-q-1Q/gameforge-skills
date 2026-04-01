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
