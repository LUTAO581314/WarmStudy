@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 暖学帮 RAG 知识库启动脚本 (venv)
echo ========================================
echo.

echo [1/5] 检查虚拟环境...
if not exist ".venv\Scripts\python.exe" (
    echo   虚拟环境不存在，创建中...
    python -m venv .venv
    if errorlevel 1 (
        echo   错误: 虚拟环境创建失败!
        pause
        exit /b 1
    )
)

echo [2/5] 验证Python可执行性...
.venv\Scripts\python.exe -c "import sys; sys.exit(0)" >nul 2>&1
if errorlevel 1 (
    echo   修复 pyvenv.cfg...
    > .venv\pyvenv.cfg.tmp (
        echo home = C:\Users\34206\anaconda3\envs\agent
        echo include-system-site-packages = false
        echo version = 3.13.0
        echo executable = C:\Users\34206\anaconda3\envs\agent\python.exe
        echo command = C:\Users\34206\anaconda3\envs\agent\python.exe -m venv %~dp0.venv
    )
    move /y .venv\pyvenv.cfg.tmp .venv\pyvenv.cfg >nul
)

.venv\Scripts\python.exe -c "import sys; print('Python 版本: ' + sys.version.split()[0])"
if errorlevel 1 (
    echo   错误: Python 无法运行!
    pause
    exit /b 1
)
echo   OK

echo [3/5] 激活虚拟环境...
call .venv\Scripts\Activate.bat >nul 2>&1
if errorlevel 1 (
    echo   错误: 虚拟环境激活失败!
    pause
    exit /b 1
)
echo   OK - 虚拟环境已激活

echo [4/5] 检查依赖完整性...
pip show flask flask-cors chromadb dashscope >nul 2>&1
if errorlevel 1 (
    echo   检测到缺失依赖，开始安装...
    pip install --upgrade pip
    pip install -r requirements.txt
    if errorlevel 1 (
        echo   错误: 依赖安装失败!
        pause
        exit /b 1
    )
    echo   依赖安装完成
) else (
    echo   OK - 依赖已就绪
)

echo [5/5] 检查环境变量...
if not exist ".env" (
    echo   警告: .env 文件不存在，创建默认配置...
    (
        echo DASHSCOPE_API_KEY=your_api_key_here
        echo MINIMAX_API_KEY=your_api_key_here
        echo CHAT_MODEL=minimax
    ) > .env
    echo   请编辑 .env 文件配置 API密钥
)

echo.
echo ========================================
echo 启动服务...
echo ========================================
echo.

echo 启动 RAG Agent (端口 5177)...
start "RAG-Agent-5177" cmd /k "python app.py"

echo.
echo ========================================
echo 服务已启动！
echo ========================================
echo.
echo RAG Web界面: http://localhost:5177
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:5177
