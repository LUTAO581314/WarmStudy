# WarmStudy

WarmStudy（暖学帮）是一个面向青少年心理关怀场景的教育智能体原型系统，对应 2026 年广东省大学生计算机设计大赛教育方向“助育”场景。

说明：
本项目的前端应用形态建议统一表述为“基于微信小程序技术实现的 App 应用前端”。
`WarnStudty/` 是该 App 的前端工程载体，不建议再简单理解为普通微信小程序演示项目。

当前版本已经收敛为：

- 一个基于微信小程序技术实现的 App 前端工程：`WarnStudty/`
- 一套后端服务：`agent/`
- 一个统一管理员后台入口：`http://localhost:8000/`
- 一条统一模型路径：`Qwen / DashScope`

## 当前架构

- `8000`
  - 唯一对外 Web 入口
  - API Gateway
  - 管理员后台
  - 聚合 App 后台、RAG 知识库、模型使用、登录记录等信息
- `5177`
  - 内部 Agent / RAG API 服务
  - 不再提供独立 Web UI

## 当前可用功能

- 学生端：登录、心理测评、情绪打卡、AI 对话、心理知识浏览
- 家长端：登录、绑定孩子、查看报告、查看预警、获取 AI 沟通建议
- 管理员后台：
  - App 后台总览
  - 用户与登录信息
  - 模型使用统计
  - RAG 知识库上传、更新、删除、重置
  - RAG 检索与问答

## 快速启动

### 本地

```powershell
cd agent
.\start_all.ps1
```

启动后访问：

- 管理员后台：`http://localhost:8000/`

### Docker

```powershell
docker compose up --build
```

当前 Docker 默认只对外暴露：

- `8000:8000`

## 关键环境变量

```env
CHAT_MODEL=qwen
DASHSCOPE_API_KEY=your_dashscope_api_key
DASHSCOPE_MODEL=qwen-plus
AGENT_API_KEY=your_admin_api_key
RAG_AGENT_URL=http://localhost:5177
FLASK_ENV=production
LOG_LEVEL=INFO
```

## 推荐阅读

- 项目总说明：[docs/COMPETITION_PROJECT_DESCRIPTION.md](/C:/Users/34206/OneDrive/Desktop/WarmStudy-main/docs/COMPETITION_PROJECT_DESCRIPTION.md)
- 部署手册：[docs/DEPLOYMENT_RUNBOOK.md](/C:/Users/34206/OneDrive/Desktop/WarmStudy-main/docs/DEPLOYMENT_RUNBOOK.md)
- 文档索引：[docs/README.md](/C:/Users/34206/OneDrive/Desktop/WarmStudy-main/docs/README.md)
- 提交材料目录：[submission/00_提交包说明.md](/C:/Users/34206/OneDrive/Desktop/WarmStudy-main/submission/00_提交包说明.md)

## 仓库结构

```text
WarmStudy-main/
├─ WarnStudty/          # 基于微信小程序技术实现的 App 前端工程
├─ agent/               # API Gateway、Agent、RAG、管理员后台
├─ docs/                # 正式说明文档
├─ submission/          # 比赛提交材料
├─ docker-compose.yml   # 根目录 Docker 编排
└─ 2026年广东省大学生计算机设计大赛-本科赛道赛题说明.pdf
```
