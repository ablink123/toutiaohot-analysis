// generate-website.js
// 生成网站文件（复制报告和索引到website/目录）

const fs = require('fs');
const path = require('path');

// 配置
const config = {
  reportsDir: path.join(__dirname, '..', 'reports'),
  dataIndexPath: path.join(__dirname, '..', 'data', 'index.json'),
  websiteDir: path.join(__dirname, '..', 'website'),
  websiteDataDir: path.join(__dirname, '..', 'website', 'data'),
  websiteReportsDir: path.join(__dirname, '..', 'website', 'reports')
};

/**
 * 递归复制目录
 */
function copyDirectory(src, dest) {
  // 创建目标目录
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // 读取源目录
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // 递归复制子目录
      copyDirectory(srcPath, destPath);
    } else if (entry.isFile()) {
      // 复制文件
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 复制报告文件到website目录
 */
function copyReports() {
  console.log('📁 复制报告文件...');

  if (!fs.existsSync(config.reportsDir)) {
    console.log('  ⚠️  报告目录不存在');
    return;
  }

  // 复制整个reports目录
  copyDirectory(config.reportsDir, config.websiteReportsDir);

  console.log(`  ✅ 报告已复制到: ${config.websiteReportsDir}`);
}

/**
 * 复制索引文件到website目录
 */
function copyIndex() {
  console.log('📊 复制索引文件...');

  if (!fs.existsSync(config.dataIndexPath)) {
    console.log('  ⚠️  索引文件不存在');
    return;
  }

  // 创建website/data目录（如果不存在）
  if (!fs.existsSync(config.websiteDataDir)) {
    fs.mkdirSync(config.websiteDataDir, { recursive: true });
  }

  // 读取索引文件
  const indexContent = fs.readFileSync(config.dataIndexPath, 'utf-8');
  const indexData = JSON.parse(indexContent);

  // 转换路径分隔符：将 Windows 的反斜杠转换为正斜杠
  function normalizePath(obj) {
    if (Array.isArray(obj)) {
      return obj.map(normalizePath);
    } else if (obj && typeof obj === 'object') {
      const normalized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'file' || key === 'reportPath' || key === 'webPath') {
          // 转换路径中的反斜杠为正斜杠
          normalized[key] = value.replace(/\\/g, '/');
        } else {
          normalized[key] = normalizePath(value);
        }
      }
      return normalized;
    }
    return obj;
  }

  const normalizedIndex = normalizePath(indexData);

  // 保存到website目录
  const destPath = path.join(config.websiteDataDir, 'index.json');
  fs.writeFileSync(destPath, JSON.stringify(normalizedIndex, null, 2), 'utf-8');

  console.log(`  ✅ 索引已复制到: ${destPath}`);
  console.log(`  🔄 路径已标准化为正斜杠`);
}

/**
 * 生成sitemap.xml
 */
function generateSitemap() {
  console.log('🗺️  生成sitemap.xml...');

  // 读取索引数据
  let indexData;
  try {
    const content = fs.readFileSync(config.dataIndexPath, 'utf-8');
    indexData = JSON.parse(content);
  } catch (error) {
    console.log('  ⚠️  无法读取索引数据');
    return;
  }

  const baseUrl = 'https://toutiaohot-analysis.vercel.app'; // Vercel会提供域名

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

  // 添加每个报告的URL
  indexData.reports.forEach(report => {
    const reportUrl = `${baseUrl}/${report.file.replace(/\\/g, '/')}`;
    sitemap += `  <url>
    <loc>${reportUrl}</loc>
    <lastmod>${new Date(report.date).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  sitemap += '</urlset>';

  // 保存sitemap
  const sitemapPath = path.join(config.websiteDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

  console.log(`  ✅ sitemap.xml已生成: ${sitemapPath}`);
}

/**
 * 主函数
 */
function main() {
  console.log('========================================');
  console.log('   生成网站');
  console.log('========================================\n');

  try {
    // 复制索引
    copyIndex();

    // 复制报告
    copyReports();

    // 生成sitemap
    generateSitemap();

    console.log('\n========================================');
    console.log('   网站生成完成!');
    console.log('========================================');
    console.log(`📁 网站目录: ${config.websiteDir}`);
    console.log(`\n💡 下一步:`);
    console.log(`   1. 在浏览器打开 ${path.join(config.websiteDir, 'index.html')} 预览`);
    console.log(`   2. 运行以下命令部署到Vercel:`);
    console.log(`      git add .`);
    console.log(`      git commit -m "Add new report"`);
    console.log(`      git push`);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 导出函数供其他模块使用
module.exports = {
  copyReports,
  copyIndex,
  generateSitemap
};

// 如果直接运行此脚本
if (require.main === module) {
  main();
}
