// enrich-report.js
// 后台富化脚本：为已生成的报告添加详细的事件脉络
// 使用混合方案：快速生成基础报告 + 异步AI深度分析

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const config = {
  workDir: path.join(__dirname, '..'),
  enrichmentQueueDir: path.join(__dirname, '..', '.enrichment-queue'),
  claudeCodePath: 'claude'
};

/**
 * 创建富化队列目录
 */
function ensureQueueDir() {
  if (!fs.existsSync(config.enrichmentQueueDir)) {
    fs.mkdirSync(config.enrichmentQueueDir, { recursive: true });
  }
}

/**
 * 将报告加入富化队列
 */
function enqueueForEnrichment(reportPath) {
  ensureQueueDir();

  const reportName = path.basename(reportPath);
  const queueFile = path.join(config.enrichmentQueueDir, `${reportName}.json`);

  // 从HTML中提取话题列表
  const html = fs.readFileSync(reportPath, 'utf-8');
  const match = html.match(/const hotTopicsData = (\[[\s\S]*?\]);/);

  if (!match) {
    console.log(`⚠️  无法从 ${reportName} 提取数据`);
    return false;
  }

  try {
    const topics = eval(`(${match[1]})`);

    // 创建队列项
    const queueItem = {
      reportPath: reportPath,
      reportName: reportName,
      createdAt: new Date().toISOString(),
      status: 'pending',
      topics: topics.map(t => ({
        rank: t.rank,
        title: t.title,
        currentTimeline: t.eventTimeline
      }))
    };

    fs.writeFileSync(queueFile, JSON.stringify(queueItem, null, 2));
    console.log(`✅ 已加入富化队列: ${reportName}`);
    return true;

  } catch (error) {
    console.error(`❌ 解析数据失败: ${error.message}`);
    return false;
  }
}

/**
 * 使用Claude Code执行深度搜索分析
 */
async function performDeepAnalysis(topic) {
  console.log(`\n🔍 正在分析: ${topic.title}`);

  try {
    // 使用Claude Code进行web search和分析
    // 这里调用原始的skill中的web search逻辑
    const searchQuery = `${topic.title} 最新进展 事件脉络`;

    // 构造Claude Code命令
    const claudeCommand = `${config.claudeCodePath} -p "请搜索关于'${topic.title}'的最新信息，整理出事件脉络和时间线。要求：1. 搜索相关新闻报道 2. 整理关键事件节点 3. 按时间顺序排列 4. 简洁明了，每条不超过50字"`;

    console.log(`📡 执行搜索: ${searchQuery}`);

    // 执行Claude Code命令（带超时）
    const output = execSync(claudeCommand, {
      cwd: config.workDir,
      encoding: 'utf-8',
      timeout: 120000, // 2分钟超时
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // 提取事件脉络（简化处理，实际需要更复杂的解析）
    const eventTimeline = output
      .split('\n')
      .filter(line => line.trim().length > 10)
      .slice(0, 5) // 取前5条
      .join('\n• ')
      .trim();

    return eventTimeline || topic.currentTimeline;

  } catch (error) {
    console.log(`⚠️  深度分析失败: ${error.message}`);
    return topic.currentTimeline; // 返回原有内容
  }
}

/**
 * 处理单个富化任务
 */
async function processEnrichmentTask(queueFile) {
  console.log('\n========================================');
  console.log('   处理富化任务');
  console.log('========================================');

  try {
    // 读取队列项
    const queueData = JSON.parse(fs.readFileSync(queueFile, 'utf-8'));

    console.log(`📄 报告: ${queueData.reportName}`);
    console.log(`📊 待分析话题: ${queueData.topics.length}个\n`);

    // 更新状态为处理中
    queueData.status = 'processing';
    queueData.startedAt = new Date().toISOString();
    fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2));

    // 逐个分析话题
    const enrichedTopics = [];

    for (let i = 0; i < queueData.topics.length; i++) {
      const topic = queueData.topics[i];
      console.log(`\n[${i + 1}/${queueData.topics.length}] ${topic.title}`);

      // 执行深度分析
      const enrichedTimeline = await performDeepAnalysis(topic);

      enrichedTopics.push({
        ...topic,
        enrichedTimeline: enrichedTimeline
      });

      // 避免请求过快
      if (i < queueData.topics.length - 1) {
        console.log('⏳ 等待5秒...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // 更新HTML文件
    console.log('\n📝 更新HTML文件...');
    await updateReportWithEnrichedData(queueData.reportPath, enrichedTopics);

    // 更新状态为完成
    queueData.status = 'completed';
    queueData.completedAt = new Date().toISOString();
    fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2));

    console.log('\n✅ 富化任务完成！');

  } catch (error) {
    console.error(`\n❌ 处理失败: ${error.message}`);

    // 更新状态为失败
    try {
      const queueData = JSON.parse(fs.readFileSync(queueFile, 'utf-8'));
      queueData.status = 'failed';
      queueData.error = error.message;
      queueData.failedAt = new Date().toISOString();
      fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2));
    } catch (e) {
      // Ignore
    }
  }
}

