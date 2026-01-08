// check-views.js
// 检查视图的实际配置

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

async function getViews(token) {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://open.feishu.cn/open-apis/bitable/v1/apps/${config.appToken}/tables/${config.tableId}/views`, {
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
        if (result.code === 0) {
          const fieldMap = {};
          result.data.items.forEach(field => {
            fieldMap[field.field_id] = field.field_name;
          });
          resolve(fieldMap);
        } else {
          reject(new Error(result.msg));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    const token = await getAccessToken();
    const views = await getViews(token);
    const fieldMap = await getFields(token);

    console.log('📋 视图配置检查：\n');
    console.log('='.repeat(80));

    views.forEach(view => {
      console.log(`\n视图名称: ${view.view_name}`);
      console.log(`视图ID: ${view.view_id}`);
      console.log(`视图类型: ${view.view_type}`);

      // 检查排序
      if (view.sort && view.sort.length > 0) {
        console.log('\n排序配置:');
        view.sort.forEach(s => {
          const fieldName = fieldMap[s.field_id] || s.field_id;
          console.log(`  - ${fieldName} (${s.desc ? '降序' : '升序'})`);
        });
      } else {
        console.log('\n排序配置: 无');
      }

      // 检查筛选
      if (view.filter && view.filter.conditions && view.filter.conditions.length > 0) {
        console.log('\n筛选配置:');
        console.log(`  连接方式: ${view.filter.conjunction}`);
        view.filter.conditions.forEach(c => {
          const fieldName = fieldMap[c.field_id] || c.field_id;
          console.log(`  - ${fieldName} ${c.operator} ${JSON.stringify(c.value)}`);
        });
      } else {
        console.log('\n筛选配置: 无');
      }

      console.log('-'.repeat(80));
    });

  } catch (error) {
    console.error('错误:', error.message);
  }
}

main();
