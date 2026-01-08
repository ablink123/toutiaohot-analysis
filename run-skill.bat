@echo off
REM Run complete Toutiao hot search analysis skill

echo ========================================
echo   Toutiao Hot Search Product Analysis
echo ========================================
echo.
echo Starting Claude Code CLI to run the full skill
echo This will include:
echo   1. WebSearch for each topic
echo   2. AI analysis and product ideas
echo   3. Generate HTML report
echo   4. Sync to Feishu
echo   5. Archive report
echo   6. Generate website
echo.
echo Estimated time: 10-20 minutes
echo.
pause

cd /d "%~dp0"
claude "分析今天的头条热搜产品机会"

echo.
echo ========================================
echo   Complete!
echo ========================================
echo.
pause
