# Network ↔ HotUpdate Bridge

Integration guide for running multiplayer networking code inside HybridCLR hot-update assemblies.

## Assembly Splitting Strategy

The critical question: which networking code goes in hot-update DLLs vs AOT assemblies?

### Rule of Thumb

```
AOT (cannot hot-update):
├── Transport layer (UDP/TCP socket code)
├── Low-level serialization (byte readers/writers)
├── NetworkManager bootstrap
└── Connection state machine

Hot-Update (can hot-update):
├── Game-specific message definitions
├── RPC handlers (gameplay logic)
├── Sync components (NetworkBehaviour subclasses)
├── Matchmaking / lobby logic
└── Anti-cheat validation rules
```

### Why this split?

- Transport layer changes require app store update anyway (native socket APIs)
- Message definitions change frequently (balance patches, new features)
- RPC handlers are pure gameplay logic — the most common hot-fix target
- Sync components define what state to replicate — changes with every feature

### Assembly Definition Setup

```
Assemblies/
├── Game.Network.Core.asmdef          # AOT — transport, serialization
│   ├── References: Unity.Netcode.Runtime
│   └── HybridCLR: false
├── Game.Network.Messages.asmdef      # HOT — message definitions
│   ├── References: Game.Network.Core
│   └── HybridCLR: true
├── Game.Network.Gameplay.asmdef      # HOT — RPCs, sync components
│   ├── References: Game.Network.Core, Game.Network.Messages
│   └── HybridCLR: true
└── Game.Network.Lobby.asmdef         # HOT — matchmaking, rooms
    ├── References: Game.Network.Core
    └── HybridCLR: true
```

## Protocol Versioning

When hot-update changes message formats, old and new clients must coexist.

### Version-Aware Message Header

```csharp
// AOT assembly — never changes
public struct MessageHeader
{
    public ushort MessageId;
    public ushort ProtocolVersion;
    public int PayloadLength;

    public const ushort CURRENT_VERSION = 3;
}
```

### Server-Side Version Router

```csharp
// HOT assembly — can be updated
public class VersionedMessageRouter
{
    private readonly Dictionary<ushort, IMessageHandler>[] _versionedHandlers;

    public void RegisterHandler<T>(ushort version, ushort msgId, Action<T> handler)
        where T : INetworkMessage, new()
    {
        // Register handler for specific protocol version
    }

    public void Route(MessageHeader header, byte[] payload)
    {
        var version = Math.Min(header.ProtocolVersion, MessageHeader.CURRENT_VERSION);
        if (_versionedHandlers[version].TryGetValue(header.MessageId, out var handler))
            handler.Handle(payload);
        else
            HandleUnknownMessage(header); // graceful degradation
    }
}
```

### Client Version Negotiation

```
Client connects → sends HELLO(clientVersion=2)
Server responds → WELCOME(serverVersion=3, minSupported=1, features=[...])
Client checks  → if clientVersion >= minSupported: proceed
                  else: force update prompt
```

## Reconnection After Hot-Update

The hardest problem: player is in a match, hot-fix drops.

### Flow

```
1. Server pushes UPDATE_AVAILABLE notification
2. Client saves local state snapshot (position, inventory, buffs)
3. Client downloads hot-update DLLs via Addressables
4. HybridCLR loads new assemblies
5. Client sends RECONNECT(matchId, lastSeqNum, stateHash)
6. Server validates stateHash, sends delta since lastSeqNum
7. Client applies delta, resumes gameplay
```

### State Snapshot for Reconnection

```csharp
// HOT assembly
[Serializable]
public class ReconnectSnapshot
{
    public string MatchId;
    public ulong LastServerSequence;
    public byte[] LocalStateHash;
    public Dictionary<string, byte[]> ComponentStates;

    public static ReconnectSnapshot Capture(NetworkManager nm)
    {
        var snapshot = new ReconnectSnapshot
        {
            MatchId = nm.CurrentMatchId,
            LastServerSequence = nm.LastProcessedSequence,
        };
        // Serialize all NetworkBehaviour states
        foreach (var obj in nm.SpawnedObjects)
            snapshot.ComponentStates[obj.NetworkObjectId.ToString()] = obj.SerializeState();
        snapshot.LocalStateHash = ComputeHash(snapshot.ComponentStates);
        return snapshot;
    }
}
```

## Addressables Integration

Hot-update DLLs are delivered as Addressable assets.

### Catalog Structure

```
RemoteCatalog/
├── v1.0.0/
│   ├── Game.Network.Messages.dll.bytes
│   ├── Game.Network.Gameplay.dll.bytes
│   └── Game.Network.Lobby.dll.bytes
├── v1.0.1/    ← hot-fix
│   ├── Game.Network.Gameplay.dll.bytes    ← only changed DLL
│   └── patch-manifest.json
└── latest.json → { "version": "1.0.1", "mandatory": false }
```

### Differential Update Check

```csharp
public async Task<bool> CheckAndApplyUpdate()
{
    var manifest = await Addressables.LoadAssetAsync<TextAsset>("latest.json");
    var latest = JsonUtility.FromJson<VersionManifest>(manifest.text);

    if (latest.Version == CurrentVersion) return false;

    // Download only changed DLLs
    foreach (var dll in latest.ChangedAssemblies)
    {
        var bytes = await Addressables.LoadAssetAsync<TextAsset>(dll.Key);
        HybridCLR.RuntimeApi.LoadMetadataForAOTAssembly(bytes.bytes, HomologousImageMode.SuperSet);
    }
    return true;
}
```
