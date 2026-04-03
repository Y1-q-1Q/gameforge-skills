<!-- SPDX-License-Identifier: Apache-2.0 -->
# CONTEXT-COMPRESSION.md — 对话上下文永不溢出协议

**来源**: learn-claude-code (shareAI-lab) s06-s12  
**适配**: OpenClaw / GameForge  
**生效日期**: 2026-04-03  
**状态**: 已纳入默认工作流

---

## 1. 目标

确保 **每次对话** 和 **每个项目** 的上下文永不溢出，实现 **永不停歇的运转**。

---

## 2. 核心机制（三层压缩）

借鉴 learn-claude-code s06，实施三层渐进式压缩：

### Layer 1: Micro-Compact（静默压缩，每轮执行）

**触发时机**: 每次 LLM 调用前  
**动作**: 将旧的 tool result 替换为占位符

```
原始: {tool_result: read_file, content: "1000行代码"}
压缩: {tool_result: read_file, content: "[Previous: used read_file]"}
```

**保留规则**:
- 保留最近 3 个 tool result
- read_file 结果如果 >100 字符且可能复用，保留完整内容
- 其他 tool 结果一律压缩为占位符

### Layer 2: Auto-Compact（阈值触发）

**触发条件**: Token 估计 > 50,000（或约 200KB 文本）  
**动作**:
1. 保存完整对话到 `.transcripts/`
2. 调用 LLM 生成摘要
3. 替换 messages 为摘要 + transcript 路径

**摘要模板**:
```markdown
[Conversation compressed. Transcript: .transcripts/transcript_1234567890.jsonl]

## 摘要
- 已完成: [关键成果]
- 当前状态: [进行中的任务]
- 关键决策: [重要决定]
- 待办: [待处理事项]
```

### Layer 3: Manual Compact（按需触发）

**触发时机**:
- 用户主动要求 "压缩上下文"
- 任务阶段性完成
- 准备开启新主题

**动作**: 同 Auto-Compact，但由用户或 agent 主动调用

---

## 3. OpenClaw 具体实施

### 3.1 会话级压缩

**每轮响应前自动执行**:
```
1. 检查当前上下文 token 估计
2. 如果 > 50,000:
   - 执行 Auto-Compact
   - 通知用户: "[上下文已压缩，完整历史保存至 .transcripts/]"
3. 继续正常响应
```

**Token 估计方法**:
```python
def estimate_tokens(messages: list) -> int:
    """粗略估计: ~4 字符 = 1 token"""
    return len(str(messages)) // 4
```

### 3.2 项目级持久化（结合 s07 任务系统）

在 GameForge 项目中启用 **Task-Worktree 隔离**（s12）:

```
项目根目录/
├── .tasks/                    # 任务图（s07）
│   ├── task_1.json
│   └── task_2.json
├── .worktrees/               # 隔离执行（s12）
│   ├── feature-auth/
│   └── feature-ui/
├── .transcripts/             # 压缩历史
│   └── transcript_*.jsonl
└── .claude/                  # OpenClaw 配置
    └── context-config.yaml
```

**任务状态与上下文绑定**:
```yaml
# task_1.json
{
  "id": 1,
  "subject": "实现登录功能",
  "status": "in_progress",
  "worktree": "feature-auth",
  "transcript": ".transcripts/task_1_main.jsonl",
  "context_summary": "[压缩后的上下文摘要]"
}
```

### 3.3 后台任务支持（s08）

长时间运行的命令（npm install, docker build）放入后台:

```
用户: "在后台运行测试，同时继续写代码"
Agent: 
  1. 启动后台任务: pytest --cov
  2. 立即返回，继续其他工作
  3. 每轮检查后台任务状态
  4. 完成后注入结果到上下文
```

---

## 4. 习惯养成（每次对话必做）

### 会话开始时
- [ ] 检查是否有未恢复的后台任务
- [ ] 检查 transcript 目录，询问是否恢复之前的对话

### 会话进行中
- [ ] 每 10 轮或 token > 40,000 时，主动提醒压缩
- [ ] 任务完成时，立即执行 Manual Compact

### 会话结束时
- [ ] 执行 Manual Compact，保存最终状态
- [ ] 更新任务状态（如果启用任务系统）
- [ ] 记录到每日日志: "上下文已压缩，transcript 保存至 ..."

### 心跳时（HEARTBEAT.md 更新）
```yaml
# 在心跳检查中加入:
- [ ] 检查长时间运行会话的 token 使用量
- [ ] 自动触发压缩（如果启用 auto-compact）
```

---

## 5. 与现有系统的集成

### 5.1 与 Elite Longterm Memory 结合

```
Elite Memory:   跨会话的长期事实存储
Context Compact: 单会话内的上下文管理

协同:
1. 会话结束时 → Compact 生成摘要
2. 摘要中的关键事实 → 写入 Elite Memory
3. 新会话开始时 → 从 Elite Memory 加载 + 可选加载最近 transcript
```

