#!/bin/bash
# 头条热搜分析任务 - Linux/Mac Cron安装脚本
# 使用方法: chmod +x schedules/linux-crontab.sh && schedules/linux-crontab.sh

set -e

echo "========================================"
echo "  头条热搜分析任务安装 (Linux/Mac)"
echo "========================================"
echo ""

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "[1/3] 检测项目路径..."
echo "项目目录: $PROJECT_DIR"

# 创建临时的crontab条目
TEMP_CRON=$(mktemp)

echo ""
echo "[2/3] 生成Cron配置..."

# 添加注释
cat > "$TEMP_CRON" << EOF
# 头条热搜分析任务 - 每天3次 (8:00, 14:00, 20:00)
# 项目路径: $PROJECT_DIR
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')

# 早晨 8:00
0 8 * * * cd "$PROJECT_DIR" && node scripts/schedule-task.js >> logs/schedule-8am.log 2>&1

# 下午 14:00
0 14 * * * cd "$PROJECT_DIR" && node scripts/schedule-task.js >> logs/schedule-14pm.log 2>&1

# 晚上 20:00
0 20 * * * cd "$PROJECT_DIR" && node scripts/schedule-task.js >> logs/schedule-20pm.log 2>&1
EOF

echo "Cron配置已生成:"
cat "$TEMP_CRON"
echo ""

# 创建日志目录
mkdir -p "$PROJECT_DIR/logs"

echo "[3/3] 安装Cron任务..."

# 检查是否已存在头条热搜的cron任务
if crontab -l 2>/dev/null | grep -q "头条热搜分析"; then
    echo "检测到已存在的头条热搜分析任务"
    read -p "是否要覆盖现有任务? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # 移除旧的任务
        crontab -l 2>/dev/null | grep -v "头条热搜分析" | crontab -
        echo "旧任务已删除"
    else
        echo "取消安装"
        rm -f "$TEMP_CRON"
        exit 0
    fi
fi

# 添加新的cron任务
(crontab -l 2>/dev/null; cat "$TEMP_CRON") | crontab -

rm -f "$TEMP_CRON"

echo ""
echo "========================================"
echo "  安装完成！"
echo "========================================"
echo ""
echo "任务将在以下时间自动运行："
echo "  - 08:00 (早晨)"
echo "  - 14:00 (下午)"
echo "  - 20:00 (晚上)"
echo ""
echo "日志文件保存在: $PROJECT_DIR/logs/"
echo ""
echo "常用命令:"
echo "  查看当前cron任务:  crontab -l"
echo "  编辑cron任务:      crontab -e"
echo "  查看日志:          tail -f logs/schedule-*.log"
echo "  手动测试任务:      node scripts/schedule-task.js"
echo "  删除所有任务:      crontab -l | grep -v '头条热搜分析' | crontab -"
echo ""
