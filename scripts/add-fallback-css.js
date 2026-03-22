const fs = require('fs');
const path = require('path');

// 添加fallback.css到所有HTML文件
function addFallbackCSS() {
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
  
  // 在每个HTML文件中添加fallback.css
  let modifiedCount = 0;
  for (const htmlFile of htmlFiles) {
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    // 在default.css之后添加fallback.css
    const defaultCSSPattern = /href="\/claweveryday\/css\/default\.css"/;
    if (defaultCSSPattern.test(content)) {
      // 替换为同时包含default.css和fallback.css
      const newContent = content.replace(
        defaultCSSPattern,
        'href="/claweveryday/css/default.css"><link rel="stylesheet" href="/claweveryday/css/fallback.css"'
      );
      
      if (newContent !== content) {
        fs.writeFileSync(htmlFile, newContent, 'utf8');
        modifiedCount++;
        console.log(`✅ 已修改: ${path.relative(docsDir, htmlFile)}`);
      }
    }
  }
  
  console.log(`\n🎯 完成! 修改了 ${modifiedCount} 个文件`);
}

// 执行
addFallbackCSS();