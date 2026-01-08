# 头条热搜产品创意分析

每日追踪头条热搜，AI分析生成产品创意，自动归档并发布到网站。

## 功能特点

- **自动抓取热搜**: 从头条API获取前40条热搜
- **AI深度分析**: 使用Web Search搜索背景，生成产品创意
- **双维度评分**: 从有趣度(80%)和有用度(20%)评分
- **自动归档**: HTML报告按日期归档到 `reports/YYYY/MM/`
- **可搜索网站**: 生成带搜索功能的网站，支持关键词检索
- **飞书同步**: 自动同步创意到飞书多维表格

## 目录结构

```
├── reports/                  # HTML报告归档
│   └── 2026/01/
│       └── toutiaohot-analysis-2026-01-07.html
├── data/                     # 索引数据
│   └── index.json           # 全局索引
├── website/                  # 可发布网站
│   ├── index.html           # 首页
│   ├── data/index.json      # 索引副本
│   └── reports/             # 报告副本
├── scripts/                  # 自动化脚本
│   ├── archive-report.js    # 归档脚本
│   ├── build-index.js       # 构建索引
│   └── generate-website.js  # 生成网站
└── simple-sync.js           # 飞书同步脚本
```

## 使用方法

### 1. 生成分析报告

使用 Claude Code 运行 skill:

```
分析今天的头条热搜产品机会
```

这将自动完成：
1. 抓取头条热搜
2. 搜索背景信息
3. AI分析生成创意
4. 生成HTML报告
5. 同步到飞书
6. 归档HTML
7. 生成网站

### 1.1 定时自动执行（可选）

支持设置定时任务，每天自动执行分析（如8:00、14:00、20:00）：

**Windows用户:**
```bash
# 右键以管理员身份运行
schedules\setup-windows-task.bat
```

**Linux/Mac用户:**
```bash
chmod +x schedules/linux-crontab.sh
./schedules/linux-crontab.sh
```

**跨平台方案:**
```bash
# 安装依赖
npm install node-cron

# 启动调度服务（保持运行）
node schedules/scheduler-service.js
```

详细配置请查看：[schedules/README.md](schedules/README.md)

### 2. 手动操作

#### 归档HTML报告

```bash
node scripts/archive-report.js toutiaohot-analysis-2026-01-07.html
```

#### 生成网站

```bash
node scripts/generate-website.js
```

#### 部署到Vercel

```bash
git add .
git commit -m "Add new report"
git push
```

Vercel会自动部署，几分钟后可访问: https://toutiaohot-analysis.vercel.app

## 配置

### 飞书配置

编辑 `simple-sync.js`:

```javascript
const config = {
  appToken: 'your-app-token',
  tableId: 'your-table-id',
  appId: 'your-app-id',
  appSecret: 'your-app-secret'
};
```

### Vercel配置

1. 访问 https://vercel.com
2. 使用GitHub登录
3. 导入仓库 `toutiaohot-analysis`
4. 设置 Root Directory: `website/`
5. 点击 Deploy

## 网站功能

- **统计面板**: 显示总报告数、创意数、优秀创意数
- **报告列表**: 按日期倒序展示所有报告
- **关键词搜索**: 搜索热搜标题或创意名称
- **响应式设计**: 支持移动端访问

## 数据流程

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
归档到reports/YYYY/MM/
  ↓
更新索引data/index.json
  ↓
生成网站website/
  ↓
推送到GitHub
  ↓
Vercel自动部署
```

## 技术栈

- **Node.js**: 自动化脚本
- **Claude Code**: AI分析
- **HTML/CSS/JavaScript**: 静态网站
- **Git**: 版本控制
- **Vercel**: 网站部署

## GitHub仓库

https://github.com/ablink123/toutiaohot-analysis

## 许可证

MIT
