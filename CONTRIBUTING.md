# Contributing to GameForge Skills

Thank you for your interest in contributing! 🎮

## Ways to Contribute

- 🐛 **Report issues** — Found a bug in generated code? Open an issue.
- 📝 **Improve references** — Better docs = better AI output.
- 🆕 **Submit new skills** — See the skill development guide below.
- 🌐 **Translations** — Help us support more languages.
- ⭐ **Star the repo** — It helps others find us.

## Skill Development Guide

### Skill Structure

Every skill must follow this structure:

```
skills/your-skill-name/
├── SKILL.md              # Required: skill description and usage
└── references/           # Required: reference documentation
    ├── topic-1.md
    └── topic-2.md
```

### SKILL.md Requirements

Your SKILL.md must include:
1. **Title and description** — What does this skill do?
2. **When to use** — Trigger conditions
3. **Capabilities** — What it generates
4. **Usage examples** — Input → Output
5. **Supported Unity versions**
6. **References list** — Links to reference docs
7. **Limitations** — What it can't do

### Reference Documentation Requirements

- Written in Markdown
- Include working code examples (tested in Unity)
- Follow Unity C# coding conventions
- Include XML documentation comments in code
- Note Unity version compatibility where relevant

### Code Quality Standards

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
3. Follow the skill structure and quality standards
4. Test your skill with at least one AI agent
5. Submit a PR with a clear description

## Code of Conduct

Be respectful. We're all here to make game development better.

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
