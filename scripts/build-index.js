// build-index.js
// 扫描 reports/ 目录下所有HTML，重建索引

const fs = require('fs');
const path = require('path');

// 配置
const config = {
  reportsDir: path.join(__dirname, '..', 'reports'),
  dataIndexPath: path.join(__dirname, '..', 'data', 'index.json')
};

/**
 * 从HTML文件中提取 hotTopicsData
 */
function extractFromHTML(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const match = html.match(/const hotTopicsData = (\[[\s\S]*?\]);/);

  if (!match) {
    console.warn(`  ⚠️  无法提取数据: ${htmlPath}`);
    return null;
  }

  try {
    const data = eval(`(${match[1]})`);
    return data;
  } catch (error) {
    console.warn(`  ⚠️  解析失败: ${htmlPath} - ${error.message}`);
    return null;
  }
}

/**
 * 从文件名提取日期
 */
function extractDateFromFilename(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

/**
 * 递归扫描目录，查找所有HTML文件
 */
function findHTMLFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findHTMLFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 重建索引
 */
function rebuildIndex() {
  console.log('========================================');
  console.log('   重建索引');
  console.log('========================================\n');

  console.log(`📂 扫描目录: ${config.reportsDir}`);

  // 查找所有HTML文件
  const htmlFiles = findHTMLFiles(config.reportsDir);

  if (htmlFiles.length === 0) {
    console.log('⚠️  未找到任何HTML文件');
    return;
  }

  console.log(`📄 找到 ${htmlFiles.length} 个HTML文件\n`);

  // 初始化索引
  const index = {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    statistics: {
      totalReports: 0,
      totalHotTopics: 0,
      totalIdeas: 0,
      excellentIdeas: 0,
      goodIdeas: 0
    },
    reports: [],
    allIdeas: []
  };

  // 处理每个HTML文件
  for (const htmlFile of htmlFiles) {
    const filename = path.basename(htmlFile);
    const date = extractDateFromFilename(filename);

    if (!date) {
      console.log(`⚠️  跳过（无法提取日期）: ${filename}`);
      continue;
    }

    console.log(`📖 处理: ${filename} (${date})`);

    // 提取数据
    const hotTopicsData = extractFromHTML(htmlFile);

    if (!hotTopicsData) {
      console.log(`  ⚠️  无法提取数据，跳过`);
      continue;
    }

    // 统计数据
    const hotTopicsCount = hotTopicsData.length;
    let ideasCount = 0;
    let excellentCount = 0;
    let goodCount = 0;

    hotTopicsData.forEach(topic => {
      topic.ideas.forEach(idea => {
        ideasCount++;
        if (idea.totalScore >= 80) excellentCount++;
        else if (idea.totalScore >= 60) goodCount++;

        index.allIdeas.push({
          date: date,
          hotTopicTitle: topic.title,
          hotTopicRank: topic.rank,
          ideaName: idea.name,
          coreFeatures: idea.coreFeatures,
          targetUsers: idea.targetUsers,
          score: idea.totalScore,
          interestingScore: idea.interestingScore,
          usefulScore: idea.usefulScore,
          reportPath: path.relative(path.join(__dirname, '..'), htmlFile)
        });
      });
    });

    // 添加报告信息
    index.reports.push({
      date: date,
      file: path.relative(path.join(__dirname, '..'), htmlFile),
      hotTopicsCount: hotTopicsCount,
      ideasCount: ideasCount,
      excellentCount: excellentCount,
      goodCount: goodCount
    });

    console.log(`  ✅ ${hotTopicsCount}热点, ${ideasCount}创意, ${excellentCount}优秀\n`);
  }

  // 按日期倒序排序报告
  index.reports.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 更新统计数据
  index.statistics.totalReports = index.reports.length;
  index.statistics.totalHotTopics = index.reports.reduce((sum, r) => sum + r.hotTopicsCount, 0);
  index.statistics.totalIdeas = index.allIdeas.length;
  index.statistics.excellentIdeas = index.allIdeas.filter(i => i.score >= 80).length;
  index.statistics.goodIdeas = index.allIdeas.filter(i => i.score >= 60 && i.score < 80).length;

  // 保存索引
  const dataDir = path.dirname(config.dataIndexPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(config.dataIndexPath, JSON.stringify(index, null, 2), 'utf-8');

  console.log('========================================');
  console.log('   索引重建完成!');
  console.log('========================================');
  console.log(`📊 统计:`);
  console.log(`   - 报告数: ${index.statistics.totalReports}`);
  console.log(`   - 热点数: ${index.statistics.totalHotTopics}`);
  console.log(`   - 创意数: ${index.statistics.totalIdeas}`);
  console.log(`   - 优秀: ${index.statistics.excellentIdeas}`);
  console.log(`   - 良好: ${index.statistics.goodIdeas}`);
  console.log(`\n💾 索引文件: ${config.dataIndexPath}`);
}

/**
 * 主函数
 */
function main() {
  try {
    rebuildIndex();
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 导出函数供其他模块使用
module.exports = {
  rebuildIndex,
  extractFromHTML,
  findHTMLFiles
};

// 如果直接运行此脚本
if (require.main === module) {
  main();
}
