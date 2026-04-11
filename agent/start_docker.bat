@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 暖学帮 RAG 知识库启动脚本 (Docker)
echo ========================================
echo.

echo [1/3] 检查 .env 配置...
if not exist ".env" (
    echo   创建 .env 文件...
    copy .env.example .env
    echo   请编辑 .env 文件配置 DASHSCOPE_API_KEY
    pause
    exit /b 1
)

echo [2/3] 构建 Docker 镜像...
docker build -t nuanxuebang-rag:latest .
if errorlevel 1 (
    echo   错误: Docker 构建失败!
    pause
    exit /b 1
)
echo   OK - 镜像构建成功

echo [3/3] 停止旧容器...
docker stop rag-server api-gateway 2>nul
docker rm rag-server api-gateway 2>nul

echo.
echo ========================================
echo 启动服务...
echo ========================================
echo.

echo 启动 RAG Agent (端口 5177)...
docker run -d ^
  --name rag-server ^
  -p 5177:5177 ^
  -v "%cd%\data:/app/data" ^
  -v "%cd%\uploads:/app/uploads" ^
  -v "%cd%\logs:/app/logs" ^
  --env-file .env ^
  nuanxuebang-rag:latest ^
  python app.py

echo 启动 API 网关 (端口 8000)...
docker run -d ^
  --name api-gateway ^
  -p 8000:8000 ^
  -e RAG_AGENT_URL=http://rag-server:5177 ^
  nuanxuebang-rag:latest ^
  python api_gateway.py

echo.
echo ========================================
echo 服务已启动！
echo ========================================
echo.
echo RAG Web界面: http://localhost:5177
echo API网关:     http://localhost:8000
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:5177
