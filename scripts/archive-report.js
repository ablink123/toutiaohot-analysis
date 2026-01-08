// archive-report.js
// 归档HTML报告到 reports/YYYY/MM/ 目录并更新索引

const fs = require('fs');
const path = require('path');

// 配置
const config = {
  reportsDir: path.join(__dirname, '..', 'reports'),
  dataIndexPath: path.join(__dirname, '..', 'data', 'index.json')
};

/**
 * 从HTML文件中提取 hotTopicsData
 * 复用 simple-sync.js 的逻辑
 */
function extractFromHTML(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const match = html.match(/const hotTopicsData = (\[[\s\S]*?\]);/);

  if (!match) {
    throw new Error(`无法从HTML中提取hotTopicsData: ${htmlPath}`);
  }

  // 使用 eval 解析 JavaScript 对象字面量（不是标准JSON）
  const data = eval(`(${match[1]})`);
  return data;
}

/**
 * 从文件名提取日期和时间
 * 例: toutiaohot-analysis-2026-01-07.html -> 2026-01-07
 * 例: toutiaohot-analysis-2026-01-07-10.html -> 2026-01-07, 10
 * 例: toutiaohot-analysis-2026-01-07-morning.html -> 2026-01-07, morning
 */
function extractDateTimeFromFilename(filename) {
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (!dateMatch) {
    throw new Error(`文件名不包含有效日期: ${filename}`);
  }

  const date = dateMatch[1];

  // 尝试提取时间后缀
  const timeMatch = filename.match(/(\d{4}-\d{2}-\d{2})-(\d+)(?=\.html)/);
  const suffixMatch = filename.match(/(\d{4}-\d{2}-\d{2})-([a-z]+)(?=\.html)/);

  let time = null;
  let timeDisplay = null;

  if (timeMatch) {
    // 数字时间：toutiaohot-analysis-2026-01-07-10.html
    time = timeMatch[2];
    timeDisplay = `${time}:00`;
  } else if (suffixMatch) {
    // 文字时间：toutiaohot-analysis-2026-01-07-morning.html
    const suffixMap = {
      'morning': '08:00',
      'noon': '12:00',
      'afternoon': '14:00',
      'evening': '18:00',
      'night': '21:00'
    };
    time = suffixMatch[2];
    timeDisplay = suffixMap[time] || time;
  }

  return { date, time, timeDisplay };
}

/**
 * 归档HTML报告
 * @param {string} htmlFilePath - HTML文件路径（可以是相对路径或绝对路径）
 */
function archiveReport(htmlFilePath) {
  console.log(`📁 开始归档: ${htmlFilePath}`);

  // 标准化路径
  const absolutePath = path.resolve(htmlFilePath);

  // 检查文件是否存在
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`文件不存在: ${absolutePath}`);
  }

  // 提取文件名、日期和时间
  const filename = path.basename(absolutePath);
  const { date, time, timeDisplay } = extractDateTimeFromFilename(filename);

  console.log(`  📅 日期: ${date}${timeDisplay ? ` ${timeDisplay}` : ''}`);

  // 解析日期
  const [year, month] = date.split('-');

  // 创建目标目录 reports/YYYY/MM/
  const targetDir = path.join(config.reportsDir, year, month);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`  📂 创建目录: ${targetDir}`);
  }

  // 目标文件路径
  const targetPath = path.join(targetDir, filename);

  // 检查目标文件是否已存在
  if (fs.existsSync(targetPath)) {
    console.log(`  ⚠️  目标文件已存在，将覆盖: ${targetPath}`);
  }

  // 移动文件
  fs.renameSync(absolutePath, targetPath);
  console.log(`  ✅ 文件已移动到: ${targetPath}`);

  // 提取数据
  console.log(`  🔍 提取数据...`);
  const hotTopicsData = extractFromHTML(targetPath);

  // 统计数据
  const hotTopicsCount = hotTopicsData.length;
  let ideasCount = 0;
  let excellentCount = 0;
  let goodCount = 0;

  const allIdeas = [];

  hotTopicsData.forEach(topic => {
    topic.ideas.forEach(idea => {
      ideasCount++;
      if (idea.totalScore >= 80) excellentCount++;
      else if (idea.totalScore >= 60) goodCount++;

      allIdeas.push({
        date: date,
        time: time,
        timeDisplay: timeDisplay,
        hotTopicTitle: topic.title,
        hotTopicRank: topic.rank,
        ideaName: idea.name,
        coreFeatures: idea.coreFeatures,
        targetUsers: idea.targetUsers,
        score: idea.totalScore,
        interestingScore: idea.interestingScore,
        usefulScore: idea.usefulScore,
        reportPath: path.relative(path.join(__dirname, '..'), targetPath)
      });
    });
  });

  console.log(`  📊 统计: ${hotTopicsCount}个热点, ${ideasCount}个创意, ${excellentCount}个优秀, ${goodCount}个良好`);

  // 更新索引
  updateIndex({
    date,
    time,
    timeDisplay,
    filename,
    targetPath,
    hotTopicsCount,
    ideasCount,
    excellentCount,
    goodCount,
    allIdeas
  });

  console.log(`✅ 归档完成!\n`);

  return {
    date,
    time,
    timeDisplay,
    targetPath,
    hotTopicsCount,
    ideasCount,
    excellentCount,
    goodCount
  };
}