/**
 * 更新报告文件中的事件脉络
 */
async function updateReportWithEnrichedData(reportPath, enrichedTopics) {
  let html = fs.readFileSync(reportPath, 'utf-8');

  // 提取原始数据
  const match = html.match(/const hotTopicsData = (\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error('无法找到hotTopicsData');
  }

  const originalTopics = eval(`(${match[1]})`);

  // 更新事件脉络
  const updatedTopics = originalTopics.map(topic => {
    const enriched = enrichedTopics.find(e => e.rank === topic.rank);
    if (enriched && enriched.enrichedTimeline) {
      return {
        ...topic,
        eventTimeline: enriched.enrichedTimeline
      };
    }
    return topic;
  });

  // 替换HTML中的数据
  const newHotTopicsData = JSON.stringify(updatedTopics);
  html = html.replace(
    /const hotTopicsData = \[[\s\S]*?\];/,
    `const hotTopicsData = ${newHotTopicsData};`
  );

  // 更新生成时间
  html = html.replace(
    /<p>📅 报告生成时间：.*?<\/p>/,
    `<p>📅 报告生成时间：${new Date().toLocaleString('zh-CN')} （已AI富化）</p>`
  );

  // 写回文件
  fs.writeFileSync(reportPath, html, 'utf-8');
  console.log('✅ HTML文件已更新');
}

/**
 * 扫描并处理所有待富化的报告
 */
async function processPendingEnrichments() {
  ensureQueueDir();

  const queueFiles = fs.readdirSync(config.enrichmentQueueDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(config.enrichmentQueueDir, f));

  if (queueFiles.length === 0) {
    console.log('📭 富化队列为空');
    return;
  }

  console.log(`📋 发现 ${queueFiles.length} 个待处理任务\n`);

  for (const queueFile of queueFiles) {
    await processEnrichmentTask(queueFile);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // 无参数：处理所有待富化任务
    await processPendingEnrichments();
  } else if (args[0] === 'add' && args[1]) {
    // add <reportPath>: 将报告加入队列
    const reportPath = args[1];
    if (!fs.existsSync(reportPath)) {
      console.error(`❌ 文件不存在: ${reportPath}`);
      process.exit(1);
    }
    enqueueForEnrichment(reportPath);
  } else if (args[0] === 'process' && args[1]) {
    // process <queueFile>: 处理指定队列文件
    await processEnrichmentTask(args[1]);
  } else {
    console.log('用法:');
    console.log('  node scripts/enrich-report.js                    # 处理所有待富化任务');
    console.log('  node scripts/enrich-report.js add <reportPath>   # 将报告加入富化队列');
    console.log('  node scripts/enrich-report.js process <file>     # 处理指定队列文件');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  enqueueForEnrichment,
  processEnrichmentTask,
  processPendingEnrichments
};
