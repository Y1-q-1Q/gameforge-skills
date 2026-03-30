# Animator & State Machine Patterns

## Animator Controller Architecture

```
Base Layer (weight=1)
├── Idle
├── Locomotion (BlendTree)
│   ├── Walk (speed 0-0.5)
│   └── Run (speed 0.5-1)
├── Jump
├── Fall
├── Land
└── Any State → Hit / Death

Override Layer: Upper Body (weight=1, mask=UpperBody)
├── Empty (default)
├── Attack_1
├── Attack_2
├── Cast
└── Block
```

## Blend Tree for Locomotion

```csharp
// Set parameters from code — Animator handles blending
public class CharacterAnimator : MonoBehaviour
{
    private Animator _animator;
    private static readonly int Speed = Animator.StringToHash("Speed");
    private static readonly int IsGrounded = Animator.StringToHash("IsGrounded");
    private static readonly int AttackTrigger = Animator.StringToHash("Attack");

    private void Awake() => _animator = GetComponent<Animator>();

    public void SetSpeed(float speed) => _animator.SetFloat(Speed, speed, 0.1f, Time.deltaTime);
    public void SetGrounded(bool grounded) => _animator.SetBool(IsGrounded, grounded);
    public void TriggerAttack() => _animator.SetTrigger(AttackTrigger);
}
```

**Key rules:**
- ✅ Always use `Animator.StringToHash` (not string parameters)
- ✅ Use `SetFloat` with dampTime for smooth transitions
- ✅ Use layers + avatar masks for upper/lower body independence
- ❌ Don't use `GetComponent<Animator>()` every frame

## Animation Events

```csharp
// Called from animation clip at specific frames
public class AttackAnimEvents : MonoBehaviour
{
    public void OnAttackHitFrame()
    {
        // Spawn hitbox, deal damage
        var hits = Physics.OverlapSphere(transform.position + transform.forward, 1.5f);
        foreach (var hit in hits)
            hit.GetComponent<IDamageable>()?.TakeDamage(10);
    }

    public void OnAttackEnd()
    {
        // Return to idle state
    }

    public void OnFootstep()
    {
        // Play footstep SFX
        AudioManager.PlaySFX("footstep", transform.position);
    }
}
```

## DOTween Quick Reference

```csharp
// Position
transform.DOMove(targetPos, 0.5f).SetEase(Ease.OutQuad);
transform.DOLocalMoveY(2f, 0.3f).SetLoops(-1, LoopType.Yoyo);

// Scale (UI bounce)
transform.DOScale(1.2f, 0.1f).SetLoops(2, LoopType.Yoyo);

// Fade (CanvasGroup)
canvasGroup.DOFade(0f, 0.3f).OnComplete(() => gameObject.SetActive(false));

// Sequence
DOTween.Sequence()
    .Append(transform.DOScale(1.2f, 0.1f))
    .Append(transform.DOScale(1f, 0.1f))
    .Join(spriteRenderer.DOColor(Color.red, 0.1f))
    .AppendInterval(0.5f)
    .Append(spriteRenderer.DOColor(Color.white, 0.2f));

// Kill on destroy (prevent memory leaks)
private void OnDestroy() => transform.DOKill();
```
