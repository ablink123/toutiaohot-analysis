// simple-sync.js
// 从HTML报告提取数据并同步到飞书多维表格

const fs = require('fs');
const https = require('https');

// 配置
const config = {
  appToken: 'Rh08b5mZka6vorsSGfAcOPN9nJg',
  tableId: 'tbl7Mc8608QizRnj',
  appId: 'cli_a9a7ff3e96b85cca',
  appSecret: '5CkC6KfB9KRxnBP8t7NtxbMjVGTnkFoj'
};

// 从HTML提取数据
function extractFromHTML(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const match = html.match(/const hotTopicsData = (\[[\s\S]*?\]);/);
  if (!match) throw new Error('无法从HTML中提取hotTopicsData');

  // HTML中是JavaScript对象字面量，需要转换为标准JSON
  // 使用eval安全地解析（因为我们控制HTML内容）
  const data = eval(`(${match[1]})`);
  return data;
}

// 获取访问令牌
async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      app_id: config.appId,
      app_secret: config.appSecret
    });

    const req = https.request('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const result = JSON.parse(body);
        if (result.code === 0) resolve(result.tenant_access_token);
        else reject(new Error(`获取令牌失败: ${result.msg}`));
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 批量创建记录（每次最多500条）
async function createRecords(token, records) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ records });

    const req = https.request(`https://open.feishu.cn/open-apis/bitable/v1/apps/${config.appToken}/tables/${config.tableId}/records/batch_create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const result = JSON.parse(body);
        if (result.code === 0) resolve(result.data);
        else reject(new Error(`创建记录失败: ${result.msg}`));
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 主函数
async function syncToFeishu(htmlPath) {
  try {
    console.log('📥 从HTML提取数据...');
    const hotTopics = extractFromHTML(htmlPath);
    console.log(`✅ 提取到 ${hotTopics.length} 个热点`);

    const today = new Date().toISOString().split('T')[0];

    // 展开数据：1个热点 + N个创意 = N条记录
    const records = [];
    hotTopics.forEach(topic => {
      topic.ideas.forEach(idea => {
        records.push({
          fields: {
            '详情JSON': JSON.stringify({
              date: today,
              rank: topic.rank,
              title: topic.title,
              hotValue: topic.hotValue,
              eventTimeline: topic.eventTimeline,
              idea: idea
            }, null, 2)
          }
        });
      });
    });

    console.log(`🚀 准备同步 ${records.length} 条记录...`);

    const token = await getAccessToken();
    console.log('✅ 访问令牌获取成功');

    // 分批创建（每批500条）
    const batchSize = 500;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const result = await createRecords(token, batch);
      console.log(`✅ 批次 ${Math.floor(i/batchSize) + 1}/${Math.ceil(records.length/batchSize)}: 同步成功`);
    }

    console.log(`\n🎉 所有记录同步完成！`);
    console.log(`📊 总计: ${records.length} 条记录`);
    console.log(`📍 表格链接: https://ai.feishu.cn/base/${config.appToken}?table=${config.tableId}`);

  } catch (error) {
    console.error('\n❌ 同步失败:', error.message);
    console.error('\n请检查:');
    console.error('1. HTML文件路径是否正确');
    console.error('2. 飞书表格中是否已创建"详情JSON"字段');
    console.error('3. 应用权限是否包含 "bitable:app:write"');
    throw error;
  }
}

// 运行
const htmlPath = process.argv[2] || 'd:\\DD-Stock\\AI产品经理黄叔\\1128TouTiao\\toutiaohot-analysis-2026-01-07.html';
syncToFeishu(htmlPath);
