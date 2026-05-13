# Unity Hot-Update Release Preflight

Local read-only scanner for Unity hot-update release risk. It checks Addressables, HybridCLR, build/CI evidence, and common code patterns that often break hot-update releases.

## Command

```powershell
node skills\unity-build\scripts\unity-hot-update-preflight.mjs --project C:\Path\To\UnityProject --out report.json --markdown report.md
```

## What it checks

- `ProjectSettings/ProjectVersion.txt` Unity editor version evidence.
- `Packages/manifest.json` package evidence.
- Addressables package and `Assets/AddressableAssetsData` evidence.
- HybridCLR package/config/generated/AOT/link evidence.
- Build/CI/editor automation hints.
- Risk grep findings under `Assets`:
  - `Resources.Load` / `Resources.LoadAsync`
  - `AssetBundle.LoadFromFile` / async variant
  - hardcoded `http://` / `https://` URLs
  - `Application.persistentDataPath`
  - reflection-heavy patterns such as `Assembly.Load`, `Type.GetType`, `Invoke`, `Activator.CreateInstance`

## Status classes

- `PASS`: no configured findings.
- `WARN`: release needs engineering review/evidence mapping.
- `BLOCKED`: scanner could not inspect core Unity project files.

## Caveat

This scanner finds release-risk evidence; it does **not** guarantee release safety. A professional release still needs QA, device testing, rollback verification, CDN/version validation, and human review.

## Example acceptance flow

1. Run scanner in CI or before release branch cut.
2. Attach Markdown report to release ticket.
3. Fix `BLOCKED` findings first.
4. Map each `WARN` to one of:
   - accepted with evidence,
   - fixed before release,
   - tracked as follow-up with rollback.
5. Keep JSON report as machine-readable evidence.

## Monetizable wedge

This preflight can become a paid GameForge report when combined with:

- CLI license gate (`gameforge add unity-build --premium` / future `gameforge preflight unity`),
- professional Markdown report template,
- project-specific remediation checklist,
- optional concierge review.
