# 定时任务配置指南

本目录包含三种定时任务配置方案，可根据你的操作系统选择合适的方案。

## 方案对比

| 方案 | 适用系统 | 优点 | 缺点 | 推荐度 |
|------|---------|------|------|--------|
| **Windows任务计划程序** | Windows 10/11 | 原生支持，界面管理 | 需要管理员权限 | ⭐⭐⭐⭐⭐ |
| **Linux/Mac Cron** | Linux, macOS | 原生支持，稳定可靠 | 需要命令行操作 | ⭐⭐⭐⭐⭐ |
| **node-cron 服务** | 跨平台 | 跨平台，易调试 | 需要保持运行 | ⭐⭐⭐⭐ |

---

## 方案1: Windows任务计划程序 (推荐Windows用户)

### 安装步骤

1. **右键以管理员身份运行** `schedules/setup-windows-task.bat`

2. 脚本会自动：
   - 注册任务到Windows任务计划程序
   - 配置每天3次触发 (8:00, 14:00, 20:00)
   - 验证任务配置

3. 验证安装：
   ```
   打开"任务计划程序" (Task Scheduler)
   查看"任务计划程序库" → 找到"头条热搜分析"任务
   ```

### 手动管理任务

```bash
# 查看任务
schtasks /Query /TN "头条热搜分析" /FO LIST

# 手动运行任务
schtasks /Run /TN "头条热搜分析"

# 删除任务
schtasks /Delete /TN "头条热搜分析" /F

# 禁用任务
schtasks /Change /TN "头条热搜分析" /Disable

# 启用任务
schtasks /Change /TN "头条热搜分析" /Enable
```

### 查看任务历史

在任务计划程序中：
1. 右键点击"头条热搜分析"任务
2. 选择"查看历史记录"
3. 可以看到每次运行的详细信息

---

## 方案2: Linux/Mac Cron (推荐Linux/Mac用户)

### 安装步骤

```bash
# 赋予执行权限
chmod +x schedules/linux-crontab.sh

# 运行安装脚本
./schedules/linux-crontab.sh
```

### 验证安装

```bash
# 查看当前用户的cron任务
crontab -l
```

应该看到类似以下内容：
```
# 头条热搜分析任务 - 每天3次 (8:00, 14:00, 20:00)

0 8 * * * cd "/path/to/project" && node scripts/schedule-task.js >> logs/schedule-8am.log 2>&1
0 14 * * * cd "/path/to/project" && node scripts/schedule-task.js >> logs/schedule-14pm.log 2>&1
0 20 * * * cd "/path/to/project" && node scripts/schedule-task.js >> logs/schedule-20pm.log 2>&1
```

### 常用命令

```bash
# 编辑cron任务
crontab -e

# 删除所有头条热搜相关任务
crontab -l | grep -v '头条热搜分析' | crontab -

# 查看日志
tail -f logs/schedule-8am.log

# 查看最近一次运行
tail -100 logs/schedule-20pm.log
```

### 调试技巧

```bash
# 测试环境变量
crontab -l | grep -v '^#' | bash -v

# 检查cron服务状态 (Linux)
sudo systemctl status cron

# 检查cron服务状态 (macOS)
sudo launchctl list | grep cron
```

---

## 方案3: node-cron 服务 (跨平台)

### 安装依赖

```bash
# 项目内安装
npm install node-cron --save

# 或全局安装
npm install -g node-cron
```

### 使用方法

#### 方式1: 前台运行 (推荐用于测试)

```bash
node schedules/scheduler-service.js
```

输出示例：
```
========================================
   头条热搜分析调度服务
========================================
📁 项目目录: d:\DD-Stock\AI产品经理黄叔\1128TouTiao
📂 日志目录: d:\DD-Stock\AI产品经理黄叔\1128TouTiao\logs

⏰ 创建任务: 08:00
   Cron表达式: 0 8 * * *
⏰ 创建任务: 14:00
   Cron表达式: 0 14 * * *
⏰ 创建任务: 20:00
   Cron表达式: 0 20 * * *

========================================
   所有任务已启动
========================================
⏰ 调度时间:
   - 08:00
   - 14:00
   - 20:00

💡 提示:
   - 保持此窗口运行以执行定时任务
   - 按 Ctrl+C 停止服务
   - 日志保存在 logs/ 目录
========================================
```

#### 方式2: 后台运行 (推荐生产环境)

**Linux/Mac:**
```bash
# 使用 nohup
nohup node schedules/scheduler-service.js > logs/scheduler.log 2>&1 &

# 使用 PM2 (推荐)
npm install -g pm2
pm2 start schedules/scheduler-service.js --name toutiao-scheduler
pm2 save
pm2 startup
```

**Windows:**
```bash
# 使用 PM2
npm install -g pm2
pm2 start schedules/scheduler-service.js --name toutiao-scheduler
pm2 save
pm2 startup
```

#### 方式3: 创建系统服务

**Windows (使用node-windows):**
```bash
npm install -g node-windows
node schedules/create-windows-service.js
```

**Linux (使用systemd):**
创建 `/etc/systemd/system/toutiao-scheduler.service`:
```ini
[Unit]
Description=头条热搜分析调度服务
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/project
ExecStart=/usr/bin/node /path/to/project/schedules/scheduler-service.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable toutiao-scheduler
sudo systemctl start toutiao-scheduler
sudo systemctl status toutiao-scheduler
```

### PM2管理命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs toutiao-scheduler

# 重启服务
pm2 restart toutiao-scheduler

