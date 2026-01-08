# 项目日志：头条热搜产品创意分析系统

## 项目概述

本项目是一个完整的自动化系统，从头条热搜抓取开始，到AI分析生成产品创意，再到自动归档和网站发布的全流程解决方案。

**核心目标**：
- 每日自动追踪头条热搜
- AI深度分析生成产品创意
- 自动归档和网站发布
- 飞书多维表格同步

**技术栈**：
- Node.js（自动化脚本）
- Claude Code（AI分析）
- HTML/CSS/JavaScript（静态网站）
- Git（版本控制）
- Vercel（网站部署）

---

## 实施时间线

### 阶段1：初始设计（2025年）
- 创建 SKILL.md 定义分析流程
- 实现飞书多维表格同步功能（simple-sync.js）
- 完成HTML报告模板设计

### 阶段2：归档系统实现（2026-01-07）
**目标**：建立HTML报告自动归档和索引系统

**完成内容**：

#### 1. 目录结构创建
```
├── reports/                  # HTML报告归档目录
│   └── 2026/01/
│       └── toutiaohot-analysis-2026-01-07.html
├── data/                     # 索引数据目录
│   └── index.json           # 全局索引文件
├── scripts/                  # 自动化脚本目录
│   ├── archive-report.js    # 归档脚本
│   ├── build-index.js       # 索引构建脚本
│   └── generate-website.js  # 网站生成脚本
└── website/                  # 可发布网站目录
```

#### 2. 核心脚本开发

**[scripts/archive-report.js](scripts/archive-report.js)**
- 功能：归档HTML报告并更新索引
- 输入：根目录的HTML文件
- 输出：
  - 移动HTML到 `reports/YYYY/MM/`
  - 提取 `hotTopicsData` 数据
  - 更新 `data/index.json` 索引
  - 自动统计创意数量和评分分布
- 特性：支持增量更新，重复归档会覆盖旧数据

**[scripts/build-index.js](scripts/build-index.js)**
- 功能：扫描所有归档的HTML文件，重建完整索引
- 用途：数据恢复或索引修复
- 处理：递归扫描 `reports/` 目录，提取所有HTML数据

**[scripts/generate-website.js](scripts/generate-website.js)**
- 功能：生成可发布的网站文件
- 操作：
  - 复制索引到 `website/data/`
  - 复制报告到 `website/reports/`
  - 生成 `sitemap.xml`
  - **路径标准化**：自动转换Windows反斜杠为正斜杠

#### 3. 测试验证
```bash
# 归档测试
node scripts/archive-report.js toutiaohot-analysis-2026-01-07.html
# ✅ 成功归档 15个热点, 30个创意, 7个优秀, 23个良好

# 索引生成
# ✅ data/index.json 包含完整统计数据
```

### 阶段3：网站系统实现（2026-01-07）
**目标**：创建可浏览、可搜索的网站展示所有历史报告

#### 1. 网站首页设计

**[website/index.html](website/index.html)**
- 现代化UI设计：渐变色主题、响应式布局
- 统计面板：
  - 总报告数
  - 总创意数
  - 优秀创意数（≥80分）
  - 良好创意数（60-79分）
- 报告列表：按日期倒序展示
- 搜索功能：支持热搜标题和创意名称关键词搜索
- 移动端适配：响应式设计

#### 2. 配置文件

**[config.json](config.json)**
```json
{
  "site": {
    "title": "头条热搜产品创意分析",
    "description": "每日分析头条热搜，发现产品机会",
    "author": "AI产品经理黄叔"
  },
  "paths": {
    "reports": "reports",
    "website": "website",
    "data": "data"
  },
  "deployment": {
    "platform": "vercel",
    "githubRepo": "https://github.com/ablink123/toutiaohot-analysis.git"
  }
}
```

### 阶段4：Git和部署（2026-01-07）

#### 1. Git仓库初始化
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ablink123/toutiaohot-analysis.git
git push -u origin master
```

#### 2. Vercel配置
- 访问 https://vercel.com
- 使用GitHub登录
- 导入仓库 `toutiaohot-analysis`
- **关键配置**：
  - Root Directory: `website/`
  - Build Command: 留空（静态网站）
  - Output Directory: `./`

#### 3. 自动部署
- 推送到GitHub后自动触发部署
- 几分钟后可通过域名访问
- 首次部署地址：https://toutiao.03110357.xyz

### 阶段5：问题修复（2026-01-07）

#### 问题：路径分隔符错误
**现象**：点击报告链接出现404错误，URL显示编码问题
```
https://toutiao.03110357.xyz/reports%C2%826%01outiaohot-analysis-2026-01-07.html
```

**原因**：Windows系统使用反斜杠 `\`，Web URL需要正斜杠 `/`

**解决方案**：
修改 `generate-website.js`，添加路径标准化功能：
```javascript
function normalizePath(obj) {
  if (key === 'file' || key === 'reportPath' || key === 'webPath') {
    normalized[key] = value.replace(/\\/g, '/');
  }
}
```

**验证**：
- ✅ `website/data/index.json` 路径已更新为 `reports/2026/01/...`
- ✅ 推送到GitHub
- ✅ Vercel自动部署

---

## 完整工作流程

### 日常使用流程

1. **生成分析报告**
   ```
   触发Claude Code skill："分析今天的头条热搜产品机会"
   ```

2. **自动执行步骤**
   - 抓取头条热搜前40条
   - WebSearch深度搜索背景
   - AI分析生成产品创意
   - 生成HTML报告
   - 同步到飞书多维表格

3. **归档和发布**
   ```bash
   # 归档HTML报告
   node scripts/archive-report.js toutiaohot-analysis-2026-01-07.html

   # 生成网站
   node scripts/generate-website.js

   # 部署到Vercel
   git add .
   git commit -m "Add new report: 2026-01-07"
   git push
   ```

4. **自动部署**
   - Vercel检测到GitHub更新
   - 几分钟内自动部署
   - 访问网站查看最新报告

### 数据流程图

```
头条热搜API
    ↓
