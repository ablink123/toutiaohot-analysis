# 头条热搜分析系统 - 混合富化方案

## 概述

本系统采用**混合富化方案**，结合快速生成和AI深度分析的优势：

1. **快速生成**：立即生成基础HTML报告（包含热搜标题、热度值、产品创意）
2. **异步富化**：后台执行AI深度分析，为每个热搜添加详细事件脉络
3. **灵活控制**：可选择自动富化或手动触发

---

## 工作流程

### 快速模式（默认）

```bash
node scripts/schedule-task.js
```

**执行步骤：**
1. ✅ 获取头条热搜API数据
2. ✅ 生成产品创意分析
3. ✅ 生成HTML报告（包含基础数据）
4. ⏭️ 跳过AI富化（事件脉络显示"暂无详细事件脉络"）
5. ✅ 同步到飞书
6. ✅ 归档HTML报告
7. ✅ 生成网站
8. ✅ Git提交推送

**耗时：约 1-2 分钟**

### 深度模式（AI富化）

```bash
# 方法1：设置环境变量自动富化
set AUTO_ENRICH=true
node scripts/schedule-task.js

# 方法2：手动富化已生成的报告
node scripts/enrich-report.js
```

**执行步骤：**
1. ✅ 获取头条热搜API数据
2. ✅ 生成产品创意分析
3. ✅ 生成HTML报告
4. 🤖 **AI深度分析每个热搜（通过Claude Code + Web Search）**
5. ✅ 更新HTML报告中的事件脉络
6. ✅ 同步到飞书
7. ✅ 归档HTML报告
8. ✅ 生成网站
9. ✅ Git提交推送

**耗时：约 10-15 分钟**（取决于热搜数量）

---

## 手动富化命令

### 将指定报告加入富化队列

```bash
node scripts/enrich-report.js add "toutiaohot-analysis-2026-01-08-14.html"
```

### 处理所有待富化任务

```bash
node scripts/enrich-report.js
```

### 处理指定队列文件

```bash
node scripts/enrich-report.js process ".enrichment-queue/toutiaohot-analysis-2026-01-08-14.html.json"
```

---

## 富化队列

队列文件存储在 `.enrichment-queue/` 目录：

```
.enrichment-queue/
└── toutiaohot-analysis-2026-01-08-14.html.json
```

**队列文件结构：**
```json
{
  "reportPath": "d:/path/to/toutiaohot-analysis-2026-01-08-14.html",
  "reportName": "toutiaohot-analysis-2026-01-08-14.html",
  "createdAt": "2026-01-08T14:30:00Z",
  "status": "pending",  // pending | processing | completed | failed
  "topics": [
    {
      "rank": 1,
      "title": "热搜标题",
      "currentTimeline": "暂无详细事件脉络"
    }
  ]
}
```

---

## AI分析原理

### 快速模式的限制

在快速模式下，`eventTimeline` 字段显示：
- `"暂无详细事件脉络"` - 因为没有执行web search
- 仅包含API返回的基础数据（标题、热度值）

### 深度模式的优势

在深度模式下，系统会：
1. 调用 **Claude Code CLI**
2. 执行 **Web Search** 查询每个热搜的最新进展
3. 整理关键事件节点
4. 按时间顺序排列
5. 更新HTML中的 `eventTimeline` 字段

**示例富化结果：**
```
📅 事件脉络

• 2026年1月7日：河南多地网友拍到夜空出现神秘光点
• 2026年1月8日凌晨：天文专家初步判断为星链卫星过境
• 2026年1月8日上午：SpaceX确认第131批星链发射成功
• 事件引发广泛讨论，多个城市观测到类似现象
```

---

## 定时任务配置

### Windows Task Scheduler

创建任务时，**不设置** `AUTO_ENRICH` 环境变量（使用快速模式）：

```xml
<Command>
node scripts/schedule-task.js
</Command>
```

如需深度模式，添加环境变量：
```xml
<Environment>
  <Variable name="AUTO_ENRICH" value="true"/>
</Environment>
```

### Linux Cron

快速模式：
```bash
0 * * * * cd /path/to/project && node scripts/schedule-task.js
```

深度模式：
```bash
0 * * * * cd /path/to/project && AUTO_ENRICH=true node scripts/schedule-task.js
```

---

## 目录结构

