/**
 * Agent Architect - AI Agent 架构设计助手
 * 
 * 核心功能：根据场景推荐架构模式、记忆策略、工具组合
 */

const fs = require('fs');
const path = require('path');

// 架构模式知识库
const PATTERNS = {
  direct: {
    name: 'Direct Tool Use',
    description: '直接调用工具，无需复杂推理',
    suitable: ['简单查询', '单次工具调用', '确定性任务'],
    pros: ['简单', '高效', '可预测'],
    cons: ['无法处理复杂多步任务'],
    examples: ['天气查询', '单位换算', '快速搜索']
  },
  react: {
    name: 'ReAct (Reasoning + Acting)',
    description: '交替进行推理和行动，观察反馈形成循环',
    suitable: ['多步决策', '工具调用链', '信息收集整合'],
    pros: ['灵活', '可观察中间步骤', '错误可恢复'],
    cons: ['可能陷入循环', 'token 消耗较高'],
    examples: ['研究任务', '数据分析', '复杂查询']
  },
  cot: {
    name: 'Chain-of-Thought',
    description: '通过中间推理步骤引导模型逐步思考',
    suitable: ['数学问题', '逻辑推理', '复杂决策'],
    pros: ['提高推理准确性', '可解释性强'],
    cons: ['不适合需要外部工具的任务'],
    examples: ['数学题求解', '逻辑谜题', '决策分析']
  },
  tot: {
    name: 'Tree-of-Thoughts',
    description: '树形搜索多路径探索',
    suitable: ['创意生成', '游戏求解', '复杂规划'],
    pros: ['探索多种可能', '找到最优解'],
    cons: ['token 消耗高', '需要评估机制'],
    examples: ['创意写作', '棋类游戏', '战略规划']
  },
  plan_execute: {
    name: 'Plan-and-Execute',
    description: '先规划后执行，结构化完成复杂任务',
    suitable: ['复杂工作流', '多步骤任务', '可预测流程'],
    pros: ['可预测', '可调试', '适合自动化'],
    cons: ['不够灵活', '难以处理意外情况'],
    examples: ['数据处理流程', '自动化报告', 'CI/CD']
  },
  multi_agent: {
    name: 'Multi-Agent Collaboration',
    description: '多个 Agent 协作完成任务',
    suitable: ['团队协作模拟', '复杂项目', '需要分工的任务'],
    pros: ['并行处理', '专业化分工', '可扩展'],
    cons: ['协调复杂', '通信开销', '调试困难'],
    examples: ['内容创作团队', '软件开发', '研究项目']
  }
};

// 框架对比
const FRAMEWORKS = {
  openclaw: {
    name: 'OpenClaw',
    strengths: ['人机协作', '技能可复用', '文件记忆', '子会话隔离'],
    weaknesses: ['社区较小', '自动化程度较低'],
    bestFor: ['个人助手', '工具密集型', '需要人工介入']
  },
  langchain: {
    name: 'LangChain',
    strengths: ['生态丰富', '集成多', '社区大', '企业级'],
    weaknesses: ['学习曲线陡峭', '过度封装', '调试困难'],
    bestFor: ['企业应用', '快速集成', '复杂链式任务']
  },
  langgraph: {
    name: 'LangGraph',
    strengths: ['图结构工作流', '状态管理', '与 LangChain 兼容'],
    weaknesses: ['抽象复杂', '调试困难', '性能开销'],
    bestFor: ['复杂工作流', '状态持久化', '多 Agent']
  },
  autogpt: {
    name: 'AutoGPT',
    strengths: ['开箱即用', '自主决策', '目标驱动'],
    weaknesses: ['可控性差', 'token 消耗高', '失败率高'],
    bestFor: ['研究探索', '原型验证', '非关键任务']
  },
  crewai: {
    name: 'CrewAI',
    strengths: ['角色扮演直观', '配置驱动', '协作简单'],
    weaknesses: ['灵活性受限', '性能开销', '生态小'],
    bestFor: ['内容创作', '流程模拟', '多角色协作']
  }
};

// 记忆策略
const MEMORY_STRATEGIES = {
  simple: {
    short: 'Context window only',
    long: 'None',
    suitable: ['单次对话', '无状态任务']
  },
  file_based: {
    short: 'Context + Current session',
    long: 'Markdown files in workspace',
    suitable: ['个人助手', '长期项目', 'OpenClaw 推荐']
  },
  vector_db: {
    short: 'Context + Recent',
    long: 'Vector database with semantic search',
    suitable: ['大量知识', '语义检索', 'LangChain 推荐']
  },
  hybrid: {
    short: 'Context + Working memory',
    long: 'Vector DB + Structured storage',
    suitable: ['复杂 Agent', '企业级应用']
  }
};

/**
 * 分析需求并推荐架构
 */
function analyze(requirements) {
  const { tasks, constraints = {}, preferences = {} } = requirements;
  
  // 模式选择逻辑
  let recommendedPattern = 'react'; // 默认
  
  if (tasks.length === 1 && tasks[0].type === 'query') {
    recommendedPattern = 'direct';
  } else if (preferences.autonomy === 'high' && tasks.length > 3) {
    recommendedPattern = 'plan_execute';
  } else if (preferences.complexity === 'high' && tasks.some(t => t.type === 'creative')) {
    recommendedPattern = 'tot';
  } else if (tasks.some(t => t.requires_tools) && tasks.length > 1) {
    recommendedPattern = 'react';
  }
  
  // 框架选择
  let recommendedFramework = preferences.framework || 'openclaw';
  
  if (preferences.autonomy === 'high' && !preferences.framework) {
    recommendedFramework = 'autogpt';
  } else if (preferences.complexity === 'high' && tasks.length > 5) {
    recommendedFramework = 'langgraph';
  }
  
  // 记忆策略
  let memoryStrategy = 'file_based';
  if (preferences.framework === 'langchain') {
    memoryStrategy = 'vector_db';
  } else if (constraints.high_volume_data) {
    memoryStrategy = 'hybrid';
  }
  
  return {
    pattern: {
      name: PATTERNS[recommendedPattern].name,
      key: recommendedPattern,
      rationale: generateRationale(recommendedPattern, requirements),
      pros: PATTERNS[recommendedPattern].pros,
      cons: PATTERNS[recommendedPattern].cons
    },
    framework: {
      name: FRAMEWORKS[recommendedFramework].name,
      key: recommendedFramework,
      rationale: generateFrameworkRationale(recommendedFramework, requirements),
      alternatives: suggestAlternatives(recommendedFramework, requirements)
    },
    memory: MEMORY_STRATEGIES[memoryStrategy],
    recommendations: generateRecommendations(requirements)
  };
}

