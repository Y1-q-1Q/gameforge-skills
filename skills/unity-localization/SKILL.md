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
