# Release Workflow

## Version Management

### Semantic Versioning for Games

```
MAJOR.MINOR.PATCH (+ build number)
1.2.3 (456)

MAJOR: New season/expansion (breaking save compatibility)
MINOR: Content update (new levels, features)
PATCH: Bug fixes, balance tweaks
Build: Auto-incremented per CI build
```

### Auto-Version from Git Tags

```csharp
#if UNITY_EDITOR
[InitializeOnLoad]
static class AutoVersion
{
    static AutoVersion()
    {
        var proc = new System.Diagnostics.Process();
        proc.StartInfo.FileName = "git";
        proc.StartInfo.Arguments = "describe --tags --always";
        proc.StartInfo.RedirectStandardOutput = true;
        proc.StartInfo.UseShellExecute = false;
        proc.Start();
        string version = proc.StandardOutput.ReadToEnd().Trim();
        proc.WaitForExit();

        if (System.Text.RegularExpressions.Regex.IsMatch(version, @"^v?\d+\.\d+\.\d+"))
        {
            version = version.TrimStart('v');
            PlayerSettings.bundleVersion = version;
        }
    }
}
#endif
```

### CI Build Number

```yaml
# GitHub Actions — use run number as build code
- name: Set build number
  run: |
    echo "BUILD_NUMBER=${{ github.run_number }}" >> $GITHUB_ENV

- uses: game-ci/unity-builder@v4
  with:
    versioning: Custom
    version: ${{ env.VERSION }}
    androidVersionCode: ${{ github.run_number }}
```

## Release Channels

```
Development → Internal Test → Closed Beta → Open Beta → Production

Git branches:
  develop → staging → release/x.y.z → main (tagged)
```

### Google Play Release Flow

```
1. Build AAB in CI
2. Upload to Internal Testing (instant, no review)
3. Promote to Closed Testing (invite testers)
4. Promote to Open Testing (public beta)
5. Promote to Production (full release, may need review)
```

### App Store Release Flow

```
1. Build Xcode project in CI (macOS runner)
2. Archive + export IPA
3. Upload via altool/Transporter
4. TestFlight internal testing (instant)
5. TestFlight external testing (needs review, ~24h)
6. Submit for App Review (~24-48h)
7. Release (manual or auto on approval)
```

### Fastlane Integration

```ruby
# fastlane/Fastfile
platform :android do
  lane :beta do
    supply(
      track: 'internal',
      aab: '../Builds/Android/game.aab',
      json_key: 'play-store-key.json'
    )
  end

  lane :release do
    supply(
      track: 'production',
      aab: '../Builds/Android/game.aab',
      json_key: 'play-store-key.json'
    )
  end
end

platform :ios do
  lane :beta do
    pilot(
      ipa: '../Builds/iOS/game.ipa',
      skip_waiting_for_build_processing: true
    )
  end
end
```

## Hotfix Flow

```
1. Branch from release tag: hotfix/1.2.4
2. Fix bug
3. Bump PATCH version
4. CI builds + test
5. Merge to main + tag
6. For mobile: submit to stores (expedited review if critical)
7. For hot-update (HybridCLR): push to CDN, no store review needed
```

## Pre-Release Checklist

- [ ] Version number updated
- [ ] All tests passing
- [ ] Build size within budget
- [ ] Performance profiled on target devices
- [ ] Crash-free rate acceptable (> 99.5%)
- [ ] Analytics events verified
- [ ] Store listing updated (screenshots, description)
- [ ] Privacy policy current
- [ ] Age rating accurate
