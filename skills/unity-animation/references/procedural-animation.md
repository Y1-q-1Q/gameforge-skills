# Procedural Animation

## Animation Rigging Package

Unity's official solution for runtime IK and procedural constraints.

### Setup
```
Package Manager → Unity Registry → Animation Rigging
```

### Common Constraints

| Constraint | Use Case | Example |
|-----------|----------|---------|
| Two Bone IK | Hands reaching, feet placement | Pick up item, climb |
| Multi-Aim | Head/eye tracking | Look at target |
| Multi-Position | Attach to moving point | Hold weapon |
| Damped Transform | Smooth follow | Tail, cape physics |
| Chain IK | Tentacles, tails | Multi-joint chains |

### Foot IK (Ground Adaptation)

```csharp
public class FootIK : MonoBehaviour
{
    [SerializeField] float _rayDistance = 1.5f;
    [SerializeField] LayerMask _groundLayer;
    [SerializeField] Transform _leftFoot, _rightFoot;

    Animator _animator;

    void Start() => _animator = GetComponent<Animator>();

    void OnAnimatorIK(int layerIndex)
    {
        // Left foot
        if (Physics.Raycast(_leftFoot.position + Vector3.up, Vector3.down,
            out var hitL, _rayDistance, _groundLayer))
        {
            _animator.SetIKPositionWeight(AvatarIKGoal.LeftFoot, 1f);
            _animator.SetIKPosition(AvatarIKGoal.LeftFoot, hitL.point + Vector3.up * 0.05f);
            _animator.SetIKRotationWeight(AvatarIKGoal.LeftFoot, 1f);
            _animator.SetIKRotation(AvatarIKGoal.LeftFoot,
                Quaternion.LookRotation(transform.forward, hitL.normal));
        }

        // Right foot (same pattern)
        if (Physics.Raycast(_rightFoot.position + Vector3.up, Vector3.down,
            out var hitR, _rayDistance, _groundLayer))
        {
            _animator.SetIKPositionWeight(AvatarIKGoal.RightFoot, 1f);
            _animator.SetIKPosition(AvatarIKGoal.RightFoot, hitR.point + Vector3.up * 0.05f);
            _animator.SetIKRotationWeight(AvatarIKGoal.RightFoot, 1f);
            _animator.SetIKRotation(AvatarIKGoal.RightFoot,
                Quaternion.LookRotation(transform.forward, hitR.normal));
        }
    }
}
```

### Look-At IK

```csharp
void OnAnimatorIK(int layerIndex)
{
    if (_lookTarget != null)
    {
        _animator.SetLookAtWeight(1f, 0.3f, 0.6f, 1f, 0.5f);
        // (weight, bodyWeight, headWeight, eyesWeight, clampWeight)
        _animator.SetLookAtPosition(_lookTarget.position);
    }
}
```

## Procedural Walk Cycle (No Animations Needed)

For robots, spiders, or stylized characters:

```csharp
public class ProceduralLeg : MonoBehaviour
{
    [SerializeField] Transform _target;     // Where the foot wants to be
    [SerializeField] Transform _footIK;     // IK target for this leg
    [SerializeField] float _stepDistance = 0.5f;
    [SerializeField] float _stepHeight = 0.3f;
    [SerializeField] float _stepSpeed = 8f;

    Vector3 _currentPos, _targetPos, _oldPos;
    float _lerp = 1f;

    void Update()
    {
        // Check if foot needs to move
        if (Vector3.Distance(_currentPos, _target.position) > _stepDistance && _lerp >= 1f)
        {
            _oldPos = _currentPos;
            _targetPos = _target.position;
            _lerp = 0f;
        }

        if (_lerp < 1f)
        {
            _lerp += Time.deltaTime * _stepSpeed;
            _currentPos = Vector3.Lerp(_oldPos, _targetPos, _lerp);
            // Arc: lift foot during step
            _currentPos.y += Mathf.Sin(_lerp * Mathf.PI) * _stepHeight;
        }

        _footIK.position = _currentPos;
    }
}
```

Pair legs so they alternate: leg A steps only when leg B is grounded.

## Performance Tips

| Technique | Cost | When to Use |
|-----------|------|-------------|
| OnAnimatorIK | Medium (per-character) | < 20 characters |
| Animation Rigging | Medium | Complex rigs, editor preview |
| Custom Job IK | Low (Burst) | 100+ characters |
| Disable when off-screen | Free | Always |
