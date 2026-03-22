const fs = require('fs');
const path = require('path');

// 完全修复HTML文件中的JSON-LD语法错误
function fixJSONCompletely() {
  const docsDir = path.join(__dirname, '..', 'docs');
  
  // 找到所有HTML文件
  const htmlFiles = [];
  function findHTMLFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        findHTMLFiles(filePath);
      } else if (file.endsWith('.html')) {
        htmlFiles.push(filePath);
      }
    }
  }
  
  findHTMLFiles(docsDir);
  
  console.log(`找到 ${htmlFiles.length} 个HTML文件`);
  
  // 修复每个HTML文件中的JSON-LD
  let fixedCount = 0;
  for (const htmlFile of htmlFiles) {
    let content = fs.readFileSync(htmlFile, 'utf8');
    let modified = false;
    
    // 提取并修复JSON-LD
    const jsonLdMatch = content.match(/<script type="application\/ld\+json">(\{[\s\S]*?\})<\/script>/);
    if (jsonLdMatch) {
      try {
        const jsonStr = jsonLdMatch[1];
        // 尝试解析JSON
        JSON.parse(jsonStr);
        console.log(`✅ ${path.relative(docsDir, htmlFile)}: JSON语法正确`);
      } catch (error) {
        console.log(`❌ ${path.relative(docsDir, htmlFile)}: JSON语法错误: ${error.message}`);
        
        // 手动修复常见的JSON问题
        let fixedJson = jsonLdMatch[1];
        
        // 1. 修复缺少逗号的问题
        fixedJson = fixedJson.replace(/"description":"([^"]+)"\s*\}/, '"description":"$1"}');
        
        // 2. 确保所有字符串都有正确的引号
        fixedJson = fixedJson.replace(/"logo":\{"@type":"ImageObject","url":"([^"]+)"\}/, '"logo":{"@type":"ImageObject","url":"$1"}');
        
        // 3. 修复可能的多余逗号
        fixedJson = fixedJson.replace(/,\s*}/, '}');
        fixedJson = fixedJson.replace(/,\s*]/, ']');
        
        // 替换修复后的JSON
        content = content.replace(jsonLdMatch[0], `<script type="application/ld+json">${fixedJson}</script>`);
        modified = true;
        
        // 验证修复后的JSON
        try {
          JSON.parse(fixedJson);
          console.log(`✅ ${path.relative(docsDir, htmlFile)}: JSON修复成功`);
        } catch (e) {
          console.log(`❌ ${path.relative(docsDir, htmlFile)}: JSON修复失败: ${e.message}`);
          // 如果修复失败，使用简单的JSON
          const simpleJson = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "每日报告",
            "description": "通信行业总经理的每日市场分析、待办事项和项目进展"
          };
          content = content.replace(jsonLdMatch[0], `<script type="application/ld+json">${JSON.stringify(simpleJson, null, 2)}</script>`);
          console.log(`✅ ${path.relative(docsDir, htmlFile)}: 使用简化JSON`);
          modified = true;
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(htmlFile, content, 'utf8');
      fixedCount++;
    }
  }
  
  console.log(`\n🎯 完成! 修复了 ${fixedCount} 个文件`);
}

// 执行
fixJSONCompletely();