---
name: toutiaohot-analysis
description: "自动抓取头条热搜榜单前40条热点，使用Web Search深度搜索每个话题的背景信息，基于AI分析从有趣度(80%)和有用度(20%)两个维度生成产品创意。适用于产品经理、创业者、开发者需要从热点中发现产品机会的场景。输出格式为带日期的HTML分析报告，包含事件脉络、产品创意详情(名称、核心功能、目标用户)和综合评分，优秀创意(>80分)和良好创意(60-80分)将突出呈现。"
---

# 头条热搜产品创意分析

## Overview

这个 skill 自动化完成从头条热点到产品创意的全流程分析，帮助你快速发现潜在的产品机会。

**主要功能：**
1. 自动抓取头条热搜榜单前40条
2. 对每个热点进行深度背景搜索
3. 基于有趣度和有用度双维度评分生成产品创意
4. 生成可视化的HTML分析报告
5. 自动同步到飞书多维表格，实现素材积累与检索
6. 自动归档HTML报告并生成可搜索的网站

## 工作流程

### 步骤 1: 获取头条热搜数据

使用头条热搜API获取当前热门话题前40条：

**API地址：**
```
https://apis.tianapi.com/toutiaohot/index?key=207a781b0b0bbcbf42c5a6aa8990ffda
```

**API响应格式：**
```json
{
  "code": 200,
  "msg": "success",
  "result": {
    "list": [
      {
        "title": "热搜标题",
        "abstract": "新闻摘要",
        "hot": "热度值"
      }
    ]
  }
}
```

使用 Bash 工具调用 API：
```bash
curl -s "https://apis.tianapi.com/toutiaohot/index?key=207a781b0b0bbcbf42c5a6aa8990ffda"
```

将响应保存为JSON文件供后续处理。

### 步骤 2: 深度搜索热点背景信息

对每个热搜话题使用 WebSearch 工具进行深度搜索。

**搜索策略：**
- 使用热搜标题作为主要搜索词
- 补充搜索相关背景和最新进展
- 搜索关键词：`"{标题}" 新闻 背景 最新进展`

**搜索内容要求：**
1. 事件的完整脉络和发展历程
2. 相关的参与者、企业、机构
3. 事件的影响范围和社会反响
4. 潜在的商业机会和痛点

### 步骤 3: AI分析生成产品创意

基于搜索到的详细信息，从两个维度进行分析和产品创意生成：

**评分维度（总分100）：**

1. **有趣度（80分）**
   - 创意新颖性（0-30分）：是否打破常规、有独特角度
   - 话题热度（0-30分）：是否引发广泛讨论和传播
   - 用户体验（0-20分）：是否有趣味性、互动性

2. **有用度（20分）**
   - 实用价值（0-10分）：是否解决实际问题
   - 商业潜力（0-10分）：是否有变现能力

**产品创意输出格式：**

对每个热点，生成1-3个产品创意，每个创意包含：

| 字段 | 说明 |
|------|------|
| **创意名称** | 简洁、易记的产品名称 |
| **核心功能** | 3-5个核心功能点，每个功能点1-2句话描述 |
| **目标用户** | 具体的用户画像，包括年龄段、职业、需求等 |
| **有趣度评分** | 0-80分，并说明理由 |
| **有用度评分** | 0-20分，并说明理由 |
| **综合评分** | 总分（0-100分） |

### 步骤 4: 生成HTML分析报告

生成一个带日期的HTML报告文件，格式：`toutiaohot-analysis-[YYYY-MM-DD].html`