Web Search深度搜索
    ↓
AI分析生成创意
    ↓
生成HTML报告
    ↓
同步到飞书多维表格
    ↓
归档到 reports/YYYY/MM/
    ↓
更新索引 data/index.json
    ↓
生成网站 website/
    ↓
推送到GitHub
    ↓
Vercel自动部署
    ↓
公网访问
```

---

## 文件清单

### 核心脚本（3个）
1. [scripts/archive-report.js](scripts/archive-report.js) - 归档HTML并更新索引（260行）
2. [scripts/build-index.js](scripts/build-index.js) - 重建索引（170行）
3. [scripts/generate-website.js](scripts/generate-website.js) - 生成网站（160行）

### 网站文件（3个）
1. [website/index.html](website/index.html) - 网站首页（370行）
2. [website/data/index.json](website/data/index.json) - 索引数据（自动生成）
3. [website/sitemap.xml](website/sitemap.xml) - SEO站点地图（自动生成）

### 配置文件（2个）
1. [config.json](config.json) - 网站配置
2. [.gitignore](.gitignore) - Git忽略规则

### 文档文件（3个）
1. [README.md](README.md) - 项目说明文档
2. [SKILL.md](skills/toutiaohot-analysis/SKILL.md) - Claude Code Skill定义（459行）
3. [simple-sync.js](simple-sync.js) - 飞书同步脚本（已有）

### 数据目录（3个）
1. [reports/](reports/) - HTML报告归档（按年月组织）
2. [data/](data/) - 索引数据
3. [website/reports/](website/reports/) - 网站使用的报告副本

---

## 技术要点

### 1. 数据提取
从HTML中提取JavaScript对象字面量：
```javascript
const html = fs.readFileSync(htmlPath, 'utf-8');
const match = html.match(/const hotTopicsData = (\[[\s\S]*?\]);/);
const data = eval(`(${match[1]})`); // 使用eval解析JS对象
```

### 2. 路径处理
Windows反斜杠转Web正斜杠：
```javascript
function normalizePath(path) {
  return path.replace(/\\/g, '/');
}
```

### 3. 索引数据结构
```json
{
  "version": "1.0",
  "lastUpdated": "2026-01-07T16:56:10.283Z",
  "statistics": {
    "totalReports": 1,
    "totalIdeas": 30,
    "excellentIdeas": 7
  },
  "reports": [...],
  "allIdeas": [...]
}
```

### 4. 客户端搜索
```javascript
function search(keyword) {
  return indexData.allIdeas.filter(idea =>
    idea.hotTopicTitle.includes(keyword) ||
    idea.ideaName.includes(keyword)
  );
}
```

---

## 索引数据结构

### data/index.json
```json
{
  "version": "1.0",
  "lastUpdated": "ISO时间戳",
  "statistics": {
    "totalReports": 报告总数,
    "totalHotTopics": 热点总数,
    "totalIdeas": 创意总数,
    "excellentIdeas": 优秀创意数,
    "goodIdeas": 良好创意数
  },
  "reports": [
    {
      "date": "YYYY-MM-DD",
      "file": "reports/YYYY/MM/filename.html",
      "hotTopicsCount": 数量,
      "ideasCount": 数量,
      "excellentCount": 数量,
      "goodCount": 数量
    }
  ],
  "allIdeas": [
    {
      "date": "YYYY-MM-DD",
      "hotTopicTitle": "热搜标题",
      "hotTopicRank": 排名,
      "ideaName": "创意名称",
      "coreFeatures": [...],
      "targetUsers": "用户描述",
      "score": 分数,
      "interestingScore": 分数,
      "usefulScore": 分数,
      "reportPath": "报告路径"
    }
  ]
}
```

---

## 测试结果

### 归档测试
```
📁 开始归档: toutiaohot-analysis-2026-01-07.html
  📅 日期: 2026-01-07
  📂 创建目录: reports/2026/01
  ✅ 文件已移动到: reports/2026/01/toutiaohot-analysis-2026-01-07.html
  🔍 提取数据...
  📊 统计: 15个热点, 30个创意, 7个优秀, 23个良好
  💾 索引已更新: data/index.json