/**
 * 更新或创建索引文件
 */
function updateIndex(reportData) {
  let index = {
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

  // 读取现有索引（如果存在）
  if (fs.existsSync(config.dataIndexPath)) {
    try {
      const existingData = fs.readFileSync(config.dataIndexPath, 'utf-8');
      index = JSON.parse(existingData);
      console.log(`  📖 读取现有索引，包含 ${index.reports.length} 个报告`);
    } catch (error) {
      console.log(`  ⚠️  索引文件损坏，将创建新索引`);
    }
  }

  // 检查是否已存在该日期+时间的报告
  const existingReportIndex = index.reports.findIndex(r => {
    if (r.date !== reportData.date) return false;
    // 如果都有时间字段，则时间也必须匹配
    if (r.time && reportData.time) return r.time === reportData.time;
    // 如果其中一个没有时间，则只匹配日期
    return true;
  });

  const reportInfo = {
    date: reportData.date,
    time: reportData.time,
    timeDisplay: reportData.timeDisplay,
    file: path.relative(path.join(__dirname, '..'), reportData.targetPath),
    hotTopicsCount: reportData.hotTopicsCount,
    ideasCount: reportData.ideasCount,
    excellentCount: reportData.excellentCount,
    goodCount: reportData.goodCount
  };

  if (existingReportIndex >= 0) {
    // 更新现有报告
    const reportId = reportData.time ? `${reportData.date} ${reportData.timeDisplay || reportData.time}` : reportData.date;
    console.log(`  🔄 更新现有报告索引: ${reportId}`);
    index.reports[existingReportIndex] = reportInfo;

    // 删除该日期+时间的旧创意
    index.allIdeas = index.allIdeas.filter(idea => {
      if (idea.date !== reportData.date) return true;
      if (reportData.time && idea.time) return idea.time !== reportData.time;
      if (!reportData.time && idea.time) return false;
      return true;
    });
  } else {
    // 添加新报告
    const reportId = reportData.time ? `${reportData.date} ${reportData.timeDisplay || reportData.time}` : reportData.date;
    console.log(`  ➕ 添加新报告索引: ${reportId}`);
    index.reports.push(reportInfo);
  }

  // 添加新创意
  index.allIdeas.push(...reportData.allIdeas);

  // 按日期倒序排序报告
  index.reports.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 更新统计数据
  index.statistics.totalReports = index.reports.length;
  index.statistics.totalHotTopics = index.reports.reduce((sum, r) => sum + r.hotTopicsCount, 0);
  index.statistics.totalIdeas = index.allIdeas.length;
  index.statistics.excellentIdeas = index.allIdeas.filter(i => i.score >= 80).length;
  index.statistics.goodIdeas = index.allIdeas.filter(i => i.score >= 60 && i.score < 80).length;
  index.lastUpdated = new Date().toISOString();

  // 保存索引
  const dataDir = path.dirname(config.dataIndexPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(config.dataIndexPath, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`  💾 索引已更新: ${config.dataIndexPath}`);
  console.log(`  📈 总计: ${index.statistics.totalReports}个报告, ${index.statistics.totalIdeas}个创意, ${index.statistics.excellentIdeas}个优秀`);
}

/**
 * 主函数
 */
function main() {
  console.log('========================================');
  console.log('   头条热搜HTML报告归档工具');
  console.log('========================================\n');

  // 获取命令行参数
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法:');
    console.log('  node scripts/archive-report.js <html文件路径>');
    console.log('');
    console.log('示例:');
    console.log('  node scripts/archive-report.js toutiaohot-analysis-2026-01-07.html');
    console.log('  node scripts/archive-report.js reports/2026/01/toutiaohot-analysis-2026-01-07.html');
    process.exit(1);
  }

  const htmlPath = args[0];

  try {
    const result = archiveReport(htmlPath);

    console.log('========================================');
    console.log('   归档成功!');
    console.log('========================================');
    console.log(`📁 文件: ${result.targetPath}`);
    console.log(`📊 统计: ${result.hotTopicsCount}热点, ${result.ideasCount}创意, ${result.excellentCount}优秀`);
    console.log(`💡 下一步: node scripts/generate-website.js`);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  }
}

// 导出函数供其他模块使用
module.exports = {
  archiveReport,
  extractFromHTML,
  extractDateFromFilename
};

// 如果直接运行此脚本
if (require.main === module) {
  main();
}
