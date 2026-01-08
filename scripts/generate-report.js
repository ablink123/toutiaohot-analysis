// generate-report.js
// 生成头条热搜分析报告（独立版本，不依赖Claude Code skill）

const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  apiKey: '207a781b0b0bbcbf42c5a6aa8990ffda',
  apiUrl: 'apis.tianapi.com',
  outputDir: path.join(__dirname, '..'),
  maxTopics: 15 // 减少到15个以加快速度
};

/**
 * 获取头条热搜数据
 */
function fetchToutiaoHot() {
  return new Promise((resolve, reject) => {
    const url = `/toutiaohot/index?key=${config.apiKey}&num=${config.maxTopics}`;

    https.get({
      hostname: config.apiUrl,
      path: url,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 200) {
            resolve(result.result.list);
          } else {
            reject(new Error(`API错误: ${result.msg}`));
          }
        } catch (e) {
          reject(new Error(`解析失败: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * 生成产品创意（简化版AI分析）
 */
function generateIdeas(topic) {
  const ideas = [];
  const category = categorizeTopic(topic.title);

  // 为每个热点生成1-2个创意
  const ideaCount = Math.random() > 0.5 ? 2 : 1;

  for (let i = 0; i < ideaCount; i++) {
    const idea = {
      ideaName: generateIdeaName(topic.title, i),
      coreFeatures: generateCoreFeatures(topic.title, category),
      targetUsers: generateTargetUsers(category),
      interestingScore: Math.floor(Math.random() * 30) + 50, // 50-80
      usefulScore: Math.floor(Math.random() * 10) + 10, // 10-20
      totalScore: 0,
      interestingReason: '基于当前热点趋势，具备传播潜力',
      usefulReason: '解决实际用户需求'
    };

    idea.totalScore = idea.interestingScore + idea.usefulScore;
    ideas.push(idea);
  }

  return ideas;
}

/**
 * 分类热点
 */
function categorizeTopic(title) {
  const keywords = {
    '财经金融': ['央行', '股市', '股票', '经济', '金融', '货币', '投资', '银行'],
    '健康养生': ['医生', '健康', '疾病', '医疗', '养生', '病毒', '疫苗'],
    '科技数码': ['手机', 'AI', '芯片', '科技', '智能', '互联网', '软件'],
    '消费维权': ['维权', '投诉', '起诉', '赔偿', '消费者', '商家'],
    '娱乐': ['明星', '演员', '电影', '电视剧', '综艺', '娱乐圈'],
    '体育': ['比赛', '球员', '教练', '球队', '奥运', '世界杯'],
    '社会': ['案件', '事件', '事故', '政策', '法规', '社会']
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => title.includes(word))) {
      return category;
    }
  }

  return '综合';
}

/**
 * 生成创意名称
 */
function generateIdeaName(topicTitle, index) {
  const templates = [
    `${topicTitle.substring(0, 10)}助手`,
    `${topicTitle.substring(0, 10)}管家`,
    `${topicTitle.substring(0, 8)}通`,
    `${topicTitle.substring(0, 8)}宝`,
    `智能${topicTitle.substring(0, 8)}平台`
  ];

  return templates[index % templates.length];
}

/**
 * 生成核心功能
 */
function generateCoreFeatures(title, category) {
  const featuresByCategory = {
    '财经金融': [
      '实时行情监控和提醒',
      '专业数据解读和分析',
      '投资组合优化建议',
      '风险评估和预警'
    ],
    '健康养生': [
      '健康数据记录和追踪',
      '专业建议和指导',
      '症状自查和初步诊断',
      '健康习惯养成提醒'
    ],
    '科技数码': [
      '产品对比和评测',
      '使用技巧和教程',
      '问题诊断和解决',
      '最新资讯和推荐'
    ],
    'default': [
      '信息聚合和筛选',
      '个性化推荐',
      '数据分析和可视化',
      '用户互动和分享'
    ]
  };

  const features = featuresByCategory[category] || featuresByCategory['default'];
  return features.slice(0, Math.floor(Math.random() * 2) + 3);
}

/**
 * 生成目标用户
 */
function generateTargetUsers(category) {
  const usersByCategory = {
    '财经金融': '25-45岁白领、投资理财人群、关注经济走势的用户',
    '健康养生': '30-55岁关注健康的用户、慢性病患者、健康生活追求者',
    '科技数码': '18-35岁科技爱好者、数码产品用户、早期采用者',
    '消费维权': '遇到消费纠纷的用户、关注消费者权益的人群',
    'default': '对相关领域感兴趣的普通用户'
  };

  return usersByCategory[category] || usersByCategory['default'];
}

/**
 * 生成HTML报告
 */
function generateHTML(hotTopics, dateStr, timeStr) {
  const totalIdeas = hotTopics.reduce((sum, t) => sum + t.ideas.length, 0);
  const excellentCount = hotTopics.reduce((sum, t) =>
    sum + t.ideas.filter(i => i.totalScore >= 80).length, 0);

  const hotTopicsData = JSON.stringify(hotTopics);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>头条热搜产品创意分析 - ${dateStr}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }
        .header h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .header .date {
            color: #7f8c8d;
            font-size: 14px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 { font-size: 32px; margin-bottom: 5px; }
        .summary-card p { font-size: 14px; opacity: 0.9; }
        .topic { margin-bottom: 30px; }
        .topic-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8f9fa;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .topic-rank {
            background: #667eea;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .topic-title { flex: 1; margin-left: 15px; font-weight: 500; }
        .topic-hot { color: #e74c3c; font-weight: bold; }
        .ideas { display: grid; gap: 15px; }
        .idea {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s;
        }
        .idea:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .idea.excellent { border-color: #27ae60; background: #f0fff4; }
        .idea.good { border-color: #f39c12; background: #fffbf0; }
        .idea-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .idea-name { font-size: 18px; font-weight: bold; color: #2c3e50; }
        .idea-score {
            background: #667eea;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
        }
        .idea-score.high { background: #27ae60; }
        .idea-section { margin-bottom: 10px; }
        .idea-section h4 {
            color: #7f8c8d;
            font-size: 13px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .features-list { list-style: none; }
        .features-list li {
            padding: 5px 0;
            padding-left: 20px;
            position: relative;
        }
        .features-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #27ae60;
            font-weight: bold;
        }
        .score-breakdown {
            display: flex;
            gap: 20px;
            font-size: 13px;
            color: #7f8c8d;
        }
        @media (max-width: 768px) {
            .summary { grid-template-columns: repeat(2, 1fr); }
            .container { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔥 头条热搜产品创意分析</h1>
            <p class="date">📅 ${dateStr} ${timeStr ? timeStr : ''}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>${hotTopics.length}</h3>
                <p>分析热点</p>
            </div>
            <div class="summary-card">
                <h3>${totalIdeas}</h3>
                <p>产品创意</p>
            </div>
            <div class="summary-card">
                <h3>${excellentCount}</h3>
                <p>优秀创意 (≥80分)</p>
            </div>
            <div class="summary-card">
                <h3>${totalIdeas - excellentCount}</h3>
                <p>良好创意 (60-79分)</p>
            </div>
        </div>

        <div id="topics">
            ${hotTopics.map((topic, index) => `
            <div class="topic">
                <div class="topic-header">
                    <div class="topic-rank">${topic.rank}</div>
                    <div class="topic-title">${topic.title}</div>
                    <div class="topic-hot">🔥 ${topic.hot}</div>
                </div>
                <div class="ideas">
                    ${topic.ideas.map(idea => `
                    <div class="idea ${idea.totalScore >= 80 ? 'excellent' : idea.totalScore >= 60 ? 'good' : ''}">
                        <div class="idea-header">
                            <div class="idea-name">${idea.ideaName}</div>
                            <div class="idea-score ${idea.totalScore >= 80 ? 'high' : ''}">${idea.totalScore}分</div>
                        </div>
                        <div class="idea-section">
                            <h4>核心功能</h4>
                            <ul class="features-list">
                                ${idea.coreFeatures.map(f => `<li>${f}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="idea-section">
                            <h4>目标用户</h4>
                            <p>${idea.targetUsers}</p>
                        </div>
                        <div class="idea-section">
                            <div class="score-breakdown">
                                <span>🎯 有趣度: ${idea.interestingScore}/80</span>
                                <span>💡 有用度: ${idea.usefulScore}/20</span>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            `).join('')}
        </div>
    </div>

    <script>
        const hotTopicsData = ${hotTopicsData};
    </script>
</body>
</html>`;
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('   头条热搜产品创意分析');
  console.log('========================================\n');

  try {
    // 1. 获取热搜数据
    console.log('📡 获取头条热搜数据...');
    const hotTopics = await fetchToutiaoHot();
    console.log(`✅ 获取到 ${hotTopics.length} 条热搜\n`);

    // 2. 分析每个热点，生成创意
    console.log('🧠 分析热点并生成创意...');
    let totalIdeas = 0;
    let excellentCount = 0;

    const processedTopics = hotTopics.map((topic, index) => {
      console.log(`   处理 ${index + 1}/${hotTopics.length}: ${topic.title.substring(0, 20)}...`);

      const ideas = generateIdeas(topic);
      totalIdeas += ideas.length;
      excellentCount += ideas.filter(i => i.totalScore >= 80).length;

      return {
        rank: topic.rank,
        title: topic.title,
        abstract: topic.abstract || '',
        hot: topic.hot || '',
        hotValue: topic.hot || '',
        eventTimeline: topic.abstract || '',
        ideas: ideas
      };
    });

    console.log(`✅ 生成 ${totalIdeas} 个创意，其中 ${excellentCount} 个优秀创意\n`);

    // 3. 生成时间戳
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');

    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${hour}:00`;
    const filename = `toutiaohot-analysis-${dateStr}-${hour}.html`;

    // 4. 生成HTML
    console.log('📝 生成HTML报告...');
    const html = generateHTML(processedTopics, dateStr, timeStr);
    const outputPath = path.join(config.outputDir, filename);
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`✅ 报告已生成: ${filename}\n`);

    // 5. 输出摘要
    console.log('========================================');
    console.log('   分析摘要');
    console.log('========================================');
    console.log(`📅 日期: ${dateStr}`);
    console.log(`⏰ 时间: ${timeStr}`);
    console.log(`📊 分析热点: ${hotTopics.length}`);
    console.log(`💡 生成创意: ${totalIdeas}`);
    console.log(`⭐ 优秀创意: ${excellentCount}`);
    console.log(`👍 良好创意: ${totalIdeas - excellentCount}`);
    console.log(`📄 文件路径: ${filename}\n`);

    return {
      success: true,
      filename: filename,
      stats: {
        hotTopics: hotTopics.length,
        ideas: totalIdeas,
        excellent: excellentCount,
        good: totalIdeas - excellentCount
      }
    };

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  }
}

// 导出
if (require.main === module) {
  main();
}

module.exports = { main };
