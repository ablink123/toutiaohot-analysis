// create-views.js
// 自动创建飞书多维表格视图脚本

const https = require('https');

// 配置
const config = {
  appToken: 'Rh08b5mZka6vorsSGfAcOPN9nJg',
  tableId: 'tbl7Mc8608QizRnj',
  appId: 'cli_a9a7ff3e96b85cca',
  appSecret: '5CkC6KfB9KRxnBP8t7NtxbMjVGTnkFoj'
};

// 视图定义
const views = [
  {
    name: '全部素材',
    type: 'grid',
    sort: [
      { field_name: '日期', desc: true },
      { field_name: '总分', desc: true }
    ],
    filter: null
  },
  {
    name: '优秀创意',
    type: 'grid',
    sort: [
      { field_name: '总分', desc: true }
    ],
    filter: {
      conditions: [
        {
          field_name: '总分',
          operator: 'isGreater',
          value: ['80']
        }
      ],
      conjunction: 'and'
    }
  },
  {
    name: '良好创意',
    type: 'grid',
    sort: [
      { field_name: '总分', desc: true }
    ],
    filter: {
      conditions: [
        {
          field_name: '总分',
          operator: 'isGreaterEqual',
          value: ['60']
        },
        {
          field_name: '总分',
          operator: 'isLess',
          value: ['80']
        }
      ],
      conjunction: 'and'
    }
  },
  {
    name: '科技类',
    type: 'grid',
    sort: [
      { field_name: '总分', desc: true }
    ],
    filter: {
      conditions: [
        {
          field_name: '分类',
          operator: 'is',
          value: ['科技']
        }
      ],
      conjunction: 'and'
    }
  },
  {
    name: 'AI相关',
    type: 'grid',
    sort: [
      { field_name: '总分', desc: true }
    ],
    filter: {
      conditions: [
        {
          field_name: '标签',
          operator: 'is',
          value: ['AI']
        }
      ],
      conjunction: 'and'
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
          // 创建字段名到字段ID的映射
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

// 创建视图
async function createView(token, view, fieldMap) {
  return new Promise((resolve, reject) => {
    // 构建视图配置
    const viewConfig = {
      view_name: view.name,
      view_type: view.type
    };

    // 添加排序
    if (view.sort && fieldMap) {
      viewConfig.sort = view.sort.map(s => ({
        field_id: fieldMap[s.field_name],
        desc: s.desc
      }));
    }

    // 添加筛选
    if (view.filter && fieldMap) {
      viewConfig.filter = {
        conjunction: view.filter.conjunction,
        conditions: view.filter.conditions.map(c => ({
          field_id: fieldMap[c.field_name],
          operator: c.operator,
          value: c.value
        }))
      };
    }

    const data = JSON.stringify(viewConfig);

    console.log(`    配置: ${JSON.stringify(viewConfig).substring(0, 200)}...`);

    const req = https.request(`https://open.feishu.cn/open-apis/bitable/v1/apps/${config.appToken}/tables/${config.tableId}/views`, {
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
        else reject(new Error(`创建视图失败 [${view.name}]: ${result.msg}`));
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

    console.log(`\n📊 开始创建 ${views.length} 个视图...\n`);

    for (let i = 0; i < views.length; i++) {
      try {
        await createView(token, views[i], fieldMap);
        console.log(`  ✅ ${i + 1}/${views.length}: ${views[i].name}`);
      } catch (error) {
        console.log(`  ❌ ${i + 1}/${views.length}: ${views[i].name} - ${error.message}`);
      }
    }

    console.log('\n🎉 所有视图创建完成！');
    console.log(`\n📍 表格访问链接: https://ai.feishu.cn/base/${config.appToken}?table=${config.tableId}`);
    console.log('\n📝 视图说明：');
    views.forEach(v => {
      console.log(`  • ${v.name}${v.filter ? ' (带筛选)' : ''}`);
    });

  } catch (error) {
    console.error('\n❌ 执行失败:', error.message);
    console.error('\n请检查:');
    console.error('1. App ID 和 App Secret 是否正确');
    console.error('2. 应用权限是否包含 "bitable:app:write"');
    console.error('3. 表格ID是否正确');
    console.error('4. 字段名是否匹配');
  }
}

// 运行
main();