```

### 网站生成测试
```
📊 复制索引文件...
  ✅ 索引已复制到: website/data/index.json
  🔄 路径已标准化为正斜杠
📁 复制报告文件...
  ✅ 报告已复制到: website/reports
🗺️  生成sitemap.xml...
  ✅ sitemap.xml已生成
```

### 部署测试
- ✅ Git仓库创建成功
- ✅ 推送到GitHub成功
- ✅ Vercel自动部署成功
- ✅ 网站可正常访问
- ✅ 报告链接可正常打开

---

## Git提交历史

```
2dce97d - Fix path separator issue in website index
17d461d - Add comprehensive README documentation
adacf43 - Update SKILL.md with archiving and website generation workflow
f0a70ed - Initial commit: Toutiao hot search analysis website with archiving system
```

---

## 网站功能清单

### 首页功能
- [x] 统计面板（报告数、创意数、优秀/良好创意）
- [x] 报告列表（按日期倒序）
- [x] 关键词搜索（热搜标题、创意名称）
- [x] 响应式设计（移动端适配）
- [x] 现代化UI（渐变色、卡片设计）

### 搜索功能
- [x] 实时搜索（输入即搜索）
- [x] 按日期分组显示
- [x] 显示匹配统计
- [x] 点击跳转到报告

### 技术特性
- [x] 纯静态网站（无需后端）
- [x] 客户端搜索（无需服务器）
- [x] 自动路径标准化（跨平台兼容）
- [x] SEO优化（sitemap.xml）

---

## 已知限制和注意事项

1. **路径分隔符**
   - Windows使用 `\`，Web使用 `/`
   - 已在 `generate-website.js` 中自动处理

2. **文件名格式**
   - 必须包含日期：`toutiaohot-analysis-YYYY-MM-DD.html`
   - 否则无法正确归档

3. **飞书同步**
   - 需要在归档前完成（归档会移动HTML文件）
   - 失败不影响HTML生成

4. **Vercel部署**
   - 首次部署需配置Root Directory为 `website/`
   - 自动部署需要几分钟时间

5. **索引维护**
   - 如果索引损坏，运行 `node scripts/build-index.js` 重建
   - 支持增量更新

---

## 未来改进方向

### 短期优化
- [ ] 添加更多搜索过滤器（评分范围、日期范围）
- [ ] 实现报告详情页的侧边栏导航
- [ ] 添加数据导出功能（CSV、PDF）
- [ ] 优化移动端体验

### 中期扩展
- [ ] 实现月度汇总报告
- [ ] 添加趋势图表（创意数量趋势）
- [ ] 实现标签系统
- [ ] 添加评论功能

### 长期规划
- [ ] 用户认证系统
- [ ] 个人收藏功能
- [ ] 邮件订阅提醒
- [ ] API接口开放

---

## 相关链接

- **GitHub仓库**: https://github.com/ablink123/toutiaohot-analysis
- **Vercel网站**: https://toutiao.03110357.xyz
- **飞书表格**: https://ai.feishu.cn/base/Rh08b5mZka6vorsSGfAcOPN9nJg?table=tbl7Mc8608QizRnj
- **头条API**: https://apis.tianapi.com/toutiaohot/index

---

## 维护指南

### 日常维护
```bash
# 1. 生成新报告
# 运行 Claude Code skill

# 2. 归档报告
node scripts/archive-report.js toutiaohot-analysis-YYYY-MM-DD.html

# 3. 生成网站
node scripts/generate-website.js

# 4. 部署
git add .
git commit -m "Add new report"
git push
```

### 故障恢复
```bash
# 如果索引损坏
node scripts/build-index.js

# 如果网站需要重建
node scripts/generate-website.js

# 如果Git有问题
git status
git log --oneline
```

### 备份建议
- 定期备份 `data/` 目录
- 定期备份 `reports/` 目录
- GitHub已自动备份所有代码

---

## 项目统计

- **总文件数**: 21个
- **代码行数**: 约2500行
- **实施时间**: 1天
- **归档报告**: 1个
- **产品创意**: 30个
- **优秀创意**: 7个
- **良好创意**: 23个

---

## 总结

本项目成功实现了一个完整的自动化系统，从数据抓取到AI分析，再到归档和网站发布的全流程。通过模块化设计和自动化脚本，大大提高了工作效率，实现了产品创意的积累和可追溯性。

**核心成就**：
✅ 自动归档系统（按年月组织）
✅ 可搜索的网站（关键词搜索）
✅ 自动部署（Vercel + GitHub集成）
✅ 飞书同步（多维表格）
✅ 跨平台兼容（路径自动标准化）

**项目价值**：
- 提高素材积累效率
- 便于历史数据检索
- 支持数据可视化分析
- 实现知识沉淀和复用

---

*项目日志生成时间: 2026-01-07*
*最后更新: 2026-01-07*
