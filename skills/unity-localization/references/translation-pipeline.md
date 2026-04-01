# Translation Pipeline

## Google Sheets Integration

The most practical workflow for indie/mid-size teams:

### Setup

```
Google Sheet structure:
| Key | Context | en | zh-Hans | ja | ko |
|-----|---------|----|---------|----|-----|
| ui.start | Main menu button | Start Game | 开始游戏 | ゲーム開始 | 게임 시작 |
| ui.settings | Main menu button | Settings | 设置 | 設定 | 설정 |
| dialog.npc_01 | Blacksmith greeting | Hello, traveler! | 你好，旅行者！ | こんにちは、旅人！ | 안녕, 여행자! |
```

### Sync Script (Editor)

```csharp
#if UNITY_EDITOR
[MenuItem("GameForge/Localization/Sync from Google Sheets")]
static async void SyncFromSheets()
{
    string sheetId = "YOUR_SHEET_ID";
    string url = $"https://docs.google.com/spreadsheets/d/{sheetId}/export?format=csv";

    using var client = new HttpClient();
    string csv = await client.GetStringAsync(url);

    // Parse CSV and update string tables
    var lines = csv.Split('\n');
    var headers = lines[0].Split(',');

    var collection = LocalizationEditorSettings.GetStringTableCollection("UI_Strings");

    for (int i = 1; i < lines.Length; i++)
    {
        var cols = lines[i].Split(',');
        string key = cols[0].Trim('"');

        for (int lang = 2; lang < headers.Length && lang < cols.Length; lang++)
        {
            string localeCode = headers[lang].Trim('"').Trim();
            string value = cols[lang].Trim('"');
            var table = collection.GetTable(new LocaleIdentifier(localeCode)) as StringTable;
            table?.AddEntry(key, value);
        }
    }

    EditorUtility.SetDirty(collection);
    Debug.Log($"Synced {lines.Length - 1} entries from Google Sheets");
}
#endif
```

## XLIFF Workflow (Professional)

XLIFF (XML Localization Interchange File Format) is the industry standard for professional translation.

```
1. Export XLIFF from Unity: Localization Tables → Export → XLIFF
2. Send to translation agency / CAT tool (memoQ, Trados, Memsource)
3. Translators work in their tool with translation memory
4. Receive translated XLIFF back
5. Import: Localization Tables → Import → XLIFF
```

### Advantages over CSV

- Translation memory (reuse previous translations)
- Context notes per string
- Plural forms support
- State tracking (translated, reviewed, final)

## Pseudo-Localization (QA)

Catches hardcoded strings and layout issues before real translation.

```csharp
// Enable in Localization Settings → Pseudo-Locale
// Transforms: "Settings" → "[Šéttîñgš]" (accented, bracketed, expanded)
```

What it catches:
- Hardcoded strings (not going through localization system)
- Text overflow (pseudo adds ~30% length)
- Character encoding issues
- Concatenated strings (broken word order)

### Custom Pseudo-Locale

```
Project Settings → Localization → Add Locale → "Pseudo"
Pseudo-Locale Settings:
  - Accenter: ✅ (replaces chars with accented versions)
  - Encapsulator: ✅ (wraps in brackets [])
  - Expander: ✅ (adds ~30% padding)
```

## Translation Best Practices

| Practice | Why |
|----------|-----|
| Add context column | Translators need to know where text appears |
| Never concatenate | "You have " + count + " items" breaks in many languages |
| Use Smart Strings | `{count} items` handles plurals properly |
| Provide screenshots | Visual context prevents mistranslation |
| Use gender-neutral language | Reduces variant count |
| Keep keys descriptive | `ui.main_menu.start_button` > `str_001` |
| Freeze strings before translation | Changing source = re-translation cost |