```
d:\DD-Stock\AI产品经理黄叔\1128TouTiao\
├── scripts/
│   ├── generate-report.js       # 生成基础报告（自动加入富化队列）
│   ├── enrich-report.js         # 富化脚本（新增）
│   ├── schedule-task.js         # 定时任务（已更新）
│   ├── archive-report.js
│   └── generate-website.js
├── .enrichment-queue/           # 富化队列目录（新增）
│   └── *.json
├── reports/
│   └── 2026/01/
│       └── toutiaohot-analysis-*.html
└── toutiaohot-analysis-*.html   # 最新报告（根目录）
```

---

## 使用建议

### 场景1：快速发布（推荐）

**定时任务使用快速模式**，确保每小时快速生成报告并发布。

```bash
# 每小时运行（快速模式）
0 * * * * node scripts/schedule-task.js
```

**优点：**
- ⚡ 快速生成（1-2分钟）
- 📤 立即发布到网站
- 🔄 及时更新内容

**缺点：**
- ⚠️ 事件脉络显示"暂无详细事件脉络"

### 场景2：深度分析

**手动运行深度模式**，在闲暇时间为历史报告添加详细分析。

```bash
# 周末或夜间运行（深度模式）
AUTO_ENRICH=true node scripts/schedule-task.js
```

或手动富化已发布的报告：
```bash
node scripts/enrich-report.js
```

**优点：**
- 🤖 AI深度分析
- 📅 详细事件脉络
- 🔍 高质量内容

**缺点：**
- ⏱️ 耗时较长（10-15分钟）
- 💰 需要Claude API额度

### 场景3：混合方案（推荐）

**定时任务快速生成 + 手动深度富化**

```bash
# 每小时快速生成
0 * * * * node scripts/schedule-task.js

# 每天凌晨2点批量富化前一天的报告
0 2 * * * node scripts/enrich-report.js
```

**优点：**
- ⚡ 及时发布
- 🤖 高质量内容
- 🎯 平衡速度和质量

---

## 故障排查

### 问题1：富化队列文件未创建

**原因：** `generate-report.js` 无法提取 `hotTopicsData`

**解决：**
1. 检查HTML文件格式是否正确
2. 确认 `hotTopicsData` 变量存在
3. 手动添加到队列：
   ```bash
   node scripts/enrich-report.js add "report.html"
   ```

### 问题2：Claude Code命令执行失败

**原因：** Claude Code CLI未安装或不在PATH中

**解决：**
```bash
npm install -g @anthropic-ai/claude-code
```

### 问题3：富化后HTML未更新

**原因：** 文件权限或路径问题

**解决：**
1. 检查文件是否被占用（浏览器打开）
2. 确认有写入权限
3. 查看队列文件中的 `status` 和 `error` 字段

### 问题4：富化速度太慢

**优化方案：**
1. 减少热搜数量（修改 `maxTopics` 配置）
2. 调整请求间隔（修改 `setTimeout` 时间）
3. 使用并发处理（需要改写脚本）

---

## 性能对比

| 模式 | 生成时间 | 内容质量 | Claude消耗 | 推荐场景 |
|------|---------|---------|-----------|---------|
| 快速模式 | 1-2分钟 | 基础 | 极少 | 定时任务 |
| 深度模式 | 10-15分钟 | 高质量 | 中等 | 手动执行 |
| 混合方案 | 1-2分钟 | 基础→高质量 | 中等 | **推荐** |

---

## 未来改进

1. **增量富化**：只富化新的热搜，跳过已分析过的
2. **缓存机制**：缓存分析结果，避免重复搜索
3. **批量优化**：并发处理多个热搜
4. **智能调度**：根据热搜重要性决定是否富化
5. **API集成**：使用专门的新闻API替代web search

---

## 相关文件

- [scripts/generate-report.js](scripts/generate-report.js) - 基础报告生成
- [scripts/enrich-report.js](scripts/enrich-report.js) - AI富化脚本
- [scripts/schedule-task.js](scripts/schedule-task.js) - 定时任务编排
- [schedules/README.md](schedules/README.md) - 定时任务配置指南

---

## 更新日志

### 2026-01-08
- ✅ 创建 `enrich-report.js` 富化脚本
- ✅ 更新 `generate-report.js` 自动加入队列
- ✅ 更新 `schedule-task.js` 支持可选富化
- ✅ 添加 `.enrichment-queue/` 队列目录
- ✅ 编写混合方案文档
