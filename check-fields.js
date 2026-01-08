// check-fields.js
// 检查表格中的所有字段

const https = require('https');

const config = {
  appToken: 'Rh08b5mZka6vorsSGfAcOPN9nJg',
  tableId: 'tbl7Mc8608QizRnj',
  appId: 'cli_a9a7ff3e96b85cca',
  appSecret: '5CkC6KfB9KRxnBP8t7NtxbMjVGTnkFoj'
};

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
        else reject(new Error(result.msg));
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getFields(token) {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://open.feishu.cn/open-apis/bitable/v1/apps/${config.appToken}/tables/${config.tableId}/fields`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const result = JSON.parse(body);
        if (result.code === 0) resolve(result.data.items);
        else reject(new Error(result.msg));
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    const token = await getAccessToken();
    const fields = await getFields(token);

    console.log('📋 表格字段列表：\n');
    console.log('字段名称'.padEnd(20), '字段ID'.padEnd(30), '类型');
    console.log('='.repeat(70));

    fields.forEach(f => {
      const typeName = {
        1: '文本',
        2: '数字',
        3: '单选',
        5: '自动编号',
        7: '多选',
        15: '日期',
        18: '公式'
      }[f.type] || f.type;

      console.log(f.field_name.padEnd(20), f.field_id.padEnd(30), typeName);
    });

    console.log('\n💡 提示：请复制实际的字段名称到更新脚本中');

  } catch (error) {
    console.error('错误:', error.message);
  }
}

main();
