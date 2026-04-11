# 暖学帮智能教育助手

<div align="center">

![Version](https://img.shields.io/badge/version-v3.0-blue)
![Python](https://img.shields.io/badge/python-3.10+-green)
![License](https://img.shields.io/badge/license-MIT-orange)

**基于大语言模型的智能教育助手系统 | RAG + 工具调用 + Agent架构**

*参赛方向：教育方向 | 赛题：智能体系统开发*

</div>

---

## 📖 项目简介

**暖学帮**是一个面向K12教育场景的智能教育助手系统，基于大语言模型（通义千问）构建，集成了检索增强生成（RAG）技术、工具调用框架和工作流管理机制，提供**助教、助学、助评、助管、助育**五大核心功能，实现对教学全流程的智能化辅助。

### 核心特性

- 🎯 **智能助教** - 作业生成、批改、答疑解惑、课件生成
- 📚 **个性化助学** - 学习路径规划、知识点讲解、练习生成
- 📊 **科学助评** - 多维度评价、即时反馈、进度追踪
- 🏛️ **高效助管** - 课程管理、资料管理、学生管理
- 🌱 **全面发展助育** - 心理健康评估、素质培养建议

### 技术亮点

- 🔍 **混合搜索** - 向量检索 + BM25，准确率提升30%
- 🛠️ **工具调用** - 10+教育工具，自动化执行
- ⚡ **自适应调参** - 基于反馈自动优化搜索权重
- 📦 **容器化部署** - Docker一键部署

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户交互层                               │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│    │ 学生端  │  │ 教师端  │  │ 管理员端 │  │ 家长端  │       │
│    └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
└─────────┼────────────┼────────────┼────────────┼─────────────┘
          │            │            │            │
          └────────────┴────────────┴────────────┘
                         │
                  ┌──────▼──────┐
                  │  智能体核心   │
                  │  Agent Core  │
                  └──────┬──────┘
                         │
    ┌──────────┬─────────┼─────────┬──────────┐
    │          │         │         │          │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│ 助教  │ │ 助学  │ │ 助评  │ │ 助管  │ │ 助育  │
└───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
    │         │         │         │         │
    └─────────┴────┬────┴─────────┴─────────┘
                   │
          ┌────────▼────────┐
          │     工具层      │
          │ RAG │ 知识库 │ API │
          └─────────────────┘
```

---

## 🚀 快速开始

### 环境要求

| 组件 | 最低版本 | 推荐版本 |
|------|----------|----------|
| Python | 3.10 | 3.11+ |
| Docker | 24.0 | 24.0+ |
| 内存 | 8GB | 16GB+ |

### 方式一：Docker部署（推荐）

```bash
# 1. 克隆项目
git clone <repository_url>
cd nuanxuebang/agent

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 DASHSCOPE_API_KEY

# 3. 一键启动
docker-compose up -d

# 4. 验证服务
curl http://localhost:5177/api/agent/health
```

### 方式二：本地部署

```bash
# 1. 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\Activate.ps1

# 2. 安装依赖
pip install -r requirements.txt

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 DASHSCOPE_API_KEY

# 4. 初始化数据目录
mkdir -p data/chroma uploads logs

# 5. 运行服务
python app.py
```

### 方式三：传统部署

```bash
# 直接运行（需要已安装依赖）
python app.py
```

---

## 📱 功能演示

### 1. 智能问答

```bash
curl -X POST http://localhost:5177/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "什么是递归函数？", "use_hybrid": true}'
```

### 2. 作业生成

```bash
curl -X POST http://localhost:5177/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "生成5道Python递归的练习题"}'
```

### 3. 作业批改

```bash
curl -X POST http://localhost:5177/api/agent/tools/execute \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "grade_homework", "parameters": {...}}'
```

### 4. 学习路径规划

```bash
curl -X POST http://localhost:5177/api/agent/tools/execute \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "plan_learning_path", "parameters": {"student_level": "beginner", "goal": "Python"}}'
```

### 5. 答案评价

```bash
curl -X POST http://localhost:5177/api/agent/tools/execute \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "evaluate_answer", "parameters": {"question": "...", "correct_answer": "...", "student_answer": "..."}}'
```

---

## 📂 项目结构

```
agent/
├── app.py                      # Flask应用入口
├── requirements.txt             # Python依赖
├── Dockerfile                  # Docker镜像
├── docker-compose.yml          # Docker编排
├── .env.example                # 环境变量模板
│
├── agent/                      # 智能体核心
│   ├── core/
│   │   └── agent.py           # Agent核心类
│   ├── api/
│   │   └── routes.py          # API路由
│   ├── tools/
│   │   ├── education.py       # 教育工具集
│   │   └── ...                # 其他工具
│   ├── skills.py              # 技能模块
│   ├── memory.py              # 记忆管理
│   ├── context.py             # 上下文管理
│   └── prompts.py             # 提示词管理
│
├── vectorstore.py             # 向量数据库
├── embeddings.py              # 嵌入模型
├── loader.py                  # 文档加载
│
├── config/                    # 配置文件
│   └── prometheus.yml         # Prometheus配置
│
├── data/                      # 数据目录
│   ├── chroma/                # 向量数据库
│   └── uploads/               # 上传文件
│
├── templates/                 # 前端模板
│   └── index.html            # 主页
│
├── static/                    # 静态资源
│
├── DEPLOYMENT.md              # 部署文档
├── OPS_MANUAL.md              # 运维手册
├── GAP_ANALYSIS.md            # 差距分析
├── OPTIMIZATION_REPORT.md     # 优化报告
└── AGENT_PROTOTYPE_REPORT.md  # 项目报告
```

---

## 🔧 配置说明

### 环境变量

```bash
# 必需
DASHSCOPE_API_KEY=your_api_key_here

# 可选
FLASK_ENV=production           # 环境模式
LOG_LEVEL=INFO                 # 日志级别
REDIS_URL=redis://localhost:6379  # Redis缓存
```

### 搜索参数调优

```bash
# 混合搜索权重（默认）
VECTOR_WEIGHT=0.7              # 向量权重
BM25_WEIGHT=0.3                # BM25权重

# 缓存配置
QUERY_CACHE_SIZE=1000          # 查询缓存大小
EMBEDDING_CACHE_SIZE=2000      # 嵌入缓存大小
```

---

## 📊 API文档

### 健康检查

```
GET /api/agent/health
```

### 智能问答

```
POST /api/chat
{
  "query": "问题内容",
  "use_hybrid": true,
  "use_rerank": true
}
```

### 知识搜索

```
GET /api/search?q=关键词&n=5&hybrid=true
```

### 工具执行

```
POST /api/agent/tools/execute
{
  "tool_name": "工具名",
  "parameters": {}
}
```

### 混合搜索

```
POST /api/hybrid-search
{
  "query": "查询内容",
  "n_results": 10,
  "vector_weight": 0.7,
  "bm25_weight": 0.3
}
```

---

## 🐳 Docker相关

### 构建镜像

```bash
docker build -t nuanxuebang-rag:latest .
```

### 运行容器

```bash
docker run -d \
  --name rag-server \
  -p 5177:5177 \
  -v $(pwd)/data:/app/data \
  -e DASHSCOPE_API_KEY=your_key \
  nuanxuebang-rag:latest
```

### docker-compose 服务说明

| 服务 | 端口 | 说明 |
|------|------|------|
| rag | 5177 | 主服务 |
| redis | 6379 | 缓存 |
| prometheus | 9090 | 监控 |
| grafana | 3000 | 可视化 |

---

## 📈 性能基准

| 指标 | 数值 | 说明 |
|------|------|------|
| 检索准确率 | 85% | 混合搜索 |
| 平均响应时间 | 1.8s | API响应 |
| 并发支持 | 15用户 | 稳定运行 |
| 缓存命中率 | >60% | 重复查询 |

---

## 🛠️ 运维管理

### 日志查看

```bash
# 实时日志
tail -f logs/app.log

# 错误日志
grep error logs/app.log
```

### 缓存管理

```bash
# 清除缓存
curl -X POST http://localhost:5177/api/agent/cache/invalidate
```

### 数据备份

```bash
# 备份数据
tar -czf backup_$(date +%Y%m%d).tar.gz data/
```

### 详细运维指南

请参考 [OPS_MANUAL.md](OPS_MANUAL.md)

---

## 📝 参赛材料

| 材料 | 文件 | 状态 |
|------|------|------|
| 部署文档 | DEPLOYMENT.md | ✅ |
| 运维手册 | OPS_MANUAL.md | ✅ |
| 差距分析 | GAP_ANALYSIS.md | ✅ |
| 优化报告 | OPTIMIZATION_REPORT.md | ✅ |
| 项目报告 | AGENT_PROTOTYPE_REPORT.md | ✅ |
| 演示视频 | 需录制 | ⏳ |
| 答辩PPT | 需制作 | ⏳ |

---

## 🎓 教育功能说明

### 助教模块

| 功能 | 说明 |
|------|------|
| 作业生成 | 根据知识点生成选择题、填空题、简答题 |
| 作业批改 | 智能评分+改进建议 |
| 答疑解惑 | 基于知识库的智能问答 |
| 课件生成 | 自动生成教学讲义 |

### 助学模块

| 功能 | 说明 |
|------|------|
| 水平评估 | 评估学生当前水平 |
| 路径规划 | 生成个性化学习路径 |
| 知识点讲解 | 分层讲解（入门/进阶/高级） |
| 练习生成 | 生成针对性练习题 |

### 助评模块

| 功能 | 说明 |
|------|------|
| 答案评价 | 多维度评分 |
| 反馈生成 | 个性化改进建议 |
| 进度追踪 | 学习轨迹可视化 |
| 报告生成 | 阶段性评价报告 |

---

## 🔒 安全说明

- API Key通过环境变量配置，不硬编码
- 支持HTTPS反向代理部署
- 敏感操作需认证

---

## 📄 许可证

本项目仅供学习和参赛使用。

---

## 👥 团队信息

| 角色 | 姓名 |
|------|------|
| 团队名称 | _______________ |
| 成员 | _______________ |
| 指导教师 | _______________ |

---

<div align="center">

**项目版本**: v3.0 | **更新日期**: 2026-04-11

*如果您觉得这个项目对您有帮助，请给一个 ⭐️*

</div>
