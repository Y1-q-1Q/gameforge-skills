# CJK & RTL Language Guide

## CJK Font Handling (Chinese, Japanese, Korean)

### The Problem

CJK character sets are massive:
- Chinese (Simplified): ~6,763 common characters (GB2312)
- Chinese (Full): ~20,000+ characters
- Japanese: ~2,136 Jōyō kanji + hiragana + katakana
- Korean: ~11,172 Hangul syllables

A full CJK font atlas at reasonable quality = 10-50MB.

### Solution: Dynamic Font Atlas (TextMeshPro)

```
TMP Settings → Default Font Asset → Enable Dynamic SDF
```

```csharp
// Create dynamic font asset at runtime
var fontAsset = TMP_FontAsset.CreateFontAsset(
    font,
    90,           // sampling point size
    9,            // padding
    GlyphRenderMode.SDFAA,
    1024, 1024    // atlas size
);
fontAsset.atlasPopulationMode = AtlasPopulationMode.Dynamic;
```

Dynamic atlas only generates glyphs as they're used — starts small, grows on demand.

### Font Fallback Chain

```
Primary: Noto Sans (Latin, Cyrillic)
  └── Fallback 1: Noto Sans SC (Simplified Chinese)
      └── Fallback 2: Noto Sans JP (Japanese)
          └── Fallback 3: Noto Sans KR (Korean)
              └── Fallback 4: Noto Sans Arabic
```

In TMP: Font Asset → Fallback Font Assets list.

### Memory Budget for Fonts

| Strategy | Memory | Coverage |
|----------|--------|----------|
| Static atlas (all chars) | 20-50 MB | Complete |
| Dynamic atlas (1024x1024) | 4 MB start | On-demand |
| Dynamic atlas (2048x2048) | 16 MB start | On-demand |
| Subset (common 3000 chars) | 5-8 MB | 99% of text |

**Recommendation**: Dynamic atlas 2048x2048 + font fallback chain.

## RTL (Right-to-Left) Support

### Languages

- Arabic (العربية)
- Hebrew (עברית)
- Persian/Farsi (فارسی)
- Urdu (اردو)

### TextMeshPro RTL Setup

```
TMP Text component → Enable RTL Editor
Extra Settings → Text Direction: Right-to-Left
```

### Layout Considerations

```
LTR layout:          RTL layout:
[Icon] [Text]  →     [Text] [Icon]
[←] [→]       →     [→] [←]
[Progress →]   →     [← Progress]
```

```csharp
// Flip horizontal layout group for RTL
var layoutGroup = GetComponent<HorizontalLayoutGroup>();
if (LocalizationSettings.SelectedLocale.Identifier.Code is "ar" or "he" or "fa")
{
    layoutGroup.reverseArrangement = true;
    layoutGroup.childAlignment = TextAnchor.MiddleRight;
}
```

### Bidirectional Text (Bidi)

Mixed LTR+RTL text (e.g., Arabic with English words or numbers):

```
Arabic text: "لقد حصلت على 100 نقطة في Level 5"
Display:     "Level 5 في نقطة 100 على حصلت لقد"
```

TextMeshPro handles basic bidi. For complex cases, use ICU bidi algorithm.

## Text Overflow Handling

Different languages have very different text lengths:

| Language | Relative Length (vs English) |
|----------|----------------------------|
| German | 130-150% |
| French | 115-130% |
| Chinese | 50-70% (fewer chars, same meaning) |
| Japanese | 60-80% |
| Korean | 80-100% |
| Arabic | 80-120% |
| Russian | 110-130% |

### UI Design Rules

- **Never fixed-width text boxes** — use auto-size or scroll
- **Test with German** — usually the longest European language
- **Min font size**: Set TMP auto-size min to readable level (12-14pt mobile)
- **Ellipsis**: Enable overflow mode "Ellipsis" for constrained spaces

```csharp
// Auto-size with bounds
tmpText.enableAutoSizing = true;
tmpText.fontSizeMin = 14;
tmpText.fontSizeMax = 24;
tmpText.overflowMode = TextOverflowModes.Ellipsis;
```
