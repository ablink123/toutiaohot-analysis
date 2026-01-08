@echo off
REM 头条热搜分析任务 - Windows任务计划程序安装脚本
REM 使用方法：右键以管理员身份运行此脚本

echo ========================================
echo   头条热搜分析任务安装
echo ========================================
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 请右键以管理员身份运行此脚本！
    pause
    exit /b 1
)

echo [1/3] 注册任务计划程序...
schtasks /Create /TN "头条热搜分析" /XML "schedules\windows-task-scheduler.xml"

if %errorLevel% equ 0 (
    echo [成功] 任务已创建！
) else (
    echo [失败] 任务创建失败，错误代码: %errorLevel%
    pause
    exit /b 1
)

echo.
echo [2/3] 验证任务配置...
schtasks /Query /TN "头条热搜分析" /FO LIST

echo.
echo [3/3] 完成！
echo.
echo ========================================
echo   任务将在以下时间自动运行：
echo   - 08:00 (早晨)
echo   - 14:00 (下午)
echo   - 20:00 (晚上)
echo ========================================
echo.
echo 如需手动测试，运行：
echo   node scripts\schedule-task.js
echo.
echo 如需删除任务，运行：
echo   schtasks /Delete /TN "头条热搜分析" /F
echo.

pause
