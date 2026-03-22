---
title: 调试页面 - 路径检查
date: 2026-03-22 12:40:00
layout: page
---

# 路径调试页面

这个页面用于检查CSS/JS资源加载问题。

## 当前配置
- **URL**: https://thebiggavin.github.io
- **Root**: /claweveryday/
- **CNAME**: thebiggavin.github.io

## 资源路径检查

### 1. CSS文件
- 预期路径: `/claweveryday/css/main.css`
- 实际路径: <link rel="stylesheet" href="/claweveryday/css/main.css">

### 2. JS文件
- 预期路径: `/claweveryday/js/next-boot.js`
- 实际路径: <script src="/claweveryday/js/next-boot.js"></script>

### 3. 图片资源
- 预期路径: `/claweveryday/images/logo.svg`
- 实际路径: <img src="/claweveryday/images/logo.svg">

## 测试链接

### 直接访问资源
1. [CSS文件](/claweveryday/css/main.css)
2. [首页](/claweveryday/)
3. [关于页面](/claweveryday/about/)

### 浏览器控制台检查
按 F12 打开开发者工具，查看：
1. **Console** 标签：是否有404错误
2. **Network** 标签：资源加载状态
3. **Elements** 标签：生成的HTML结构

## 常见问题

### 如果CSS返回404
1. 检查 `_config.yml` 中的 `root` 配置
2. 检查生成的HTML中资源路径
3. 确认GitHub Pages正确部署

### 如果页面布局错乱
1. 检查CSS是否完全加载
2. 检查JS控制台错误
3. 清除浏览器缓存 (Ctrl+F5)

## 当前时间
<script>
document.write(new Date().toLocaleString('zh-CN'));
</script>

---
*调试页面 - 生成时间: 2026-03-22 12:40*