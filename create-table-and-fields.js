// create-table-and-fields.js
// 自动创建数据表和字段的脚本

const https = require('https');

// 配置信息
const config = {
  appToken: 'Rh08b5mZka6vorsSGfAcOPN9nJg',
  appId: 'cli_a9a7ff3e96b85cca',
  appSecret: '5CkC6KfB9KRxnBP8t7NtxbMjVGTnkFoj'
};

// 字段定义
const fields = [
  {
    field_name: '记录ID',
    type: 5, // 自动编号
    description: '自动生成的记录编号'
  },
  {
    field_name: '日期',
    type: 15, // 日期
    description: '分析日期'
  },
  {
    field_name: '排名',
    type: 1, // 文本
    description: '热搜排名'
  },
  {
    field_name: '标题',
    type: 1, // 文本
    description: '热搜标题'
  },
  {
    field_name: '分类',
    type: 3, // 单选
    description: '事件分类',
    options: [
      { name: '科技' },
      { name: '社会' },
      { name: '财经' },
      { name: '教育' },
      { name: '军事' },
      { name: '健康' },
      { name: '其他' }
    ]
  },
  {
    field_name: '热度值',
    type: 1, // 文本
    description: '热搜热度值'
  },
  {
    field_name: '创意名称',
    type: 1, // 文本
    description: '产品创意名称'
  },
  {
    field_name: '总分',
    type: 2, // 数字
    description: '综合评分（0-100）'
  },
  {
    field_name: '评级',
    type: 3, // 单选
    description: '创意评级',
    options: [
      { name: '优秀' },
      { name: '良好' },
      { name: '普通' }
    ]
  },
  {
    field_name: '详情JSON',
    type: 1, // 文本（长文本）
    description: '完整的JSON数据（用于AI提取）'
  },
  {
    field_name: '核心功能',
    type: 1, // 文本
    description: '产品创意的核心功能'
  },
  {
    field_name: '目标用户',
    type: 1, // 文本
    description: '产品创意的目标用户'
  },
  {
    field_name: '标签',
    type: 7, // 多选（注意：多选是type 7，不是3）
    description: '创意标签',
    options: [
      { name: 'AI' },
      { name: '社交' },
      { name: '电商' },
      { name: '教育' },
      { name: '科技' },
      { name: '健康' }
    ]
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

// 创建数据表
async function createTable(token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      table: {
        name: '热点素材库',
        default_view_id: 'vewxxxxx'
      }
    });

    const req = https.request(`https://open.feishu.cn/open-apis/bitable/v1/apps/${config.appToken}/tables`, {
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
        else reject(new Error(`创建表失败: ${result.msg}`));
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 获取数据表列表
async function getTables(token) {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://open.feishu.cn/open-apis/bitable/v1/apps/${config.appToken}/tables`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const result = JSON.parse(body);
        if (result.code === 0) resolve(result.data);
        else reject(new Error(`获取表列表失败: ${result.msg}`));
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// 创建字段
async function createField(token, tableId, field) {
  return new Promise((resolve, reject) => {
    // 根据飞书API文档，字段创建需要特定的请求体格式
    const requestData = {};

    // 基础字段
    if (field.field_name) requestData.field_name = field.field_name;
    if (field.type) requestData.type = field.type;
    if (field.description) requestData.description = field.description;

    // 选项字段（单选、多选）
    if (field.options) {
      requestData.property = {
        options: field.options
      };
    }

    const data = JSON.stringify(requestData);

    const req = https.request(`https://open.feishu.cn/open-apis/bitable/v1/apps/${config.appToken}/tables/${tableId}/fields`, {
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
        else reject(new Error(`创建字段失败 [${field.field_name}]: ${result.msg}`));
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

    console.log('\n📊 获取数据表列表...');
    const tablesData = await getTables(token);
    console.log(`✅ 找到 ${tablesData.items.length} 个数据表`);

    // 使用第一个表（或从URL中指定的表ID）
    const tableId = tablesData.items[0].table_id;
    console.log(`✅ 使用数据表: ${tablesData.items[0].name} (Table ID: ${tableId})`);

    console.log(`\n📝 开始创建 ${fields.length} 个字段...`);

    for (let i = 0; i < fields.length; i++) {
      try {
        await createField(token, tableId, fields[i]);
        console.log(`  ✅ ${i + 1}/${fields.length}: ${fields[i].field_name}`);
      } catch (error) {
        console.log(`  ❌ ${i + 1}/${fields.length}: ${fields[i].field_name} - ${error.message}`);
      }
    }

    console.log('\n🎉 所有字段创建完成！');
    console.log(`\n📍 表格访问链接: https://ai.feishu.cn/base/${config.appToken}?table=${tableId}`);
    console.log(`\n⚠️ 下一步：请在表格中手动配置AI字段捷径来从"详情JSON"提取其他字段内容。`);

  } catch (error) {
    console.error('\n❌ 执行失败:', error.message);
    console.error('\n请检查:');
    console.error('1. App ID 和 App Secret 是否正确');
    console.error('2. 应用权限是否包含 "bitable:app:write"');
    console.error('3. 网络连接是否正常');
  }
}

// 运行
main();
