# Unity Localization Setup

## Package Installation

```
com.unity.localization
```

## Architecture

```
Localization Settings
├── Locale Sources
│   ├── en (English)
│   ├── zh-Hans (简体中文)
│   ├── ja (日本語)
│   └── ko (한국어)
├── String Tables
│   ├── UI_Strings (menus, buttons)
│   ├── Dialog_Strings (NPC dialog)
│   └── Item_Strings (item names/descriptions)
└── Asset Tables
    ├── UI_Sprites (localized images)
    └── Audio_Clips (localized voiceover)
```

## String Table Usage

```csharp
using UnityEngine.Localization;
using UnityEngine.Localization.Settings;

// In Inspector: drag LocalizedString reference
[SerializeField] private LocalizedString _welcomeText;

// Runtime
async void Start()
{
    string text = await _welcomeText.GetLocalizedStringAsync().Task;
    label.text = text;
}

// With arguments (Smart Strings)
// Table entry: "Welcome, {player-name}! You have {gold} gold."
var localizedString = new LocalizedString("UI_Strings", "welcome_message");
localizedString.Arguments = new object[] { new { playerName = "tinyfish", gold = 1000 } };
string result = await localizedString.GetLocalizedStringAsync().Task;

// Switch locale at runtime
LocalizationSettings.SelectedLocale = LocalizationSettings.AvailableLocales.GetLocale("zh-Hans");
```

## CSV Import/Export (For Translators)

```
Key,en,zh-Hans,ja
welcome,"Welcome!","欢迎！","ようこそ！"
start_game,"Start Game","开始游戏","ゲーム開始"
settings,"Settings","设置","設定"
quit,"Quit","退出","終了"
```

## Best Practices

- ✅ Use string tables, not hardcoded strings
- ✅ Design UI for longest language (German is usually longest)
- ✅ Use Smart Strings for dynamic content
- ✅ Test with pseudo-localization (catches hardcoded strings)
- ✅ Export CSV for translators, import back
- ❌ Don't concatenate localized strings (word order varies by language)
- ❌ Don't assume text direction (Arabic/Hebrew are RTL)
