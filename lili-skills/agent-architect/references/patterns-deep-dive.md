# 架构模式详细参考

## ReAct (Reasoning + Acting)

### 算法流程
```
Loop:
  1. Thought: 分析当前状态和下一步行动
  2. Action: 调用工具/执行操作
  3. Observation: 接收执行结果
  4. 判断是否完成任务，否则继续循环
```

### OpenClaw 实现示例
```javascript
// 在 OpenClaw 中，ReAct 是默认模式
// 每次工具调用后，系统自动将结果注入 context
// LLM 继续生成 Thought → Action

async function reactLoop(task, maxIterations = 10) {
  let context = `Task: ${task}`;
  
  for (let i = 0; i < maxIterations; i++) {
    // LLM 生成 Thought + Action
    const response = await llm.generate(context);
    
    if (response.containsAnswer) {
      return response.answer;
    }
    
    // 执行工具调用
    const observation = await executeTool(response.action);
    
    // 更新上下文
    context += `\nObservation: ${observation}`;
  }
  
  throw new Error('Max iterations reached');
}
```

### 适用场景详细分析

| 场景 | 是否适合 | 原因 |
|------|----------|------|
| API 调用链 | ✅ | 每一步依赖上一步结果 |
| 数据查询 | ✅ | 需要逐步缩小范围 |
| 错误处理 | ✅ | 可根据反馈调整策略 |
| 纯数学计算 | ❌ | CoT 更简单直接 |
| 固定流程 | ❌ | Plan-and-Execute 更合适 |

### 常见陷阱
1. **循环陷阱**: 没有终止条件或无法收敛
2. **上下文爆炸**: 历史记录过长，token 超限
3. **工具误用**: 选择错误的工具或参数

### 优化建议
- 设置最大迭代次数
- 定期压缩上下文（摘要历史）
- 提供清晰的工具描述

---

## Chain-of-Thought (CoT)

### 核心思想
让模型显式地展示推理过程，而非直接给答案。

###  prompting 技巧
```
Zero-shot: "Let's think step by step."
Few-shot: 提供包含推理过程的示例
```

### 示例

**输入**:
```
问题: 一个农场有鸡和兔，头共 35 个，脚共 94 只。鸡兔各几只？
```

**CoT 输出**:
```
让我逐步思考：
1. 假设全是鸡，应该有 35 × 2 = 70 只脚
2. 实际多了 94 - 70 = 24 只脚
3. 每只兔比鸡多 2 只脚，所以兔子有 24 ÷ 2 = 12 只
4. 鸡有 35 - 12 = 23 只

答案：鸡 23 只，兔 12 只
```

---

## Tree-of-Thoughts (ToT)

### 与 CoT 的区别
- CoT: 单一路径的线性推理
- ToT: 树形分支，探索多个可能

### 实现要点
1. **分解**: 将问题拆成多个思考步骤
2. **生成**: 每个步骤产生 k 个候选
3. **评估**: 对每个候选打分
4. **搜索**: BFS/DFS 找到最优路径

### 搜索策略

**BFS (广度优先)**:
- 适合: 需要全局最优解
- 代价: 内存消耗大

**DFS (深度优先)**:
- 适合: 快速找到一个可行解
- 代价: 可能陷入局部最优

**Beam Search**:
- 折中方案，每层保留 top-k

---

## Plan-and-Execute

### 架构组件
```
Planner ──→ Plan ──→ Executor ──→ Result
   ↑                                      │
   └──────── Feedback ←── Monitor ←───────┘
```

### OpenClaw 中的实现
利用 `cron` 和 `sessions_spawn`:
```javascript
// 1. Planner 生成执行计划
const plan = await planner.createPlan(task);

// 2. 存储计划
write('memory/plan.md', plan);

// 3. Executor 按计划执行
for (const step of plan.steps) {
  const result = await executeStep(step);
  append('memory/plan.md', `\n- [x] ${step.name}: ${result}`);
}
```

### 与 ReAct 的对比

| 维度 | Plan-and-Execute | ReAct |
|------|------------------|-------|
| 可预测性 | 高 | 低 |
| 灵活性 | 低 | 高 |
| 可调试性 | 高 | 中 |
| 适用场景 | 固定流程 | 探索性任务 |

---

## Multi-Agent

### 协作模式

**1. 监督模式 (Supervisor)**
```
Supervisor Agent
├── Worker A (Research)
├── Worker B (Writing)
└── Worker C (Review)
```

**2. 平等协作 (Collaboration)**
```
Agent A ←→ Agent B ←→ Agent C
   ↕_________|_________↕
```

**3. 管道模式 (Pipeline)**
```
Input → Agent A → Agent B → Agent C → Output
```

### OpenClaw 实现
使用 `sessions_spawn` 创建子会话:
```javascript
// 创建多个子 Agent
const researcher = await sessions_spawn({
  task: 'Research topic...',
  label: 'researcher'
});

const writer = await sessions_spawn({
  task: 'Write based on research...',
  label: 'writer'
});

// 主会话协调结果
const final = await synthesize(researcher.result, writer.result);
```

### 通信协议
- **直接通信**: Agent A 直接调用 Agent B
- **消息队列**: 通过共享存储/消息总线
- **主控协调**: 通过 Supervisor 中转

