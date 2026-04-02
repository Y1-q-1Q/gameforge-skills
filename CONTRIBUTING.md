# Contributing to GameForge Skills

Thank you for your interest in contributing! 🎮

## Ways to Contribute

- 🐛 **Report issues** — Found a bug in generated code? Open an issue.
- 📝 **Improve references** — Better docs = better AI output.
- 🆕 **Submit new skills** — See the skill development guide below.
- 📦 **Create skill-packs** — Combine skills with glue logic for real scenarios.
- 💡 **Propose changes** — Use the GFP process for new ideas.
- ⭐ **Star the repo** — It helps others find us.

## Skill Structure (v2)

Every skill must follow this structure:

```
skills/your-skill-name/
├── SKILL.md              # Required: v2 spec with YAML frontmatter
└── references/           # Required: reference documentation
    ├── topic-1.md
    └── topic-2.md
```

See [SKILL-SPEC.md](SKILL-SPEC.md) for the complete v2 specification.

### SKILL.md v2 Requirements

Your SKILL.md YAML frontmatter must include:
1. **name, version, description** — identity
2. **engine, category, license** — classification
3. **interface** — input/output/context_blocks (LLM-agnostic)
4. **references** — with `relevance` tags and `priority` levels
5. **triggers** — keywords, files, context conditions
6. **composition** — combines_with, depends_on, conflicts_with, provides
7. **engine_versions** — compatibility matrix

The markdown body must include:
1. **When to use** — trigger conditions
2. **Capabilities** — what it generates
3. **Usage examples** — input → output
4. **References** — links to reference docs
5. **Limitations** — what it can't do

### Design Principles

- **Copy-Paste ownership** — users get source code, not dependencies
- **Vendor-neutral** — no LLM-specific prompts in skills
- **Smart loading** — tag references so agents load only what's needed
- **Composable** — declare how skills work together

## Skill-Pack Structure

```
packs/your-pack-name/
├── PACK.md               # Required: pack definition with YAML frontmatter
└── glue/                  # Required: integration logic between skills
    ├── integration-1.md
    └── integration-2.md
```

See [PACK-SPEC.md](PACK-SPEC.md) for the complete specification.

## GameForge Proposals (GFPs)

For new skills, spec changes, or ecosystem improvements:

1. Copy `proposals/GFP-TEMPLATE.md` to `proposals/GFP-XXXX-short-title.md`
2. Fill in all sections
3. Open a Pull Request
4. Community discusses in PR comments
5. Maintainers approve/reject with reasoning

## Code Quality Standards

All C# code in references must:
- ✅ Compile without errors in Unity 2021.3+
- ✅ Follow [Unity C# Style Guide](https://unity.com/how-to/naming-and-code-style-tips-c-scripting-unity)
- ✅ Include XML doc comments on public members
- ✅ Avoid GC allocations in hot paths (Update, FixedUpdate)
- ✅ Use object pooling where appropriate
- ✅ Consider mobile performance
- ❌ No `GameObject.Find()` in runtime code
- ❌ No `Resources.Load()` unless absolutely necessary
- ❌ No `foreach` on non-array collections in hot paths

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-skill-name`)
3. Follow the v2 spec and quality standards
4. Test your skill with at least one AI agent
5. Submit a PR with a clear description

## Code of Conduct

Be respectful. We're all here to make game development better.

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