**HTML报告结构：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>头条热搜产品创意分析报告 [YYYY-MM-DD]</title>
    <style>
        /* 现代化样式设计 */
        body { font-family: 'Microsoft YaHei', sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .header { text-align: center; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .summary-card .number { font-size: 32px; font-weight: bold; color: #667eea; }
        .summary-card .label { color: #666; margin-top: 5px; }

        .hot-item { background: white; margin-bottom: 30px; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .hot-header { padding: 20px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
        .hot-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
        .hot-meta { display: flex; gap: 20px; color: #666; font-size: 14px; }
        .hot-content { padding: 20px; }

        .event-timeline { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea; }
        .event-timeline h4 { margin-top: 0; color: #667eea; }

        .ideas-grid { display: grid; gap: 20px; }
        .idea-card { border: 2px solid #e9ecef; border-radius: 10px; padding: 20px; transition: all 0.3s; }

        /* 评分等级样式 */
        .idea-card.excellent { border-color: #28a745; background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); }
        .idea-card.good { border-color: #ffc107; background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%); }
        .idea-card.normal { border-color: #6c757d; }

        .idea-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .idea-name { font-size: 18px; font-weight: bold; }
        .idea-score { font-size: 24px; font-weight: bold; padding: 5px 15px; border-radius: 20px; }
        .idea-score.excellent { background: #28a745; color: white; }
        .idea-score.good { background: #ffc107; color: #333; }
        .idea-score.normal { background: #6c757d; color: white; }

        .score-breakdown { display: flex; gap: 20px; margin-bottom: 15px; font-size: 14px; }
        .score-item { flex: 1; background: white; padding: 10px; border-radius: 5px; }
        .score-label { color: #666; }
        .score-value { font-weight: bold; color: #667eea; }

        .idea-section { margin-bottom: 15px; }
        .idea-section h5 { margin-bottom: 8px; color: #333; }
        .idea-section ul { margin: 0; padding-left: 20px; }

        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-left: 10px; }
        .badge-excellent { background: #28a745; color: white; }
        .badge-good { background: #ffc107; color: #333; }

        .rank-badge { display: inline-block; width: 30px; height: 30px; line-height: 30px; text-align: center; border-radius: 50%; background: #667eea; color: white; font-weight: bold; margin-right: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>头条热搜产品创意分析报告</h1>
        <p id="report-date"></p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <div class="number" id="total-topics">40</div>
            <div class="label">分析热点数</div>
        </div>
        <div class="summary-card">
            <div class="number" id="total-ideas">X</div>
            <div class="label">生成创意数</div>
        </div>
        <div class="summary-card">
            <div class="number" id="excellent-count">X</div>
            <div class="label">优秀创意 (>80分)</div>
        </div>
        <div class="summary-card">
            <div class="number" id="good-count">X</div>
            <div class="label">良好创意 (60-80分)</div>
        </div>
    </div>

    <!-- 热点列表将通过JavaScript动态生成 -->
    <div id="hot-topics-container"></div>

    <script>
        // 热点数据结构
        const hotTopicsData = [
            {
                rank: 1,
                title: "热搜标题",
                abstract: "新闻摘要",
                hotValue: "热度值",
                eventTimeline: "事件脉络...",
                ideas: [
                    {
                        name: "产品名称",
                        coreFeatures: ["功能1", "功能2", "功能3"],
                        targetUsers: "目标用户描述",
                        interestingScore: 65,
                        usefulScore: 15,
                        totalScore: 80,
                        analysis: "评分分析说明"
                    }
                ]
            }
        ];

        // 渲染函数
        function renderHotTopics(data) {
            const container = document.getElementById('hot-topics-container');

            data.forEach(topic => {
                const topicDiv = document.createElement('div');
                topicDiv.className = 'hot-item';

                let ideasHTML = '';
                topic.ideas.forEach(idea => {
                    const scoreClass = idea.totalScore >= 80 ? 'excellent' : (idea.totalScore >= 60 ? 'good' : 'normal');
                    const badgeHTML = idea.totalScore >= 80 ? '<span class="badge badge-excellent">优秀</span>' :
                                     (idea.totalScore >= 60 ? '<span class="badge badge-good">良好</span>' : '');

                    ideasHTML += `
                        <div class="idea-card ${scoreClass}">
                            <div class="idea-header">
                                <div class="idea-name">${idea.name}${badgeHTML}</div>
                                <div class="idea-score ${scoreClass}">${idea.totalScore}分</div>
                            </div>
                            <div class="score-breakdown">
                                <div class="score-item">
                                    <div class="score-label">有趣度</div>
                                    <div class="score-value">${idea.interestingScore}/80</div>
                                </div>
                                <div class="score-item">
                                    <div class="score-label">有用度</div>
                                    <div class="score-value">${idea.usefulScore}/20</div>
                                </div>
                            </div>
                            <div class="idea-section">
                                <h5>核心功能</h5>
                                <ul>
                                    ${idea.coreFeatures.map(f => `<li>${f}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="idea-section">
                                <h5>目标用户</h5>
                                <p>${idea.targetUsers}</p>
                            </div>
                            <div class="idea-section">
                                <h5>创意分析</h5>
                                <p>${idea.analysis}</p>
                            </div>
                        </div>
                    `;
                });

                topicDiv.innerHTML = `
                    <div class="hot-header">
                        <div class="hot-title"><span class="rank-badge">${topic.rank}</span>${topic.title}</div>
                        <div class="hot-meta">
                            <span>热度: ${topic.hotValue}</span>
                        </div>
                    </div>
                    <div class="hot-content">
                        <div class="event-timeline">
                            <h4>事件脉络</h4>
                            <p>${topic.eventTimeline}</p>
                        </div>
                        <h4>产品创意</h4>
                        <div class="ideas-grid">
                            ${ideasHTML}
                        </div>
                    </div>
                `;

                container.appendChild(topicDiv);
            });
        }

        // 设置报告日期
        document.getElementById('report-date').textContent = new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });

        // 渲染数据
        renderHotTopics(hotTopicsData);
    </script>
</body>
</html>
```

**HTML报告要求：**
1. 使用响应式设计，支持移动端查看
2. 优秀创意(≥80分)使用绿色渐变背景突出显示
3. 良好创意(60-79分)使用黄色渐变背景
4. 普通创意(<60分)使用灰色边框
5. 在顶部展示统计数据：总热点数、总创意数、优秀创意数、良好创意数
6. 每个热点包含：排名、标题、热度、事件脉络、产品创意列表

## 执行步骤

**当用户触发此 skill 时，按以下顺序执行：**

1. **调用API获取热搜数据**
   ```bash
   curl -s "https://apis.tianapi.com/toutiaohot/index?key=207a781b0b0bbcbf42c5a6aa8990ffda" > hot_topics.json
   ```

2. **读取并解析JSON数据**
   ```bash
   cat hot_topics.json
   ```

3. **对每个热点执行WebSearch**
   - 并发搜索以提高效率（每批处理5-10个热点）
   - 搜索词格式：`"{标题}" 最新进展 背景`
   - 记录搜索结果中的关键信息

4. **AI分析生成产品创意**
   - 基于搜索结果，分析每个热点的产品机会
   - 按照评分标准进行打分
   - 生成结构化的产品创意

5. **生成HTML报告**
   - 将所有分析结果整合到HTML模板中
   - 文件名格式：`toutiaohot-analysis-[YYYY-MM-DD].html`
   - 保存到当前工作目录

6. **同步到飞书多维表格**
   ```bash
   node simple-sync.js "toutiaohot-analysis-[YYYY-MM-DD].html"
   ```
   - 自动将HTML中的数据提取并同步到飞书
   - 每个热点+创意组合作为一条记录
   - JSON数据存储在"详情JSON"字段中
   - 利用飞书AI字段捷径自动提取其他字段
   - 表格链接：https://ai.feishu.cn/base/Rh08b5mZka6vorsSGfAcOPN9nJg?table=tbl7Mc8608QizRnj

7. **归档HTML报告**
   ```bash
   node scripts/archive-report.js "toutiaohot-analysis-[YYYY-MM-DD].html"
   ```
   - 将HTML移动到 `reports/YYYY/MM/` 目录进行归档
   - 提取数据并更新 `data/index.json` 索引
   - 自动统计创意数量和评分分布
   - 支持增量更新，重复归档会覆盖旧数据

8. **生成网站**
   ```bash
   node scripts/generate-website.js
   ```
   - 将索引文件复制到 `website/data/`
   - 将归档的报告复制到 `website/reports/`
   - 生成 `sitemap.xml` 用于SEO
   - 更新首页统计数据和报告列表

9. **可选：部署到Vercel**
   ```bash
   git add .
   git commit -m "Add new report: [YYYY-MM-DD]"
   git push
   ```
   - 推送到GitHub后，Vercel会自动部署
   - 几分钟后可通过 Vercel 域名访问最新报告
   - 网站地址：https://toutiaohot-analysis.vercel.app

10. **输出摘要信息**
   - 成功处理的热点数量
   - 生成的产品创意总数
   - 优秀创意数量（≥80分）
   - 良好创意数量（60-79分）
   - HTML报告文件路径
   - 归档路径
   - 飞书同步状态（同步记录数）
   - 网站链接

## 使用示例

**触发方式：**
- "分析今天的头条热搜产品机会"
- "生成头条热点产品创意报告"
- "看看今天有什么热点可以做成产品"
- "运行头条热搜分析skill"

**预期输出：**
```
正在获取头条热搜数据...
获取到40条热搜数据

正在深度搜索热点背景信息（1/40）...
正在深度搜索热点背景信息（2/40）...
...

正在AI分析生成产品创意...
已生成产品创意：45个

正在生成HTML报告...
报告已生成：toutiaohot-analysis-2026-01-07.html

正在同步到飞书多维表格...
📥 提取数据...
🚀 准备同步 45 条记录...
✅ 成功同步 45 条记录！

正在归档HTML报告...
📁 开始归档: toutiaohot-analysis-2026-01-07.html
  📅 日期: 2026-01-07
  📂 创建目录: reports/2026/01
  ✅ 文件已移动到: reports/2026/01/toutiaohot-analysis-2026-01-07.html
  🔍 提取数据...
  📊 统计: 15个热点, 30个创意, 7个优秀, 23个良好
  💾 索引已更新: data/index.json

正在生成网站...
📊 复制索引文件...
  ✅ 索引已复制到: website/data/index.json
📁 复制报告文件...
  ✅ 报告已复制到: website/reports
🗺️  生成sitemap.xml...
  ✅ sitemap.xml已生成

=== 分析摘要 ===
分析热点数：40
生成创意数：45
优秀创意（≥80分）：8个
良好创意（60-79分）：15个
普通创意（<60分）：22个

报告路径：reports/2026/01/toutiaohot-analysis-2026-01-07.html
飞书表格：https://ai.feishu.cn/base/Rh08b5mZka6vorsSGfAcOPN9nJg?table=tbl7Mc8608QizRnj
网站链接：https://toutiaohot-analysis.vercel.app

💡 下一步：运行以下命令部署到Vercel
   git add .
   git commit -m "Add new report: 2026-01-07"
   git push
```

## 技术要求

1. **API调用**：确保网络连接正常，API可用
2. **并发控制**：WebSearch时控制并发数量，避免过载
3. **错误处理**：如果某个热点搜索失败，记录并跳过，继续处理其他热点
4. **数据持久化**：生成JSON和HTML文件，便于后续查看和分析
5. **飞书配置**：确保 [simple-sync.js](simple-sync.js) 中的飞书凭证正确配置
   - App ID: cli_a9a7ff3e96b85cca
   - App Secret: 5CkC6KfB9KRxnBP8t7NtxbMjVGTnkFoj
   - App Token: Rh08b5mZka6vorsSGfAcOPN9nJg
   - Table ID: tbl7Mc8608QizRnj
6. **归档系统**：确保以下目录和脚本存在
   - `reports/` - HTML报告归档目录
   - `data/` - 索引数据目录
   - `scripts/archive-report.js` - 归档脚本
   - `scripts/build-index.js` - 索引构建脚本
   - `scripts/generate-website.js` - 网站生成脚本
7. **网站部署**：确保Git仓库已配置并推送到GitHub
   - GitHub仓库: https://github.com/ablink123/toutiaohot-analysis.git
   - Vercel会自动从GitHub拉取并部署 `website/` 目录

## 注意事项

1. API有调用频率限制，如遇到限流请适当延迟
2. 搜索结果质量受时效性影响，建议每天分析
3. 产品创意评分基于AI判断，仅供参考
4. 建议结合实际市场调研和用户验证
5. 飞书同步失败不影响HTML报告生成，可稍后手动执行同步
6. 确保飞书多维表格的AI字段捷径已正确配置
7. 归档操作会移动HTML文件，确保在归档前完成飞书同步
8. 网站生成需要先完成归档，确保索引数据是最新的
9. Vercel部署可能需要几分钟，首次部署需要配置Root Directory为 `website/`

## 质量标准

**优秀产品创意的特征：**
- 创意新颖独特，有差异化优势
- 解决真实痛点，有明确用户需求
- 具备商业变现潜力
- 技术实现可行性高
- 符合当前市场趋势

**避免的问题：**
- 简单复制现有产品
- 创意过于天马行空缺乏落地性
- 目标用户不清晰
- 核心功能不聚焦
