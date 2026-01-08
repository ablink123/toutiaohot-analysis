# 配置指南

## 环境变量配置

本系统支持通过环境变量灵活控制话题数量。

### MAX_TOPICS - 控制热搜话题数量

**默认值：** 20

**说明：** 控制从头条热搜API获取的话题数量

---

## 使用方法

### 方法1：临时设置（Windows CMD/PowerShell）

**CMD:**
```cmd
set MAX_TOPICS=15
node scripts/generate-report.js
```

**PowerShell:**
```powershell
$env:MAX_TOPICS=15
node scripts/generate-report.js
```

**Git Bash / Linux / Mac:**
```bash
export MAX_TOPICS=15
node scripts/generate-report.js
```

### 方法2：单次执行

**Windows:**
```cmd
set MAX_TOPICS=30 && node scripts/generate-report.js
```

**Linux/Mac:**
```bash
MAX_TOPICS=30 node scripts/generate-report.js
```

### 方法3：永久设置（推荐）

**创建 `.env` 文件：**

在项目根目录创建 `.env` 文件：

```env
# 热搜话题数量（默认20）
MAX_TOPICS=20

# 是否启用自动富化（默认false）
AUTO_ENRISH=false
```

**修改 `generate-report.js` 加载环境变量：**

在文件开头添加：
```javascript
require('dotenv').config();
```

并安装依赖：
```bash
npm install dotenv
```

---

## 推荐配置

### 快速测试（5-10个话题）
```bash
set MAX_TOPICS=10
node scripts/generate-report.js
```
- ⚡ 生成时间：约30秒
- 🤖 富化时间：约2-3分钟
- 💡 创意数量：约15-20个

### 日常使用（15-20个话题）
```bash
set MAX_TOPICS=20
node scripts/generate-report.js
```
- ⚡ 生成时间：约1分钟
- 🤖 富化时间：约5-8分钟
- 💡 创意数量：约30-40个

### 深度分析（25-30个话题）
```bash
set MAX_TOPICS=30
node scripts/generate-report.js
```
- ⚡ 生成时间：约2分钟
- 🤖 富化时间：约10-15分钟
- 💡 创意数量：约45-60个

### 全面覆盖（50个话题）
```bash
set MAX_TOPICS=50
node scripts/generate-report.js
```
- ⚡ 生成时间：约3-4分钟
- 🤖 富化时间：约20-30分钟
- 💡 创意数量：约75-100个

---

## 定时任务配置

### Windows 任务计划程序

在任务属性中设置环境变量：

```xml
<Environment>
  <Variable name="MAX_TOPICS" value="20"/>
</Environment>
```

### Linux Cron

在 crontab 中设置：

```bash
# 每小时运行，抓取20个话题
0 * * * * cd /path/to/project && MAX_TOPICS=20 node scripts/schedule-task.js

# 每天2点运行，抓取50个话题并富化
0 2 * * * cd /path/to/project && MAX_TOPICS=50 AUTO_ENRICH=true node scripts/schedule-task.js
```

---

## 性能对比

| 话题数 | 生成时间 | 富化时间 | 创意数 | 适用场景 |
|--------|---------|---------|--------|---------|
| 10 | 30秒 | 2-3分钟 | 15-20 | 快速测试 |
| 20 | 1分钟 | 5-8分钟 | 30-40 | **日常推荐** |
| 30 | 2分钟 | 10-15分钟 | 45-60 | 深度分析 |
| 50 | 3-4分钟 | 20-30分钟 | 75-100 | 全面覆盖 |

---

## 其他环境变量

### AUTO_ENRICH - 自动启用富化

**默认值：** false

**说明：** 设置为 `true` 时，生成报告后自动执行AI富化

```bash
# Windows
set AUTO_ENRICH=true
node scripts/schedule-task.js

# Linux/Mac
AUTO_ENRICH=true node scripts/schedule-task.js
```

---

## 完整示例

### 场景1：每小时快速发布（不富化）
```bash
# Windows 任务计划程序
MAX_TOPICS=20 node scripts/schedule-task.js

# Linux Cron
0 * * * * cd /path/to/project && MAX_TOPICS=20 node scripts/schedule-task.js
```

### 场景2：每天深度分析（富化）
```bash
# Windows 任务计划程序（每天凌晨2点）
MAX_TOPICS=30 AUTO_ENRICH=true node scripts/schedule-task.js

# Linux Cron
0 2 * * * cd /path/to/project && MAX_TOPICS=30 AUTO_ENRICH=true node scripts/schedule-task.js
```

### 场景3：手动控制
```bash
# 生成10个话题的快速报告
set MAX_TOPICS=10
node scripts/generate-report.js

# 稍后手动富化
node scripts/enrich-report.js
```

---

## 注意事项

1. **话题数量限制：**
   - 最小值：1
   - 最大值：50（API限制）
   - 推荐值：15-25

2. **富化时间：**
   - 每个话题约需20-30秒
   - 20个话题约需5-8分钟
   - 建议在闲暇时间运行

3. **API限制：**
   - 免费API可能有调用频率限制
   - 建议每小时最多运行1-2次

4. **Claude API消耗：**
   - 富化功能使用Claude Code CLI
   - 会消耗API额度
   - 可通过 `MAX_TOPICS` 控制消耗

---

## 故障排查

### 问题1：环境变量不生效

**检查：**
```bash
# Windows CMD
echo %MAX_TOPICS%

# PowerShell
echo $env:MAX_TOPICS

# Linux/Mac
echo $MAX_TOPICS
```

**解决：** 确保在同一个会话中设置和运行

### 问题2：话题数量不对

**原因：** API返回数据少于请求数量

**解决：** 这是正常的，API可能没有那么多热搜数据

### 问题3：富化太慢

**优化：**
- 减少 `MAX_TOPICS` 数量
- 使用演示脚本快速测试：`node scripts/enrich-report-demo.js`
- 选择性富化重要话题

---

## 相关文件

- [scripts/generate-report.js](scripts/generate-report.js) - 报告生成脚本
- [scripts/enrich-report.js](scripts/enrich-report.js) - 富化脚本
- [scripts/schedule-task.js](scripts/schedule-task.js) - 定时任务
- [schedules/README.md](schedules/README.md) - 定时任务配置
