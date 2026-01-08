# 环境变量配置 - 快速参考

## MAX_TOPICS - 控制热搜话题数量

### 默认配置（20个话题）
```bash
node scripts/generate-report.js
```
- 获取：20条热搜
- 生成：约30个创意
- 耗时：约1分钟

### 快速测试（10个话题）
```bash
# Linux/Mac/Git Bash
export MAX_TOPICS=10
node scripts/generate-report.js

# Windows CMD
set MAX_TOPICS=10
node scripts/generate-report.js

# Windows PowerShell
$env:MAX_TOPICS=10
node scripts/generate-report.js
```
- 获取：10条热搜
- 生成：约15个创意
- 耗时：约30秒

### 单次执行（推荐）
```bash
# Linux/Mac/Git Bash
MAX_TOPICS=15 node scripts/generate-report.js

# Windows CMD
set MAX_TOPICS=15 && node scripts/generate-report.js

# Windows PowerShell
$env:MAX_TOPICS=15; node scripts/generate-report.js
```

### 深度分析（30个话题）
```bash
export MAX_TOPICS=30
node scripts/generate-report.js
```
- 获取：30条热搜
- 生成：约45个创意
- 耗时：约2分钟

### 定时任务配置

**Linux Cron:**
```bash
# 每小时运行（20个话题）
0 * * * * cd /path/to/project && MAX_TOPICS=20 node scripts/schedule-task.js

# 每天凌晨2点（30个话题 + 自动富化）
0 2 * * * cd /path/to/project && MAX_TOPICS=30 AUTO_ENRICH=true node scripts/schedule-task.js
```

**Windows 任务计划程序:**
添加环境变量：
```
MAX_TOPICS=20
```

---

## 性能对比

| 话题数 | 生成时间 | 富化时间 | 创意数 | 适用场景 |
|--------|---------|---------|--------|---------|
| **10** | 30秒 | 2-3分钟 | 15-20 | 快速测试 ✅ |
| **20** | 1分钟 | 5-8分钟 | 30-40 | 日常推荐 ⭐ |
| **30** | 2分钟 | 10-15分钟 | 45-60 | 深度分析 |
| **50** | 3-4分钟 | 20-30分钟 | 75-100 | 全面覆盖 |

---

## 推荐配置

### 日常定时任务
```bash
MAX_TOPICS=20  # 平衡速度和质量
```

### 每日深度分析
```bash
MAX_TOPICS=30 AUTO_ENRICH=true  # 完整分析 + AI富化
```

### 快速测试
```bash
MAX_TOPICS=10  # 快速验证
```

---

## 验证配置

```bash
# 检查当前设置
echo $MAX_TOPICS  # Linux/Mac
echo %MAX_TOPICS%  # Windows CMD
echo $env:MAX_TOPICS  # PowerShell
```

---

## 相关文档

- [CONFIG_GUIDE.md](CONFIG_GUIDE.md) - 完整配置指南
- [HYBRID_ENRICHMENT_README.md](HYBRID_ENRICHMENT_README.md) - 混合富化方案
- [schedules/README.md](schedules/README.md) - 定时任务配置
