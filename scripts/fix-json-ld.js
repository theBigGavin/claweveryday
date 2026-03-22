const fs = require('fs');
const path = require('path');

// 修复HTML文件中的JSON-LD语法错误
function fixJSONLD() {
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
    
    // 修复JSON-LD中的logo.url结构
    // 原来的错误结构: "logo":{"@type":"ImageObject","url":{"text":"通信日报"}}
    // 正确结构: "logo":{"@type":"ImageObject","url":"通信日报"}
    const jsonLDPattern = /"logo":\{"@type":"ImageObject","url":\{"text":"([^"]+)"\}\}/g;
    if (jsonLDPattern.test(content)) {
      content = content.replace(
        jsonLDPattern,
        '"logo":{"@type":"ImageObject","url":"$1"}'
      );
      modified = true;
    }
    
    // 修复重复的fallback.css链接
    const duplicateCSSPattern = /<link rel="stylesheet" href="\/claweveryday\/css\/fallback\.css"><link rel="stylesheet" href="\/claweveryday\/css\/fallback\.css">/g;
    if (duplicateCSSPattern.test(content)) {
      content = content.replace(
        duplicateCSSPattern,
        '<link rel="stylesheet" href="/claweveryday/css/fallback.css">'
      );
      modified = true;
    }
    
    // 修复已弃用的meta标签
    const deprecatedMetaPattern = /<meta name="apple-mobile-web-app-capable" content="yes">/g;
    if (deprecatedMetaPattern.test(content)) {
      content = content.replace(
        deprecatedMetaPattern,
        '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
      );
      modified = true;
    }
    
    // 修复空的script src
    const emptyScriptPattern = /<script src="local"><\/script>/g;
    if (emptyScriptPattern.test(content)) {
      content = content.replace(
        emptyScriptPattern,
        ''
      );
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(htmlFile, content, 'utf8');
      fixedCount++;
      console.log(`✅ 已修复: ${path.relative(docsDir, htmlFile)}`);
    }
  }
  
  console.log(`\n🎯 完成! 修复了 ${fixedCount} 个文件`);
}

// 执行
fixJSONLD();