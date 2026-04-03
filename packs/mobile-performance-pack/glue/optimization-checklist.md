# Mobile Optimization Checklist

## Pre-Submission Verification

### Performance
- [ ] 30fps stable on entry-level devices
- [ ] 60fps on target mid-range devices
- [ ] No thermal throttling in 30-min session
- [ ] Battery drain <15%/hour
- [ ] Memory usage <1GB on mid-tier

### Launch Times
- [ ] Cold start <5 seconds
- [ ] First scene load <3 seconds
- [ ] Subsequent level loads <2 seconds

### App Store Compliance

#### iOS App Store
- [ ] Launch time <20 seconds (Apple requirement)
- [ ] Memory warning handling implemented
- [ ] Background audio suspended properly
- [ ] iOS version support: iOS 13+

#### Google Play
- [ ] Android Vitals: ANR rate <0.47%
- [ ] Android Vitals: Crash rate <1.09%
- [ ] 64-bit architecture support (arm64-v8a)
- [ ] Android version support: API 24+

## Testing Coverage

| Device | iOS Version | Android Version | Status |
|--------|-------------|-----------------|--------|
| iPhone SE (2022) | 16.x | - | [ ] |
| iPhone 13 | 17.x | - | [ ] |
| iPhone 15 Pro | 17.x | - | [ ] |
| Pixel 6 | - | 14 | [ ] |
| Galaxy S23 | - | 14 | [ ] |
| Redmi Note 12 | - | 13 | [ ] |
