// scheduler-service.js
// 使用 node-cron 持续运行的调度服务（跨平台）
// 使用方法：node schedules/scheduler-service.js

const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 配置
const config = {
  projectDir: path.resolve(__dirname, '..'),
  scheduleScript: path.join(__dirname, '..', 'scripts', 'schedule-task.js'),
  logDir: path.join(__dirname, '..', 'logs'),
  times: ['08:00', '14:00', '20:00']
};

// 确保日志目录存在
if (!fs.existsSync(config.logDir)) {
  fs.mkdirSync(config.logDir, { recursive: true });
}

/**
 * 执行任务
 */
function executeTask(scheduledTime) {
  const timestamp = new Date().toISOString();
  const logFile = path.join(config.logDir, `schedule-${scheduledTime.replace(':', '')}-${timestamp.split('T')[0]}.log`);

  console.log('\n========================================');
  console.log(`📅 定时任务触发: ${scheduledTime}`);
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('========================================\n');

  const process = exec(`node "${config.scheduleScript}"`, {
    cwd: config.projectDir,
    env: { ...process.env }
  });

  // 输出到控制台和日志文件
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  process.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    logStream.write(output);
  });

  process.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(output);
    logStream.write(`[ERROR] ${output}`);
  });

  process.on('close', (code) => {
    logStream.end();
    console.log(`\n✅ 任务完成，退出码: ${code}`);
    console.log(`📝 日志已保存: ${logFile}\n`);
  });
}

/**
 * 创建Cron任务
 */
function createScheduledTasks() {
  const tasks = [];

  console.log('========================================');
  console.log('   头条热搜分析调度服务');
  console.log('========================================');
  console.log(`📁 项目目录: ${config.projectDir}`);
  console.log(`📂 日志目录: ${config.logDir}`);
  console.log('');

  config.times.forEach(time => {
    const [hour, minute] = time.split(':');

    // Cron表达式: 分 时 日 月 周
    const cronExpression = `${minute} ${hour} * * *`;

    console.log(`⏰ 创建任务: ${time}`);
    console.log(`   Cron表达式: ${cronExpression}`);

    const task = cron.schedule(cronExpression, () => {
      executeTask(time);
    }, {
      scheduled: true,
      timezone: 'Asia/Shanghai'
    });

    tasks.push({ time, task });
  });

  console.log('');
  console.log('========================================');
  console.log('   所有任务已启动');
  console.log('========================================');
  console.log('⏰ 调度时间:');
  config.times.forEach(time => {
    console.log(`   - ${time}`);
  });
  console.log('');
  console.log('💡 提示:');
  console.log('   - 保持此窗口运行以执行定时任务');
  console.log('   - 按 Ctrl+C 停止服务');
  console.log('   - 日志保存在 logs/ 目录');
  console.log('========================================\n');

  return tasks;
}

/**
 * 主函数
 */
function main() {
  // 检查是否安装了 node-cron
  try {
    require.resolve('node-cron');
  } catch (e) {
    console.error('❌ 错误: 未安装 node-cron 模块');
    console.error('\n请运行以下命令安装:');
    console.error('  npm install node-cron');
    console.error('  或');
    console.error('  npm install -g node-cron\n');
    process.exit(1);
  }

  // 启动所有定时任务
  createScheduledTasks();

  // 优雅退出处理
  process.on('SIGINT', () => {
    console.log('\n\n========================================');
    console.log('   正在停止调度服务...');
    console.log('========================================\n');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n========================================');
    console.log('   正在停止调度服务...');
    console.log('========================================\n');
    process.exit(0);
  });
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { executeTask, createScheduledTasks };
