# GameForge Proposal (GFP) Template

Use this template to propose new skills, spec changes, or ecosystem improvements.

## Process

1. Copy this template to `proposals/GFP-XXXX-short-title.md`
2. Fill in all sections
3. Open a Pull Request to `gameforge-skills` repo
4. Community discusses in PR comments
5. Maintainers approve/reject with reasoning

## Template

```markdown
# GFP-XXXX: {Title}

**Author:** {GitHub username}
**Status:** Draft | Discussion | Accepted | Rejected | Implemented
**Created:** {YYYY-MM-DD}
**Engine:** unity | unreal | godot | any

## Summary

{One paragraph: what are you proposing and why?}

## Motivation

{Why does this need to exist? What problem does it solve? Who benefits?}

## Detailed Design

{Technical details. For new skills: what references would it include? For spec changes: what fields change and why?}

## Alternatives Considered

{What other approaches did you consider? Why is this one better?}

## Compatibility

{Does this break existing skills? Does it require CLI changes?}

## Implementation Plan

{Who will implement this? Rough timeline? Can it be done incrementally?}
```

## GFP Categories

| Prefix | Category | Example |
|--------|----------|---------|
| GFP-1xxx | New Skill | GFP-1001: unity-cinemachine skill |
| GFP-2xxx | Spec Change | GFP-2001: add render_pipeline field |
| GFP-3xxx | CLI/Tooling | GFP-3001: `gameforge doctor` command |
| GFP-4xxx | Ecosystem | GFP-4001: third-party skill registry |
| GFP-5xxx | Pack | GFP-5001: mobile-mmo pack |

## Labels

Use GitHub Issue labels for tracking:
- `gfp:draft` — initial proposal
- `gfp:discussion` — open for community input
- `gfp:accepted` — approved, ready for implementation
- `gfp:rejected` — declined with reasoning
- `gfp:implemented` — done and merged
