---
title: 从 Tailwind CSS 迁移到 StyleX 的完整记录
description: 覆盖文章详情全部视觉组件的确定性长文
slug: stylex-migration
date: 2024-03-01T08:15:00+08:00
publishedDate: 2024-03-03T09:30:00+08:00
updated: 2024-03-10T18:45:00+08:00
tags: [视觉回归, StyleX, Astro, 前端]
series: { id: stylex-series, order: 1 }
highlight: true
published: true
copyright: true
---

这是一篇用于视觉回归的代表性文章。它包含足够长的正文、目录层级、代码块、表格、引用和嵌入卡片。

## 为什么迁移 {#why-migrate}

迁移的目标是保持页面外观，同时把样式约束放到更容易维护的位置。

> [!NOTE]
> 截图 fixture 使用固定日期、固定文本和拦截后的 GitHub 数据。

### 原子样式的边界

正文包含 **粗体**、_斜体_、`inline code`、[站内链接](/archive) 和 [GitHub 链接](https://github.com/facebook/stylex)。

```tsx
export function Card({ title }: { title: string }) {
  return <article>{title}</article>;
}
```

## Astro 集成

| 检查项       | 预期 |
| ------------ | ---- |
| 服务端渲染   | 可用 |
| React island | 可用 |
| 深色模式     | 一致 |

### 构建阶段

构建应输出稳定的 CSS，开发模式也应能及时刷新。

#### 嵌入元素

::github-repo{user="facebook" repo="stylex"}

## 视觉验证

1. 固定视口与颜色模式。
2. 禁用动画、光标和时间相关噪声。
3. 对基线与候选截图做逐像素比较。

### 组件截图

每个可见组件保留独立截图；完整页面另外保留全页截图。

### 全站截图

首页、列表、归档、标签、文章、静态页面、404 与通知页都进入矩阵。

## 结论

视觉一致性由机器报告辅助判断，任何非零差异都需要人工确认。
