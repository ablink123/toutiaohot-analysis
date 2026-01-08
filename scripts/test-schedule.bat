@echo off
REM 测试定时任务脚本（不执行skill，只测试后续流程）

echo ========================================
echo   测试定时任务脚本
echo ========================================
echo.

REM 设置测试环境变量
set TEST_MODE=1

REM 检查工作目录
echo [1/5] 检查工作目录...
cd /d "%~dp0.."
echo 当前目录: %CD%
echo.

REM 检查必要文件
echo [2/5] 检查必要文件...
if exist "simple-sync.js" (
    echo [OK] simple-sync.js 存在
) else (
    echo [ERROR] simple-sync.js 不存在
    pause
    exit /b 1
)

if exist "scripts\archive-report.js" (
    echo [OK] scripts\archive-report.js 存在
) else (
    echo [ERROR] scripts\archive-report.js 不存在
    pause
    exit /b 1
)

if exist "scripts\generate-website.js" (
    echo [OK] scripts\generate-website.js 存在
) else (
    echo [ERROR] scripts\generate-website.js 不存在
    pause
    exit /b 1
)
echo.

REM 检查目录结构
echo [3/5] 检查目录结构...
if exist "reports" (
    echo [OK] reports/ 目录存在
) else (
    echo [INFO] 创建 reports/ 目录
    mkdir reports
)

if exist "data" (
    echo [OK] data/ 目录存在
) else (
    echo [INFO] 创建 data/ 目录
    mkdir data
)

if exist "website" (
    echo [OK] website/ 目录存在
) else (
    echo [ERROR] website/ 目录不存在
    pause
    exit /b 1
)
echo.

REM 检查 Git 配置
echo [4/5] 检查 Git 配置...
git status >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git 已初始化
    git remote -v | findstr "github.com" >nul
    if %errorlevel% equ 0 (
        echo [OK] GitHub 远程仓库已配置
    ) else (
        echo [WARNING] 未检测到 GitHub 远程仓库
    )
) else (
    echo [WARNING] Git 未初始化
)
echo.

REM 检查 Claude Code CLI
echo [5/5] 检查 Claude Code CLI...
where claude >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Claude Code CLI 已安装
    claude --version
) else (
    echo [WARNING] Claude Code CLI 未找到
    echo 请确保已安装: npm install -g @anthropic-ai/claude-code
)
echo.

echo ========================================
echo   检查完成！
echo ========================================
echo.
echo 修复内容:
echo 1. ✅ 添加 --yes 参数跳过确认
echo 2. ✅ 修正工作目录路径
echo 3. ✅ 启用自动 Git 推送
echo.
echo 现在可以运行:
echo   node scripts\schedule-task.js
echo.
pause
