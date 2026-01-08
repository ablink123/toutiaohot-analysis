// enrich-report-demo.js
// 演示版富化脚本 - 只富化前3个话题，用于快速测试效果

const fs = require('fs');
const path = require('path');

// 配置
const config = {
  workDir: path.join(__dirname, '..'),
  enrichmentQueueDir: path.join(__dirname, '..', '.enrichment-queue'),
  demoMode: true,  // 演示模式
  maxTopics: 3     // 只处理前3个
};

/**
 * 模拟AI深度分析（演示版）
 * 在实际使用中，这里会调用Claude Code CLI进行真实的web search
 */
async function performDeepAnalysis(topic) {
  console.log(`\n🔍 正在分析: ${topic.title}`);

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 演示用的事件脉络（模拟AI生成的内容）
  const demoTimelines = {
    "美国退出66个国际组织": `• 2026年1月初：美国政府宣布退出包括WHO在内的66个国际组织
• 国际社会强烈谴责，称此举破坏全球治理体系
• 欧盟和中国表示将继续支持多边主义合作
• 专家预测将对全球气候治理和公共卫生产生深远影响`,

    "女子选车牌摇到豹子号苏A0000A": `• 2026年1月6日：南京一位女士在车管所选车牌时随机摇到"苏A0000A"
• 该号码被称为"豹子号"，市场估值超过100万元
• 事件在社交媒体引发热议，登上微博热搜
• 车管所回应称确属随机摇号，不存在内定
• 多位收藏家联系车主表示愿意高价收购`,

    "科技创新活力涌动": `• 2026年1月：全国科技创新大会在北京召开
• 会议发布《科技创新行动计划2026-2030》
• 宣布将在人工智能、量子计算、生物技术等领域加大投入
• 多项重大科技专项启动，总投资超5000亿元
• 科技部表示将优化科研环境，吸引全球人才`
  };

  // 返回演示内容或生成通用内容
  return demoTimelines[topic.title] || `• ${topic.title}引发广泛关注
• 相关部门表示将密切关注后续发展
• 专家呼吁理性看待，不信谣不传谣
• 持续更新中...`;
}

/**
 * 处理单个富化任务（演示版）
 */
async function processEnrichmentTask(queueFile) {
  console.log('\n========================================');
  console.log('   演示版富化任务');
  console.log('========================================');

  try {
    // 读取队列项
    const queueData = JSON.parse(fs.readFileSync(queueFile, 'utf-8'));

    console.log(`📄 报告: ${queueData.reportName}`);
    console.log(`📊 待分析话题: ${queueData.topics.length}个`);
    console.log(`🎭 演示模式: 只处理前 ${config.maxTopics} 个话题\n`);

    // 更新状态为处理中
    queueData.status = 'processing';
    queueData.startedAt = new Date().toISOString();
    fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2));

    // 只处理前N个话题
    const topicsToProcess = queueData.topics.slice(0, config.maxTopics);
    const enrichedTopics = [];

    for (let i = 0; i < topicsToProcess.length; i++) {
      const topic = topicsToProcess[i];
      console.log(`\n[${i + 1}/${topicsToProcess.length}] ${topic.title}`);

      // 执行深度分析
      const enrichedTimeline = await performDeepAnalysis(topic);

      enrichedTopics.push({
        ...topic,
        enrichedTimeline: enrichedTimeline
      });

      console.log(`✅ 分析完成`);
    }

    // 更新HTML文件
    console.log('\n📝 更新HTML文件...');
    await updateReportWithEnrichedData(queueData.reportPath, enrichedTopics, queueData.topics.length);

    // 更新状态为完成
    queueData.status = 'completed';
    queueData.completedAt = new Date().toISOString();
    queueData.note = `演示模式：仅富化了前 ${config.maxTopics} 个话题`;
    fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2));

    console.log('\n========================================');
    console.log('   ✅ 富化任务完成！');
    console.log('========================================');
    console.log(`📊 富化话题数: ${enrichedTopics.length}/${queueData.topics.length}`);
    console.log(`📄 报告已更新`);
    console.log(`💡 完整富化请使用: node scripts/enrich-report.js\n`);

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
 * 更新报告文件中的事件脉络（演示版）
 */
async function updateReportWithEnrichedData(reportPath, enrichedTopics, totalTopics) {
  let html = fs.readFileSync(reportPath, 'utf-8');

  // 提取原始数据
  const match = html.match(/const hotTopicsData = (\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error('无法找到hotTopicsData');
  }

  const originalTopics = eval(`(${match[1]})`);

  // 创建富化话题的映射
  const enrichedMap = new Map();
  enrichedTopics.forEach(topic => {
    enrichedMap.set(topic.rank, topic.enrichedTimeline);
  });

  // 更新事件脉络
  const updatedTopics = originalTopics.map(topic => {
    if (enrichedMap.has(topic.rank)) {
      return {
        ...topic,
        eventTimeline: enrichedMap.get(topic.rank)
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

  // 更新生成时间标记
  const enrichmentNote = `<p>📅 报告生成时间：${new Date().toLocaleString('zh-CN')} （🤖 已AI富化 ${enrichedTopics.length}/${totalTopics} 个话题）</p>`;
  html = html.replace(
    /<p>📅 报告生成时间：.*?<\/p>/,
    enrichmentNote
  );

  // 写回文件
  fs.writeFileSync(reportPath, html, 'utf-8');
  console.log('✅ HTML文件已更新');
  console.log(`💡 前 ${enrichedTopics.length} 个话题已添加详细事件脉络`);
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // 无参数：处理所有待富化任务
    const queueFiles = fs.readdirSync(config.enrichmentQueueDir)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(config.enrichmentQueueDir, f));

    if (queueFiles.length === 0) {
      console.log('📭 富化队列为空');
      console.log('💡 请先运行: node scripts/generate-report.js\n');
      return;
    }

    console.log(`📋 发现 ${queueFiles.length} 个待处理任务\n`);
    await processEnrichmentTask(queueFiles[0]);  // 只处理第一个
  } else if (args[0] === 'process' && args[1]) {
    // 处理指定队列文件
    await processEnrichmentTask(args[1]);
  } else {
    console.log('演示版富化脚本 - 快速查看效果');
    console.log('');
    console.log('用法:');
    console.log('  node scripts/enrich-report-demo.js              # 处理队列中的第一个任务');
    console.log('  node scripts/enrich-report-demo.js process <file> # 处理指定队列文件');
    console.log('');
    console.log('说明:');
    console.log('  - 演示模式只处理前3个话题');
    console.log('  - 使用模拟数据，不调用真实AI');
    console.log('  - 完整富化请使用: node scripts/enrich-report.js');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  processEnrichmentTask
};
