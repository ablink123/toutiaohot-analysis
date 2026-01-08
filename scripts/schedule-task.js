// schedule-task.js
// 定时触发头条热搜分析任务

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  // Claude Code CLI 路径
  claudeCodePath: 'claude',
  // 工作目录（项目根目录）
  workDir: path.join(__dirname, '..'),
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
  autoGitPush: true, // 自动推送到GitHub，触发Vercel部署
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

    // 2. 生成分析报告
    console.log('🤖 使用自动化脚本生成报告...');
    const generateReport = require('./generate-report');
    const result = await generateReport.main();

    if (!result.success) {
      if (result.shouldAbort) {
        // 数据质量问题，不需要生成HTML和后续操作
        console.log('\n========================================');
        console.log('   任务终止');
        console.log('========================================');
        console.log(`⚠️  原因: ${result.error}`);
        console.log('💡 已跳过HTML生成、飞书同步等后续操作\n');
        return;
      }
      throw new Error('报告生成失败');
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

    // 4. 可选：启动后台富化（AI深度分析）
    console.log('\n🤖 是否启动后台AI富化？');
    console.log('   富化将为每个热搜添加详细的事件脉络（需要较长时间）');
    console.log('   如果跳过，可以稍后手动运行: node scripts/enrich-report.js');

    // 检查是否启用自动富化（可通过环境变量控制）
    const autoEnrich = process.env.AUTO_ENRICH === 'true';

    if (autoEnrich) {
      console.log('⏳ 启动后台AI富化...');
      executeCommand(
        'node scripts/enrich-report.js',
        '执行AI富化'
      );
    } else {
      console.log('⏭️  跳过AI富化（可稍后手动执行）');
    }

    // 5. 归档HTML报告
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

    // 7. Git 提交和推送
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
