// update-views.js
// 为已存在的视图添加筛选和排序条件

const https = require('https');

// 配置
const config = {
  appToken: 'Rh08b5mZka6vorsSGfAcOPN9nJg',
  tableId: 'tbl7Mc8608QizRnj',
  appId: 'cli_a9a7ff3e96b85cca',
  appSecret: '5CkC6KfB9KRxnBP8t7NtxbMjVGTnkFoj'
};

// 视图更新配置
const viewUpdates = [
  {
    name: '优秀创意',
    sort: [
      { field_name: '总分数', desc: true }
    ],
    filter: {
      conjunction: 'and',
      conditions: [
        { field_name: '总分数', operator: 'isGreater', value: [80] }
      ]
    }
  },
  {
    name: '良好创意',
    sort: [
      { field_name: '总分数', desc: true }
    ],
    filter: {
      conjunction: 'and',
      conditions: [
        { field_name: '总分数', operator: 'isGreaterEqual', value: [60] },
        { field_name: '总分数', operator: 'isLess', value: [80] }
      ]
    }
  },
  {
    name: '科技类',
    sort: [
      { field_name: '总分数', desc: true }
    ],
    filter: {
      conjunction: 'and',
      conditions: [
        { field_name: '分类', operator: 'is', value: ['科技'] }
      ]
    }
  },
  {
    name: 'AI相关',
    sort: [
      { field_name: '总分数', desc: true }
    ],
    filter: {
      conjunction: 'and',
      conditions: [
        { field_name: '标签', operator: 'is', value: ['AI'] }
      ]
    }
  }
];

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

// 获取所有视图
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
        else reject(new Error(`获取视图失败: ${result.msg}`));
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// 获取字段ID映射
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
            fieldMap[field.field_name] = field.field_id;
          });
          resolve(fieldMap);
        } else {
          reject(new Error(`获取字段失败: ${result.msg}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// 更新视图
async function updateView(token, viewId, updateConfig, fieldMap) {
  return new Promise((resolve, reject) => {
    const updateData = {};

    // 添加排序
    if (updateConfig.sort) {
      updateData.sort = updateConfig.sort.map(s => ({
        field_id: fieldMap[s.field_name],
        desc: s.desc
      }));
    }

    // 添加筛选
    if (updateConfig.filter) {
      updateData.filter = {
        conjunction: updateConfig.filter.conjunction,
        conditions: updateConfig.filter.conditions.map(c => ({
          field_id: fieldMap[c.field_name],
          operator: c.operator,
          value: c.value
        }))
      };
    }

    const data = JSON.stringify(updateData);

    console.log(`    更新配置: ${JSON.stringify(updateData).substring(0, 300)}...`);

    const req = https.request(`https://open.feishu.cn/open-apis/bitable/v1/apps/${config.appToken}/tables/${config.tableId}/views/${viewId}`, {
      method: 'PATCH',
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
        else reject(new Error(`更新视图失败: ${result.msg}`));
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 主函数
async function main() {
  try {
    console.log('🔐 获取访问令牌...');
    const token = await getAccessToken();
    console.log('✅ 令牌获取成功');

    console.log('\n📋 获取字段列表...');
    const fieldMap = await getFields(token);
    console.log(`✅ 找到 ${Object.keys(fieldMap).length} 个字段`);

    console.log('\n📊 获取现有视图...');
    const views = await getViews(token);
    console.log(`✅ 找到 ${views.length} 个视图`);

    // 创建视图名到ID的映射
    const viewMap = {};
    views.forEach(v => {
      viewMap[v.view_name] = v.view_id;
    });

    console.log(`\n🔧 开始更新视图配置...\n`);

    for (const updateConfig of viewUpdates) {
      const viewId = viewMap[updateConfig.name];
      if (!viewId) {
        console.log(`  ⚠️  跳过: ${updateConfig.name} (视图不存在)`);
        continue;
      }

      try {
        await updateView(token, viewId, updateConfig, fieldMap);
        console.log(`  ✅ 更新成功: ${updateConfig.name}`);
      } catch (error) {
        console.log(`  ❌ 更新失败: ${updateConfig.name} - ${error.message}`);
      }
    }

    console.log('\n🎉 视图更新完成！');
    console.log(`\n📍 表格访问链接: https://ai.feishu.cn/base/${config.appToken}?table=${config.tableId}`);
    console.log('\n💡 提示：请刷新页面查看视图筛选和排序效果');

  } catch (error) {
    console.error('\n❌ 执行失败:', error.message);
  }
}

// 运行
main();
