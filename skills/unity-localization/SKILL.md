---
name: unity-localization
version: 2.0.0
description: "Set up Unity Localization package for multi-language support with string tables, asset localization, and translation workflows"
engine: unity
category: ui
license: Apache-2.0

interface:
  input:
    required:
      - localization_scope            # which content needs localization
    optional:
      - language_list                 # target languages
      - translation_workflow          # csv, xliff, google-sheets
      - rtl_required                  # true/false for Arabic/Hebrew
      - cjk_required                  # true/false for Chinese/Japanese/Korean

  output:
    - type: configuration             # Locale settings, string tables
    - type: code                      # Localization scripts
    - type: architecture              # Localization workflow design

  context_blocks:
    - id: localization-setup
      description: "Configure Localization package and string tables"
      references: [localization-setup.md]
    - id: cjk-rtl
      description: "Handle CJK fonts and RTL layout"
      references: [cjk-rtl-guide.md]
    - id: translation-pipeline
      description: "Set up translation workflow with external tools"
      references: [translation-pipeline.md]

references:
  - file: references/localization-setup.md
    relevance: [localization, string-table, smart-string, csv, locale]
    size: 2KB
    priority: high
  - file: references/cjk-rtl-guide.md
    relevance: [cjk, rtl, font, fallback, textmeshpro, arabic, hebrew]
    size: 3KB
    priority: medium
  - file: references/translation-pipeline.md
    relevance: [translation, pipeline, google-sheets, xliff, qa]
    size: 4KB
    priority: medium

triggers:
  keywords:
    - "localization"
    - "internationalization"
    - "i18n"
    - "multi-language"
    - "translation"
    - "string table"
    - "locale"
    - "cjk"
    - "rtl"
    - "font fallback"
  files:
    - "Assets/Localization/**"
    - "**/Localization*.cs"
    - "**/*Localized*.cs"
  context:
    - has_unity_project: true

composition:
  combines_with:
    - unity-ui                   # localized UI text
    - unity-addressables         # localized asset delivery
    - unity-build                # localization in CI/CD
  depends_on: []
  conflicts_with: []
  provides:
    - localization-system
    - translation-workflow
    - multi-language-support

engine_versions:
  unity:
    minimum: "2021.3"
    recommended: "2022.3"
    tested: ["2021.3", "2022.3", "6000.0"]
  platforms: [windows, macos, linux, ios, android, webgl]
  render_pipelines: [built-in, urp, hdrp]
---

# unity-localization

Set up Unity Localization package for multi-language support with string tables, asset localization, and translation workflows.

## When to use

Activate when the user mentions:
- Localization, internationalization (i18n), multi-language
- String tables, localized strings
- Smart Strings, dynamic text formatting
- Asset localization (sprites, audio, fonts per language)
- CSV/XLIFF translation workflow
- RTL (right-to-left) language support
- Pseudo-localization testing
- Font fallback for CJK characters

## Capabilities

1. **Package setup** — Locale configuration, string/asset tables
2. **String tables** — Key-value localization with Smart Strings
3. **Asset tables** — Localized sprites, audio, fonts
4. **Translation workflow** — CSV/XLIFF export/import for translators
5. **Runtime switching** — Change language at runtime
6. **CJK support** — Font fallback, text overflow handling
7. **RTL support** — Arabic/Hebrew layout considerations

## Architecture Decision Guide

| Need | Solution |
|------|----------|
| Simple game, < 500 strings | Unity Localization package |
| Large game, 5000+ strings | Unity Localization + Google Sheets pipeline |
| Already using I2 Localization | Keep it (mature, well-supported) |
| Need runtime string generation | Smart Strings with arguments |
| Localized voice acting | Asset Tables with AudioClip |

## Unity version support

| Version | Status |
|---------|--------|
| Unity 6+ | ✅ Full (Localization 1.5+) |
| 2022.3 LTS | ✅ Full |
| 2021.3 LTS | ✅ Supported (Localization 1.3) |

## References

- [localization-setup.md](references/localization-setup.md) — Package setup, string tables, Smart Strings, CSV workflow
- [cjk-rtl-guide.md](references/cjk-rtl-guide.md) — CJK font handling, RTL layout, text overflow, font fallback
- [translation-pipeline.md](references/translation-pipeline.md) — Google Sheets integration, XLIFF, translation memory, QA

## Limitations

- Unity Localization package has higher memory overhead than I2 Localization
- No built-in machine translation — use external services
- RTL support requires TextMeshPro with RTL override
- Font atlases for CJK can be very large (10MB+ per font)