### 5.2 与 GameForge Skill/Pack 结合

在 SKILL.md v3 中声明上下文需求:
```yaml
context:
  priority: "high"
  ttl: "session"              # turn/session/permanent
  compression:
    strategy: "semantic"      # semantic/keyword/truncate
    max_tokens: 4000
  auto_load:                  # 会话恢复时自动加载
    - type: "transcript"
      pattern: ".transcripts/task_{task_id}_*.jsonl"
```

---

## 6. 工具函数（参考实现）

```python
# context_manager.py
import json
import time
from pathlib import Path

class ContextManager:
    def __init__(self, workspace: Path):
        self.workspace = workspace
        self.transcript_dir = workspace / ".transcripts"
        self.transcript_dir.mkdir(exist_ok=True)
        self.threshold = 50000
        self.keep_recent = 3
    
    def estimate_tokens(self, messages: list) -> int:
        return len(str(messages)) // 4
    
    def micro_compact(self, messages: list) -> list:
        """Layer 1: 静默压缩旧 tool results"""
        tool_results = []
        for i, msg in enumerate(messages):
            if msg.get("role") == "user" and isinstance(msg.get("content"), list):
                for j, part in enumerate(msg["content"]):
                    if part.get("type") == "tool_result":
                        tool_results.append((i, j, part))
        
        if len(tool_results) <= self.keep_recent:
            return messages
        
        # 压缩旧的（保留最近 keep_recent 个）
        for i, j, part in tool_results[:-self.keep_recent]:
            content = part.get("content", "")
            if isinstance(content, str) and len(content) > 100:
                tool_name = part.get("tool_use_id", "unknown")[:8]
                part["content"] = f"[Previous: used {tool_name}]"
        
        return messages
    
    def auto_compact(self, messages: list) -> tuple[list, Path]:
        """Layer 2: 阈值触发压缩"""
        # 保存完整 transcript
        timestamp = int(time.time())
        transcript_path = self.transcript_dir / f"transcript_{timestamp}.jsonl"
        
        with open(transcript_path, "w") as f:
            for msg in messages:
                f.write(json.dumps(msg, default=str) + "\n")
        
        # 生成摘要（简化版，实际可调用 LLM）
        summary = self._generate_summary(messages)
        
        compressed = [{
            "role": "user",
            "content": f"[Conversation compressed. Transcript: {transcript_path}]\n\n{summary}"
        }]
        
        return compressed, transcript_path
    
    def _generate_summary(self, messages: list) -> str:
        """生成对话摘要（简化实现）"""
        # 实际实现应调用 LLM
        user_msgs = [m for m in messages if m.get("role") == "user"]
        assistant_msgs = [m for m in messages if m.get("role") == "assistant"]
        
        return f"""## 对话摘要
- 用户消息数: {len(user_msgs)}
- Agent 响应数: {len(assistant_msgs)}
- 最后主题: {str(user_msgs[-1]['content'])[:100] if user_msgs else 'N/A'}...

## 关键内容
[需手动或 LLM 生成详细摘要]
"""
    
    def should_compact(self, messages: list) -> bool:
        """检查是否需要压缩"""
        return self.estimate_tokens(messages) > self.threshold
    
    def load_transcript(self, transcript_path: Path) -> list:
        """加载历史对话"""
        messages = []
        with open(transcript_path) as f:
            for line in f:
                messages.append(json.loads(line))
        return messages
```

---

## 7. 检查清单（每次使用）

```markdown
### 会话开始
- [ ] 检查 .transcripts/ 是否有可恢复的对话
- [ ] 检查 .tasks/ 是否有进行中的任务
- [ ] 如有，询问用户是否恢复上下文

### 会话进行中（每 5-10 轮）
- [ ] 估计当前 token 使用量
- [ ] 如果 > 40,000，提醒用户即将压缩
- [ ] 如果 > 50,000，自动执行压缩

### 任务完成时
- [ ] 执行 Manual Compact
- [ ] 更新任务状态
- [ ] 保存关键决策到 Elite Memory

### 会话结束
- [ ] 最终压缩
- [ ] 记录到 memory/YYYY-MM-DD.md
- [ ] 更新 SESSION-STATE.md
```

---

## 8. 参考资源

- **来源**: https://github.com/shareAI-lab/learn-claude-code
- **核心课程**: s06-context-compact, s07-task-system, s08-background-tasks, s12-worktree-task-isolation
- **已集成到**: 
  - `AGENTS.md` - 会话启动和心跳协议
  - `HEARTBEAT.md` - 定期检查上下文状态
  - `docs/architecture/` - GameForge 架构设计

---

*最后一次更新: 2026-04-03*  
*维护者: 浠宝 (IceBaby)*