function generateRationale(pattern, requirements) {
  const p = PATTERNS[pattern];
  const taskTypes = requirements.tasks.map(t => t.type);
  
  let rationale = `基于您的需求，${p.name} 是最合适的选择。`;
  
  if (pattern === 'react' && taskTypes.includes('research')) {
    rationale += '您的任务涉及研究和信息收集，ReAct 的推理-行动循环特别适合这种需要多步探索的场景。';
  } else if (pattern === 'plan_execute' && requirements.tasks.length > 3) {
    rationale += '您的任务流程较为复杂，先规划后执行的模式可以提供更好的可预测性和调试能力。';
  } else if (pattern === 'direct') {
    rationale += '您的需求相对简单直接，无需复杂的推理链，直接调用工具是最高效的选择。';
  }
  
  return rationale;
}

function generateFrameworkRationale(framework, requirements) {
  const f = FRAMEWORKS[framework];
  let rationale = `${f.name} 的 `;
  
  if (framework === 'openclaw') {
    rationale += '人机协作设计和文件系统记忆特别适合您的使用场景。';
  } else if (framework === 'langchain') {
    rationale += '丰富生态和企业级特性能够满足您复杂的集成需求。';
  } else if (framework === 'autogpt') {
    rationale += '高自主性设计适合您探索性的任务需求。';
  }
  
  return rationale;
}

function suggestAlternatives(framework, requirements) {
  const alternatives = [];
  
  if (framework !== 'openclaw' && requirements.preferences?.autonomy !== 'high') {
    alternatives.push('openclaw');
  }
  if (framework !== 'langchain' && requirements.tasks?.length > 5) {
    alternatives.push('langchain');
  }
  
  return alternatives.slice(0, 2);
}

function generateRecommendations(requirements) {
  const recs = [];
  
  if (requirements.preferences?.autonomy === 'high') {
    recs.push('建议添加人工确认机制，避免自主 Agent 失控');
  }
  
  if (requirements.tasks?.some(t => t.sensitive)) {
    recs.push('任务涉及敏感操作，建议实现权限边界和审计日志');
  }
  
  recs.push('建议从简单架构开始，根据实际运行情况迭代优化');
  
  return recs;
}

/**
 * 生成完整的架构建议
 */
function generateArchitectureSpec(input) {
  const analysis = analyze(input);
  
  return {
    project: input.name,
    architecture: {
      pattern: analysis.pattern,
      framework: analysis.framework,
      memory: analysis.memory
    },
    implementation: {
      steps: generateSteps(analysis, input),
      risks: identifyRisks(analysis, input),
      timeline: estimateTimeline(input)
    },
    recommendations: analysis.recommendations
  };
}

function generateSteps(analysis, input) {
  const steps = [];
  
  steps.push(`1. 初始化项目：创建 ${analysis.framework.name} 项目结构`);
  steps.push(`2. 配置记忆系统：实现 ${analysis.memory.short}`);
  steps.push(`3. 实现核心逻辑：基于 ${analysis.pattern.name} 模式`);
  
  if (input.tasks?.some(t => t.requires_tools)) {
    steps.push('4. 集成工具链：配置所需工具');
  }
  
  steps.push('5. 测试验证：覆盖主要场景和边界情况');
  steps.push('6. 部署运行：配置监控和日志');
  
  return steps;
}

function identifyRisks(analysis, input) {
  const risks = [];
  
  if (analysis.pattern.key === 'react') {
    risks.push({
      risk: '可能陷入无限循环',
      mitigation: '设置最大迭代次数和超时机制'
    });
  }
  
  if (input.preferences?.autonomy === 'high') {
    risks.push({
      risk: '自主决策失控',
      mitigation: '实现人工确认节点和紧急停止机制'
    });
  }
  
  if (analysis.framework.key === 'autogpt') {
    risks.push({
      risk: 'Token 消耗过高',
      mitigation: '设置预算限制和优化提示词'
    });
  }
  
  return risks;
}

function estimateTimeline(input) {
  const complexity = input.preferences?.complexity || 'medium';
  const tasks = input.tasks?.length || 3;
  
  if (complexity === 'simple' && tasks <= 3) {
    return '1-2 天';
  } else if (complexity === 'high' || tasks > 5) {
    return '1-2 周';
  }
  return '3-5 天';
}

module.exports = {
  analyze,
  generateArchitectureSpec,
  PATTERNS,
  FRAMEWORKS,
  MEMORY_STRATEGIES
};

// 如果直接运行，输出帮助信息
if (require.main === module) {
  console.log('Agent Architect - AI Agent 架构设计助手');
  console.log('Usage: require("./index.js").analyze(requirements)');
  console.log('\n可用的架构模式:');
  Object.entries(PATTERNS).forEach(([key, p]) => {
    console.log(`  - ${key}: ${p.name}`);
  });
}
