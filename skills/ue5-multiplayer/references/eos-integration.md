# Epic Online Services (EOS) Integration

## Setup

### 1. Enable Plugin

```
Edit → Plugins → Search "Online Services" → Enable:
  - Online Services
  - Online Subsystem EOS
  - EOS Shared (auto-enabled)
```

### 2. DefaultEngine.ini

```ini
[OnlineSubsystem]
DefaultPlatformService=EOS

[OnlineSubsystemEOS]
ProductId=<your-product-id>
SandboxId=<your-sandbox-id>
DeploymentId=<your-deployment-id>
ClientId=<your-client-id>
ClientSecret=<your-client-secret>
```

Get these from [dev.epicgames.com/portal](https://dev.epicgames.com/portal).

## Session Management

```cpp
void USessionManager::CreateSession(int32 MaxPlayers)
{
    auto Sessions = Online::GetSessionInterface();
    FOnlineSessionSettings Settings;
    Settings.NumPublicConnections = MaxPlayers;
    Settings.bShouldAdvertise = true;
    Settings.bUsesPresence = true;
    Settings.Set(SETTING_MAPNAME, FString("MainMap"), EOnlineDataAdvertisementType::ViaOnlineService);

    Sessions->OnCreateSessionCompleteDelegates.AddUObject(this, &USessionManager::OnCreateComplete);
    Sessions->CreateSession(0, NAME_GameSession, Settings);
}

void USessionManager::FindSessions()
{
    auto Sessions = Online::GetSessionInterface();
    SearchSettings = MakeShareable(new FOnlineSessionSearch());
    SearchSettings->MaxSearchResults = 20;
    SearchSettings->bIsLanQuery = false;

    Sessions->OnFindSessionsCompleteDelegates.AddUObject(this, &USessionManager::OnFindComplete);
    Sessions->FindSessions(0, SearchSettings.ToSharedRef());
}

void USessionManager::OnFindComplete(bool bSuccess)
{
    if (!bSuccess) return;
    for (auto& Result : SearchSettings->SearchResults)
    {
        FString MapName;
        Result.Session.SessionSettings.Get(SETTING_MAPNAME, MapName);
        // Display in UI: MapName, Result.Session.NumOpenPublicConnections, ping
    }
}

void USessionManager::JoinSession(const FOnlineSessionSearchResult& Result)
{
    auto Sessions = Online::GetSessionInterface();
    Sessions->OnJoinSessionCompleteDelegates.AddUObject(this, &USessionManager::OnJoinComplete);
    Sessions->JoinSession(0, NAME_GameSession, Result);
}
```

## Matchmaking

```cpp
void UMatchmaker::StartMatchmaking(const FString& GameMode)
{
    // EOS matchmaking uses "buckets" for skill-based matching
    FOnlineSessionSettings Settings;
    Settings.Set(FName("GAMEMODE"), GameMode, EOnlineDataAdvertisementType::ViaOnlineService);

    // EOS handles the rest: finds players with similar skill rating,
    // creates a session, and notifies all matched players
    auto Sessions = Online::GetSessionInterface();
    Sessions->CreateSession(0, NAME_GameSession, Settings);
}
```

## Voice Chat

```cpp
// EOS Voice is built-in — just enable the plugin and:
void JoinVoiceChannel(const FString& ChannelName)
{
    auto VoiceChat = Online::GetVoiceChatInterface();
    VoiceChat->JoinChannel(ChannelName, FOnVoiceChatChannelJoinCompleteDelegate::CreateLambda(
        [](const FString& Channel, const FVoiceChatResult& Result)
        {
            if (Result.IsSuccess())
                UE_LOG(LogTemp, Log, TEXT("Joined voice channel: %s"), *Channel);
        }));
}
```
