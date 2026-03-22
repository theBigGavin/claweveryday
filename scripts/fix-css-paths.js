const fs = require('fs');
const path = require('path');

// 修复CSS路径问题
function fixCSSPaths() {
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
  
  // 修复每个HTML文件中的CSS路径
  let fixedCount = 0;
  for (const htmlFile of htmlFiles) {
    let content = fs.readFileSync(htmlFile, 'utf8');
    let modified = false;
    
    // 1. 修复 href="local" 错误
    if (content.includes('href="local"')) {
      content = content.replace(/href="local"/g, '');
      modified = true;
      console.log(`✅ ${path.relative(docsDir, htmlFile)}: 移除了 href="local"`);
    }
    
    // 2. 确保所有本地CSS路径以 /claweveryday/ 开头
    const cssPattern = /href="(\/claweveryday\/css\/[^"]+\.css)"/g;
    const matches = [...content.matchAll(cssPattern)];
    if (matches.length > 0) {
      console.log(`📁 ${path.relative(docsDir, htmlFile)}: 找到 ${matches.length} 个CSS链接`);
      for (const match of matches) {
        const cssPath = match[1];
        // 检查CSS文件是否存在
        const fullPath = path.join(docsDir, cssPath.replace(/^\/claweveryday\//, ''));
        if (fs.existsSync(fullPath)) {
          console.log(`   ✅ ${cssPath}: 文件存在`);
        } else {
          console.log(`   ❌ ${cssPath}: 文件不存在!`);
        }
      }
    }
    
    // 3. 添加base标签确保相对路径正确
    if (!content.includes('<base href="/claweveryday/">')) {
      // 在head开始后添加base标签
      const headEndMatch = content.match(/<head[^>]*>/);
      if (headEndMatch) {
        const headEnd = headEndMatch[0];
        content = content.replace(headEnd, `${headEnd}\n<base href="/claweveryday/">`);
        modified = true;
        console.log(`✅ ${path.relative(docsDir, htmlFile)}: 添加了base标签`);
      }
    }
    
    // 4. 修复可能错误的相对路径
    const wrongPaths = [
      { from: 'href="css/', to: 'href="/claweveryday/css/' },
      { from: 'src="js/', to: 'src="/claweveryday/js/' },
      { from: 'src="img/', to: 'src="/claweveryday/img/' },
      { from: 'href="img/', to: 'href="/claweveryday/img/' }
    ];
    
    for (const pathFix of wrongPaths) {
      if (content.includes(pathFix.from)) {
        content = content.replace(new RegExp(pathFix.from, 'g'), pathFix.to);
        modified = true;
        console.log(`✅ ${path.relative(docsDir, htmlFile)}: 修复了 ${pathFix.from} 路径`);
      }
    }
    
    if (modified) {
      fs.writeFileSync(htmlFile, content, 'utf8');
      fixedCount++;
    }
  }
  
  console.log(`\n🎯 完成! 修复了 ${fixedCount} 个文件`);
  
  // 验证修复
  console.log('\n🔍 验证修复:');
  const indexFile = path.join(docsDir, 'index.html');
  if (fs.existsSync(indexFile)) {
    const indexContent = fs.readFileSync(indexFile, 'utf8');
    const cssLinks = [...indexContent.matchAll(/href="([^"]+\.css)"/g)];
    console.log('首页CSS链接:');
    cssLinks.forEach(match => {
      console.log(`  ${match[1]}`);
    });
    
    // 检查base标签
    if (indexContent.includes('<base href="/claweveryday/">')) {
      console.log('✅ base标签已添加');
    } else {
      console.log('❌ base标签未添加');
    }
  }
}

// 执行
fixCSSPaths();