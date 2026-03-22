const fs = require('fs');
const path = require('path');

// 确保所有资源路径正确
function ensureCorrectPaths() {
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
  
  console.log(`处理 ${htmlFiles.length} 个HTML文件`);
  
  // 处理每个HTML文件
  for (const htmlFile of htmlFiles) {
    let content = fs.readFileSync(htmlFile, 'utf8');
    let modified = false;
    const relativePath = path.relative(docsDir, htmlFile);
    
    // 1. 确保所有本地资源路径以 /claweveryday/ 开头
    const resourcePatterns = [
      { tag: 'link', attr: 'href', pattern: /(href=")(?!https?:\/\/)(?!\/claweveryday\/)([^"#]+\.(css|ico|png|jpg|jpeg|gif|svg))(")/gi },
      { tag: 'script', attr: 'src', pattern: /(src=")(?!https?:\/\/)(?!\/claweveryday\/)([^"#]+\.js)(")/gi },
      { tag: 'img', attr: 'src', pattern: /(src=")(?!https?:\/\/)(?!\/claweveryday\/)([^"#]+\.(png|jpg|jpeg|gif|svg|webp))(")/gi },
      { tag: 'a', attr: 'href', pattern: /(href=")(?!https?:\/\/)(?!\/)(?!mailto:)(?!tel:)([^"#]+\.(html|htm))(")/gi }
    ];
    
    for (const { tag, attr, pattern } of resourcePatterns) {
      const matches = [...content.matchAll(pattern)];
      if (matches.length > 0) {
        console.log(`📁 ${relativePath}: 找到 ${matches.length} 个需要修复的${tag}.${attr}`);
        
        for (const match of matches) {
          const fullMatch = match[0];
          const prefix = match[1];
          const resourcePath = match[2];
          const suffix = match[3];
          
          // 确定正确的路径
          let correctPath = resourcePath;
          
          // 如果路径已经是相对路径且不以/开头，需要根据文件位置调整
          if (!resourcePath.startsWith('/')) {
            // 计算相对于根目录的路径
            const fileDir = path.dirname(relativePath);
            const relativeToRoot = fileDir === '.' ? '' : fileDir + '/';
            correctPath = `/claweveryday/${relativeToRoot}${resourcePath}`;
          } else if (!resourcePath.startsWith('/claweveryday/')) {
            // 如果以/开头但不是/claweveryday/，添加前缀
            correctPath = `/claweveryday${resourcePath}`;
          }
          
          const corrected = `${prefix}${correctPath}${suffix}`;
          content = content.replace(fullMatch, corrected);
          modified = true;
          
          console.log(`   🔄 ${resourcePath} → ${correctPath}`);
        }
      }
    }
    
    // 2. 确保base标签存在且正确
    const baseTagPattern = /<base[^>]*>/i;
    const baseTagMatch = content.match(baseTagPattern);
    
    if (!baseTagMatch) {
      // 在head标签后添加base标签
      const headEndMatch = content.match(/<head[^>]*>/i);
      if (headEndMatch) {
        const headEnd = headEndMatch[0];
        content = content.replace(headEnd, `${headEnd}\n<base href="/claweveryday/">`);
        modified = true;
        console.log(`✅ ${relativePath}: 添加了base标签`);
      }
    } else if (!baseTagMatch[0].includes('href="/claweveryday/"')) {
      // 修复不正确的base标签
      content = content.replace(baseTagPattern, '<base href="/claweveryday/">');
      modified = true;
      console.log(`✅ ${relativePath}: 修复了base标签`);
    }
    
    // 3. 移除重复的CSS链接
    const cssLinks = [...content.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/gi)];
    const cssHrefs = new Set();
    
    for (const match of cssLinks) {
      const linkTag = match[0];
      const hrefMatch = linkTag.match(/href="([^"]+)"/i);
      if (hrefMatch) {
        const href = hrefMatch[1];
        if (cssHrefs.has(href)) {
          // 移除重复的CSS链接
          content = content.replace(linkTag, '');
          modified = true;
          console.log(`✅ ${relativePath}: 移除了重复的CSS链接: ${href}`);
        } else {
          cssHrefs.add(href);
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(htmlFile, content, 'utf8');
      console.log(`💾 ${relativePath}: 已保存修改`);
    }
  }
  
  console.log('\n🎯 路径修复完成!');
  
  // 验证首页的CSS链接
  console.log('\n🔍 验证首页CSS链接:');
  const indexFile = path.join(docsDir, 'index.html');
  if (fs.existsSync(indexFile)) {
    const indexContent = fs.readFileSync(indexFile, 'utf8');
    const cssLinks = [...indexContent.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi)];
    
    console.log(`找到 ${cssLinks.length} 个CSS链接:`);
    cssLinks.forEach((match, i) => {
      console.log(`  ${i+1}. ${match[1]}`);
    });
    
    // 检查base标签
    if (indexContent.includes('<base href="/claweveryday/">')) {
      console.log('✅ base标签正确');
    } else {
      console.log('❌ base标签缺失');
    }
  }
}

// 执行
ensureCorrectPaths();