# 停止服务
pm2 stop toutiao-scheduler

# 删除服务
pm2 delete toutiao-scheduler

# 监控
pm2 monit
```

---

## 手动测试

无论使用哪种方案，都可以手动运行任务进行测试：

```bash
node scripts/schedule-task.js
```

预期输出：
```
========================================
   头条热搜分析任务
========================================
⏰ 开始时间: 2026-01-08 14:00:00

📝 文件名: toutiaohot-analysis-2026-01-08-14.html

🔄 执行 Claude Code skill...
✅ 执行 Claude Code skill完成

📄 生成文件: toutiaohot-analysis-2026-01-08-14.html

🔄 同步到飞书...
✅ 同步到飞书完成

🔄 归档HTML报告...
✅ 归档HTML报告完成

🔄 生成网站...
✅ 生成网站完成

========================================
   任务完成!
========================================
⏱️  总耗时: 245秒
📄 生成文件: toutiaohot-analysis-2026-01-08-14.html
💡 下一步: 查看报告或部署网站
```

---

## 故障排查

### Windows任务计划程序无法运行

1. **检查路径**: 确保 `schedules\windows-task-scheduler.xml` 中的路径正确
2. **检查权限**: 右键以管理员身份运行安装脚本
3. **查看历史**: 在任务计划程序中查看任务运行历史
4. **手动测试**: 直接运行 `node scripts\schedule-task.js` 看是否有错误

### Cron任务不执行

1. **检查环境变量**: Cron运行时可能没有完整的环境变量
   ```bash
   # 在 crontab 中添加
   PATH=/usr/local/bin:/usr/bin:/bin
   ```

2. **检查权限**: 确保脚本有执行权限
   ```bash
   chmod +x scripts/schedule-task.js
   ```

3. **查看日志**: 检查 `logs/` 目录下的日志文件

4. **检查cron服务**:
   ```bash
   # Linux
   sudo systemctl status cron

   # macOS
   sudo launchctl list | grep cron
   ```

### node-cron服务问题

1. **未安装node-cron**:
   ```bash
   npm install node-cron
   ```

2. **端口冲突**: 如果使用PM2，确保没有同名进程

3. **查看日志**:
   ```bash
   # 前台运行查看输出
   node schedules/scheduler-service.js

   # PM2日志
   pm2 logs toutiao-scheduler
   ```

---

## 配置自定义时间

### 修改调度时间

**方案1 - Windows:** 编辑 `schedules/windows-task-scheduler.xml`，修改 `<StartBoundary>` 标签

**方案2 - Cron:** 编辑crontab `crontab -e`，修改时间表达式

**方案3 - node-cron:** 编辑 `schedules/scheduler-service.js`，修改 `config.times` 数组

### Cron表达式说明

```
┌───────────── 分钟 (0 - 59)
│ ┌─────────── 小时 (0 - 23)
│ │ ┌───────── 日期 (1 - 31)
│ │ │ ┌─────── 月份 (1 - 12)
│ │ │ │ ┌───── 星期 (0 - 6，0=周日)
│ │ │ │ │
* * * * * 命令
```

示例：
```
0 8 * * *    # 每天8:00
0 */6 * * *  # 每6小时
0 8,14,20 * * * # 每天8:00, 14:00, 20:00
0 8 * * 1-5  # 周一到周五8:00
```

---

## 日志管理

### 日志文件位置

所有日志保存在 `logs/` 目录：

```
logs/
├── schedule-8am-2026-01-08.log      # 早晨8点任务日志
├── schedule-14pm-2026-01-08.log     # 下午2点任务日志
├── schedule-20pm-2026-01-08.log     # 晚上8点任务日志
└── scheduler.log                    # node-cron服务日志
```

### 日志轮转 (可选)

使用 `logrotate` (Linux) 自动清理旧日志：

创建 `/etc/logrotate.d/toutiao-scheduler`:
```
/path/to/project/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## 可选：自动推送到GitHub

如果你想每次分析后自动推送到GitHub（触发Vercel部署），可以修改配置：

### 修改自动推送设置

编辑 `scripts/schedule-task.js`，将 `autoGitPush` 改为 `true`:

```javascript
const config = {
  // ... 其他配置
  autoGitPush: true,  // 改为 true
  gitCommitTemplate: 'Add report: {date} {time}'
};
```

### 设置Git凭据（避免每次输入密码）

**Windows:**
```bash
# 使用Windows凭据管理器
git config --global credential.helper wincred
# 或使用管理器存储
git config --global credential.helper manager-core
```

**Linux/Mac:**
```bash
# 使用SSH密钥（推荐）
ssh-keygen -t ed25519 -C "your_email@example.com"
# 将公钥添加到GitHub账户

# 或使用凭据缓存
git config --global credential.helper cache
git config --global credential.helper 'cache --timeout=3600'
```

---

## 推荐方案总结

### Windows用户
1. 首选: **Windows任务计划程序** (方案1)
2. 备选: **node-cron + PM2** (方案3)

### Linux/Mac用户
1. 首选: **Cron** (方案2)
2. 备选: **node-cron + PM2** (方案3)

### 开发测试
推荐使用 **node-cron前台运行** (方案3，方式1)，便于调试

---

## 文件清单

- `schedule-task.js` - 主任务脚本（在父目录）
- `windows-task-scheduler.xml` - Windows任务配置
- `setup-windows-task.bat` - Windows安装脚本
- `linux-crontab.sh` - Linux/Mac安装脚本
- `scheduler-service.js` - node-cron服务脚本
- `README.md` - 本文档
