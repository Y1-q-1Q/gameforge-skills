# Dedicated Server

## Server Build Setup

### Target file (MyGame.Target.cs)

```csharp
// MyGameServer.Target.cs
public class MyGameServerTarget : TargetRules
{
    public MyGameServerTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Server;
        DefaultBuildSettings = BuildSettingsVersion.V4;
        IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_4;
        ExtraModuleNames.Add("MyGame");
    }
}
```

### Build command

```bash
# Build dedicated server (Linux)
RunUAT BuildCookRun -project=MyGame.uproject -platform=Linux \
  -server -serverplatform=Linux -noclient -build -cook -stage -pak

# Build dedicated server (Windows)
RunUAT BuildCookRun -project=MyGame.uproject -platform=Win64 \
  -server -serverplatform=Win64 -noclient -build -cook -stage -pak
```

## GameMode (Server-Only)

```cpp
UCLASS()
class AMyGameMode : public AGameModeBase
{
    GENERATED_BODY()
public:
    AMyGameMode()
    {
        DefaultPawnClass = AMyCharacter::StaticClass();
        PlayerControllerClass = AMyPlayerController::StaticClass();
    }

    virtual void PostLogin(APlayerController* NewPlayer) override
    {
        Super::PostLogin(NewPlayer);
        // Server-side: assign team, spawn inventory, etc.
        AssignTeam(NewPlayer);
    }

    virtual void Logout(AController* Exiting) override
    {
        Super::Logout(Exiting);
        // Clean up player data
        SavePlayerState(Exiting);
    }

    UFUNCTION(BlueprintCallable)
    void StartMatch()
    {
        // Only runs on server
        for (auto It = GetWorld()->GetPlayerControllerIterator(); It; ++It)
        {
            AMyPlayerController* PC = Cast<AMyPlayerController>(*It);
            if (PC) PC->ClientStartMatch();
        }
    }
};
```

## Server-Client Architecture

```
Dedicated Server (headless, no rendering):
  ├── GameMode — match rules, spawning, scoring
  ├── GameState — replicated match state (score, time, phase)
  ├── PlayerState — replicated per-player state (score, team)
  └── Authority over all actors

Client:
  ├── PlayerController — input, UI, camera
  ├── HUD / Widgets — local only
  ├── Predicted movement — client-side prediction
  └── Receives replicated state from server
```

## Containerized Deployment

```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y libssl-dev
COPY LinuxServer/ /game/
WORKDIR /game
EXPOSE 7777/udp
CMD ["./MyGameServer", "-log", "-port=7777"]
```

```yaml
# docker-compose.yml
services:
  game-server:
    build: .
    ports:
      - "7777:7777/udp"
    environment:
      - MAX_PLAYERS=16
    deploy:
      replicas: 4
```
