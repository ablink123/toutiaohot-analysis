// schedule-task.js
// 定时触发头条热搜分析任务

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  // Claude Code CLI 路径
  claudeCodePath: 'claude',
  // 工作目录
  workDir: __dirname,
  // 生成的文件名格式（支持时间后缀）
  // 可用变量：{date} (YYYY-MM-DD), {time} (HH), {hour} (H)
  filenameTemplate: 'toutiaohot-analysis-{date}-{time}.html',
  // 是否自动归档
  autoArchive: true,
  // 是否自动生成网站
  autoGenerateWebsite: true,
  // 是否自动同步飞书
  autoSyncFeishu: true,
  // 是否自动推送到Git
  autoGitPush: false, // 默认不自动推送，避免频繁提交
  // Git提交消息模板
  gitCommitTemplate: 'Add report: {date} {time}'
};

/**
 * 获取当前时间戳
 */
function getTimestamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: hour,
    hour: now.getHours(),
    datetime: now.toISOString()
  };
}

/**
 * 替换文件名模板变量
 */
function generateFilename(template, timestamp) {
  return template
    .replace('{date}', timestamp.date)
    .replace('{time}', timestamp.time)
    .replace('{hour}', timestamp.hour);
}

/**
 * 执行命令
 */
function executeCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, {
      cwd: config.workDir,
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    console.log(`✅ ${description}完成`);
    return true;
  } catch (error) {
    console.error(`❌ ${description}失败:`, error.message);
    return false;
  }
}

/**
 * 主任务流程
 */
async function runTask() {
  const startTime = Date.now();
  console.log('========================================');
  console.log('   头条热搜分析任务');
  console.log('========================================');
  console.log(`⏰ 开始时间: ${new Date().toLocaleString('zh-CN')}\n`);

  try {
    // 1. 生成文件名
    const timestamp = getTimestamp();
    const filename = generateFilename(config.filenameTemplate, timestamp);
    console.log(`📝 文件名: ${filename}`);

    // 2. 调用 Claude Code skill
    const prompt = '分析今天的头条热搜产品机会';
    const success = executeCommand(
      `"${config.claudeCodePath}" "${prompt}"`,
      '执行 Claude Code skill'
    );

    if (!success) {
      throw new Error('Claude Code skill 执行失败');
    }

    // 检查生成的文件（在根目录，不在reports子目录中）
    const allFiles = fs.readdirSync(config.workDir);
    const generatedFiles = allFiles
      .filter(f => f.startsWith('toutiaohot-analysis-') && f.endsWith('.html'))
      .filter(f => !fs.statSync(path.join(config.workDir, f)).isDirectory())
      .sort()
      .reverse();

    if (generatedFiles.length === 0) {
      console.log('\n⚠️  未在根目录找到新生成的HTML文件');
      console.log('💡 提示: 可能是skill已经运行过并归档了文件');
      console.log(`📅 预期文件名: ${filename}`);
      console.log('');

      // 检查是否已存在归档的文件
      const archiveDir = path.join(config.workDir, 'reports', timestamp.date.split('-')[0], timestamp.date.split('-')[1]);
      if (fs.existsSync(archiveDir)) {
        const archivedFiles = fs.readdirSync(archiveDir)
          .filter(f => f.includes(timestamp.date))
          .filter(f => timestamp.time ? f.includes(`-${timestamp.time}`) : true);

        if (archivedFiles.length > 0) {
          console.log(`✅ 发现已归档的文件: ${archivedFiles[0]}`);
          console.log('💡 跳过后续步骤（文件已存在）\n');
          return;
        }
      }

      throw new Error('未找到生成的HTML文件');
    }

    // 找到最新生成的文件
    const latestFile = generatedFiles[0];
    console.log(`\n📄 生成文件: ${latestFile}`);

    // 3. 同步到飞书
    if (config.autoSyncFeishu) {
      executeCommand(
        `node simple-sync.js "${latestFile}"`,
        '同步到飞书'
      );
    }

    // 4. 归档HTML报告
    if (config.autoArchive) {
      executeCommand(
        `node scripts/archive-report.js "${latestFile}"`,
        '归档HTML报告'
      );
    }

    // 5. 生成网站
    if (config.autoGenerateWebsite) {
      executeCommand(
        'node scripts/generate-website.js',
        '生成网站'
      );
    }

    // 6. Git 提交和推送
    if (config.autoGitPush) {
      const commitMsg = config.gitCommitTemplate
        .replace('{date}', timestamp.date)
        .replace('{time}', timestamp.time);

      executeCommand('git add .', 'Git add');
      executeCommand(`git commit -m "${commitMsg}"`, 'Git commit');
      executeCommand('git push', 'Git push');
    }

    // 计算耗时
    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('\n========================================');
    console.log('   任务完成!');
    console.log('========================================');
    console.log(`⏱️  总耗时: ${duration}秒`);
    console.log(`📄 生成文件: ${latestFile}`);
    console.log(`💡 下一步: 查看报告或部署网站\n`);

  } catch (error) {
    console.error('\n========================================');
    console.error('   任务失败!');
    console.error('========================================');
    console.error(`❌ 错误: ${error.message}`);
    console.error(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}\n`);
    process.exit(1);
  }
}

/**
 * 直接运行
 */
if (require.main === module) {
  runTask();
}

module.exports = { runTask, getTimestamp, generateFilename };
