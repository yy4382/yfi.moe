---
start-date: 2025-09-29T17:58:23+08:00
date: 2025-09-29T16:15:48.655Z
updated: 2025-09-30T00:04:08+08:00
slug: reactive-react-in-markdown
title: 在 Markdown 中使用 React 组件
published: true
tags:
  - React
  - Markdown
  - 教程向
---

我想在我的 Markdown 博客文章中嵌入一些简单的 React 组件——想做到很容易，想做好却并不简单。

<!-- more -->

## 需求

最主要的诉求是可以在 markdown 渲染出的网页（比如现在这篇博客文章）中嵌入一些 React 组件，比如代码块的复制按钮、GitHub 仓库信息卡片等。

还有一些额外的需求：

1. 尽可能少地增加 JavaScript 包大小（或者其他需要网络传输的数据大小）
2. SSR/水合友好。
3. 最好可以做到框架无关。
4. 不要使用 MDX。这个需求比较个人，具体原因可以看文末的 [为什么不用 MDX](#why-not-mdx)。

## Markdown 如何包含 React 组件？

一个简单的方法是使用 HTML 的 custom element 作为中间表示，比如将 markdown 转换成 `<github-card data-repo="yy4382/yfi.moe" />`，然后在最后渲染的时候通过一些办法用 React 组件替换这些 custom element（本文的重点就是通过什么办法做替换）。

这种方法的好处是不会限制使用的 markdown 处理器，更换起来比较简单。

我使用的是 remark / rehype 这个生态系统，这种情况下实际上不需要序列化成 HTML，在转换成 HTML 的 AST `hast` 后就可以使用 `hast-util-to-jsx-runtime` 库将这些自定义元素转换为 React 组件了。

同时，其实我们并不需要在 markdown 中手动写这些 custom element，可以使用 remark / rehype 插件。比如，如果想要给每个代码块添加一个 copy button，我就编写了 [一个插件](https://github.com/yy4382/yfi.moe/blob/304eb8ba981bd0e507fe8801337d9b6c8029026c/lib/markdown/src/plugins/rehype-codeblock-copy.ts) 自动添加；Markdown 还有一个不在 CommonMark 标准但社区广泛采用的 [directives 提案](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444)，可以使用它实现更有 markdown 风格的 GitHub 卡片 `::github-repo{repo="yy4382/yfi.moe"}`。

## 欠优化的方法

先介绍两个我尝试过，但是因为缺点太明显，以至于没有实际上线过的方案：

1. 直接用 `react-markdown` 库：我为什么要把整个 remark/rehype 工具链发到客户端？我只是想展示一篇博客文章而已。
2. 使用 `react-dom` 的 `createPortal` 来将组件插入到对应位置：在服务端 `createPortal` 不会跑（因为没有真实 DOM），不能 SSR。

## 方法一：RSC 就是为此而生的

> [!NOTE]
> 优点：简单易实现
>
> 缺点：必须得有 RSC 才能用；RSC payload 可能过大

直接用 `react-markdown` 会导致超大的包大小，那我把它放进 [RSC](https://react.dev/reference/rsc/server-components) 里不就行了吗？

如果你有幸（或者不幸）使用了 Next.js[^1]，那么这种方法简单易操作，不需要用到（后文会提到的）各种奇技淫巧。

然而这种方法也有一些小问题：

1. 显然只能在支持 RSC 的框架中使用
2. RSC Payload 会很大：每个 `<p>` 或者 `<div>` 都会以 RSC 的格式存在于 payload 中；而 RSC 格式虽然相对于 React 组件代码来说很紧凑，但是和 HTML 相比还是大不少。在使用类似 shiki 这样的高亮库后，高亮部分更是会让 RSC payload 急速膨胀：代码块一多，RSC payload 甚至可能比直接把 `react-markdown` 发到客户端还要大。一种缓解办法是把代码块部分直接用 `dangerouslySetInnerHTML` 插入，就不用为其中每个 token 都生成 RSC 表示了（[示例代码](https://github.com/yy4382/yfi.moe/blob/nextjs-attempt/app/blog-next/src/components/elements/markdown/markdown.tsx#L52-L55)）。
   本博客曾经有过一段时间使用的是 Next.js，当时就是使用的这种思路，只是稍有更改：没有直接使用 `react-markdown`，而是将 markdown 转换到 hast 和 hast 转换成 React 组件分了开来。当时的代码在博客开源仓库的 `nextjs-attemp` tag 下：[yy4382/yfi.moe at nextjs-attempt](https://github.com/yy4382/yfi.moe/tree/nextjs-attempt)。

## 方法二：手动 SSR + hydrateRoot

> [!IMPORTANT]
> 这是本博客目前使用的方式，也是我目前最推荐的。

> [!NOTE]
> 优点：几乎不会额外增加包体积；可选的 SSR 与水合；适用于大部分框架
>
> 缺点：在 React 框架中会有一些小问题

该方法是针对 React 18+ 设计的，之前的版本我也没研究过。（`hydrateRoot` API 都是在 18 的时候才加的）

这个方法的思路是：

1. 服务端中，在上文提到的包含 custom element 的中间表示 AST 基础上，新增的一个插件，调用 `react-dom` 的 `renderToString` 将所有 custom element 转换成真实 React 组件渲染出的结果，这步也就是「手动 SSR」；
2. 序列化为 HTML 后，使用框架提供的方法直接插入 DOM（如 Astro 的 `set:html` prop）。这步也是在服务端完成的；
3. 在客户端，对每个需要变成 React 组件的元素使用对应的 React 组件调用 `hydrateRoot`，这样组件就变得有交互性啦。
   性能方面，经我测试，对于不太复杂的组件（比如复制按键、GitHub Card 等），数百个 Root 并不会对性能有什么影响。考虑到 Astro 就是用类似的方法实现的 islands 架构且运行良好，这种方法在大多数情况下应该不会有性能问题。

### 思路实现

一些目前我在 Astro 中使用的示例代码（链接中都固定使用了编写本文时的最新 commit，这样可以保证行号不会因为之后更改而变动；如果 commit 消失了可以去 main 分支里找一下）：

关键文件：[yfi.moe/app/blog-astro/src/components/markdown/markdown-article.astro at 304eb8 · yy4382/yfi.moe](https://github.com/yy4382/yfi.moe/blob/304eb8ba981bd0e507fe8801337d9b6c8029026c/app/blog-astro/src/components/markdown/markdown-article.astro)

- 文件 25-48 行向我的 markdown 渲染管线中添加了新插件，用于将两个 custom element 转换成对应的 React 组件渲染出的 HTML fragment；
- 54 行直接将转换出的 HTML 插入
- 66-84 行会在客户端运行，找到所有需要转换成组件的元素，对每个元素调用 `hydrateRoot`；同时别忘了在页面卸载时 unmount 它们。

### 缺陷

这种方法在 React 框架（比如 Next.js）中会有一些问题，我也还没有完全弄清原因；不过对于「在 React 创建维护的 DOM 中创建新的 React Root」这种奇怪用法，出现一些问题也在情理之中。

当时我在 Next.js 中的设置是这样的：

- 一个 server component，它负责生成 markdown 转换出的 HTML，将它 setHtml 进 jsx 里；
- 一个返回 `null` 的 client component，它只有一个 `useEffect`，effect 中对所有元素进行水合，并且返回一个 unmount 它们的清理函数。它是上文 server component 的子组件。
  遇到了如下问题：
- 由于 Next.js 编译器的人为限制，在服务器组建中不让导入 `react-dom` 的 API，而我需要它们来手动 SSR。最后通过动态导入骗过了编译器；
- unmount 时会报错。目前怀疑是因为是在 Effect 中调用的，React 18 后的 concurrent rendering 可能不允许在 effect 中 unmount 掉 root，即使是完全无关的其他 root。

## 方法三：将 HAST 传到客户端

> [!NOTE]
> 优点：适用于所有地方，新增的包大小并不大；
>
> 缺点：还是需要新增一些需要网络传输的数据。

如果我使用的是 React 框架，并且它还不支持 RSC 怎么办？我们还有第三种方法。

`react-markdown` 很大，但我们在客户端并不需要它们全部：我们可以在服务端提前将 markdown 转换为 HTML 的 AST 表示 hast，然后将它发送到客户端；在客户端用不太大的 `hast-util-to-jsx-runtime` 库再将 hast 转换成 React JSX。

这样，我们只付出了需要多传输 `hast-util-to-jsx-runtime` 库和文章 hast 的代价，就获得了一个几乎可以在任何地方运行的方案。

为什么要多传输 hast 而非直接从完整的 HTML 里提取出需要的部分转换成 hast 再传给库？因为 HTML 转 hast 的库太大了……而 hast 由于与预渲染的 HTML 相似度较高，gzip 传输时增加的大小并不大。

> [!TIP]
> HAST 默认在节点中附带位置 map 信息，记得把它们去掉，不然 hast 会很大。

这个方法本网站也曾经使用过，效果也还不错。

## 效果展示

### 复制按钮

每个代码块都会自动添加一个复制按钮。

```tsx
function Hello() {
  return <div>Hello, world!</div>;
}
```

### GitHub 仓库信息卡片

`::github-repo{user="yy4382" repo="yfi.moe"}`

::github-repo{user="yy4382" repo="yfi.moe"}

## 注

### 为什么不用 MDX？{#why-not-mdx}

主要是需求原因。我的需求目前只有复制按钮和 GitHub Card，未来即使增加也只会是一些通用的组件；MDX 可以导入任意组件的优势并不成立；我也不想因为这些小需求将我已有的 md 都转换成 mdx。

同时，MDX 应该被视作「代码源文件」而非普通的纯文本文件，这很不「可移植，portable」。MDX 实际上会被编译成 JavaScript 脚本，它有「依赖」，是文件路径敏感的（而我的 markdown 文件甚至是在另一个 GitHub repo 中，是需要构建时从网络上拉下来的）；而普通 markdown 一般会被转换成 HTML fragment，这也是可以当作一个字符串到处传来传去的。有了这样的可移植性，如果未来想完全重写网站，只需要保留好现有的、组件无关的、路径无关的 markdown 转换管线，就可以轻松迁移。

[^1]: 截止本文成稿，Next.js 仍然是唯一在生产级别支持 RSC 的 Meta Framework。

我想在我的 Markdown 博客文章中嵌入一些简单的 React 组件——想做到很容易，想做好却并不简单。

<!-- more -->

## 需求

最主要的诉求是可以在 markdown 渲染出的网页（比如现在这篇博客文章）中嵌入一些 React 组件，比如代码块的复制按钮、GitHub 仓库信息卡片等。

还有一些额外的需求：

1. 尽可能少地增加 JavaScript 包大小（或者其他需要网络传输的数据大小）
2. SSR/水合友好。
3. 最好可以做到框架无关。
4. 不要使用 MDX。这个需求比较个人，具体原因可以看文末的 [为什么不用 MDX](#why-not-mdx)。

## Markdown 如何包含 React 组件？

一个简单的方法是使用 HTML 的 custom element 作为中间表示，比如将 markdown 转换成 `<github-card data-repo="yy4382/yfi.moe" />`，然后在最后渲染的时候通过一些办法用 React 组件替换这些 custom element（本文的重点就是通过什么办法做替换）。

这种方法的好处是不会限制使用的 markdown 处理器，更换起来比较简单。

我使用的是 remark / rehype 这个生态系统，这种情况下实际上不需要序列化成 HTML，在转换成 HTML 的 AST `hast` 后就可以使用 `hast-util-to-jsx-runtime` 库将这些自定义元素转换为 React 组件了。

同时，其实我们并不需要在 markdown 中手动写这些 custom element，可以使用 remark / rehype 插件。比如，如果想要给每个代码块添加一个 copy button，我就编写了 [一个插件](https://github.com/yy4382/yfi.moe/blob/304eb8ba981bd0e507fe8801337d9b6c8029026c/lib/markdown/src/plugins/rehype-codeblock-copy.ts) 自动添加；Markdown 还有一个不在 CommonMark 标准但社区广泛采用的 [directives 提案](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444)，可以使用它实现更有 markdown 风格的 GitHub 卡片 `::github-repo{repo="yy4382/yfi.moe"}`。

## 欠优化的方法

先介绍两个我尝试过，但是因为缺点太明显，以至于没有实际上线过的方案：

1. 直接用 `react-markdown` 库：我为什么要把整个 remark/rehype 工具链发到客户端？我只是想展示一篇博客文章而已。
2. 使用 `react-dom` 的 `createPortal` 来将组件插入到对应位置：在服务端 `createPortal` 不会跑（因为没有真实 DOM），不能 SSR。

## 方法一：RSC 就是为此而生的

> [!NOTE]
> 优点：简单易实现
>
> 缺点：必须得有 RSC 才能用；RSC payload 可能过大

直接用 `react-markdown` 会导致超大的包大小，那我把它放进 [RSC](https://react.dev/reference/rsc/server-components) 里不就行了吗？

如果你有幸（或者不幸）使用了 Next.js[^1]，那么这种方法简单易操作，不需要用到（后文会提到的）各种奇技淫巧。

然而这种方法也有一些小问题：

1. 显然只能在支持 RSC 的框架中使用
2. RSC Payload 会很大：每个 `<p>` 或者 `<div>` 都会以 RSC 的格式存在于 payload 中；而 RSC 格式虽然相对于 React 组件代码来说很紧凑，但是和 HTML 相比还是大不少。在使用类似 shiki 这样的高亮库后，高亮部分更是会让 RSC payload 急速膨胀：代码块一多，RSC payload 甚至可能比直接把 `react-markdown` 发到客户端还要大。一种缓解办法是把代码块部分直接用 `dangerouslySetInnerHTML` 插入，就不用为其中每个 token 都生成 RSC 表示了（[示例代码](https://github.com/yy4382/yfi.moe/blob/nextjs-attempt/app/blog-next/src/components/elements/markdown/markdown.tsx#L52-L55)）。
   本博客曾经有过一段时间使用的是 Next.js，当时就是使用的这种思路，只是稍有更改：没有直接使用 `react-markdown`，而是将 markdown 转换到 hast 和 hast 转换成 React 组件分了开来。当时的代码在博客开源仓库的 `nextjs-attemp` tag 下：[yy4382/yfi.moe at nextjs-attempt](https://github.com/yy4382/yfi.moe/tree/nextjs-attempt)。

## 方法二：手动 SSR + hydrateRoot

> [!IMPORTANT]
> 这是本博客目前使用的方式，也是我目前最推荐的。

> [!NOTE]
> 优点：几乎不会额外增加包体积；可选的 SSR 与水合；适用于大部分框架
>
> 缺点：在 React 框架中会有一些小问题

该方法是针对 React 18+ 设计的，之前的版本我也没研究过。（`hydrateRoot` API 都是在 18 的时候才加的）

这个方法的思路是：

1. 服务端中，在上文提到的包含 custom element 的中间表示 AST 基础上，新增的一个插件，调用 `react-dom` 的 `renderToString` 将所有 custom element 转换成真实 React 组件渲染出的结果，这步也就是「手动 SSR」；
2. 序列化为 HTML 后，使用框架提供的方法直接插入 DOM（如 Astro 的 `set:html` prop）。这步也是在服务端完成的；
3. 在客户端，对每个需要变成 React 组件的元素使用对应的 React 组件调用 `hydrateRoot`，这样组件就变得有交互性啦。
   性能方面，经我测试，对于不太复杂的组件（比如复制按键、GitHub Card 等），数百个 Root 并不会对性能有什么影响。考虑到 Astro 就是用类似的方法实现的 islands 架构且运行良好，这种方法在大多数情况下应该不会有性能问题。

### 思路实现

一些目前我在 Astro 中使用的示例代码（链接中都固定使用了编写本文时的最新 commit，这样可以保证行号不会因为之后更改而变动；如果 commit 消失了可以去 main 分支里找一下）：

关键文件：[yfi.moe/app/blog-astro/src/components/markdown/markdown-article.astro at 304eb8 · yy4382/yfi.moe](https://github.com/yy4382/yfi.moe/blob/304eb8ba981bd0e507fe8801337d9b6c8029026c/app/blog-astro/src/components/markdown/markdown-article.astro)

- 文件 25-48 行向我的 markdown 渲染管线中添加了新插件，用于将两个 custom element 转换成对应的 React 组件渲染出的 HTML fragment；
- 54 行直接将转换出的 HTML 插入
- 66-84 行会在客户端运行，找到所有需要转换成组件的元素，对每个元素调用 `hydrateRoot`；同时别忘了在页面卸载时 unmount 它们。

### 缺陷

这种方法在 React 框架（比如 Next.js）中会有一些问题，我也还没有完全弄清原因；不过对于「在 React 创建维护的 DOM 中创建新的 React Root」这种奇怪用法，出现一些问题也在情理之中。

当时我在 Next.js 中的设置是这样的：

- 一个 server component，它负责生成 markdown 转换出的 HTML，将它 setHtml 进 jsx 里；
- 一个返回 `null` 的 client component，它只有一个 `useEffect`，effect 中对所有元素进行水合，并且返回一个 unmount 它们的清理函数。它是上文 server component 的子组件。
  遇到了如下问题：
- 由于 Next.js 编译器的人为限制，在服务器组建中不让导入 `react-dom` 的 API，而我需要它们来手动 SSR。最后通过动态导入骗过了编译器；
- unmount 时会报错。目前怀疑是因为是在 Effect 中调用的，React 18 后的 concurrent rendering 可能不允许在 effect 中 unmount 掉 root，即使是完全无关的其他 root。

## 方法三：将 HAST 传到客户端

> [!NOTE]
> 优点：适用于所有地方，新增的包大小并不大；
>
> 缺点：还是需要新增一些需要网络传输的数据。

如果我使用的是 React 框架，并且它还不支持 RSC 怎么办？我们还有第三种方法。

`react-markdown` 很大，但我们在客户端并不需要它们全部：我们可以在服务端提前将 markdown 转换为 HTML 的 AST 表示 hast，然后将它发送到客户端；在客户端用不太大的 `hast-util-to-jsx-runtime` 库再将 hast 转换成 React JSX。

这样，我们只付出了需要多传输 `hast-util-to-jsx-runtime` 库和文章 hast 的代价，就获得了一个几乎可以在任何地方运行的方案。

为什么要多传输 hast 而非直接从完整的 HTML 里提取出需要的部分转换成 hast 再传给库？因为 HTML 转 hast 的库太大了……而 hast 由于与预渲染的 HTML 相似度较高，gzip 传输时增加的大小并不大。

> [!TIP]
> HAST 默认在节点中附带位置 map 信息，记得把它们去掉，不然 hast 会很大。

这个方法本网站也曾经使用过，效果也还不错。

## 效果展示

### 复制按钮

每个代码块都会自动添加一个复制按钮。

```tsx
function Hello() {
  return <div>Hello, world!</div>;
}
```

### GitHub 仓库信息卡片

`::github-repo{user="yy4382" repo="yfi.moe"}`

::github-repo{user="yy4382" repo="yfi.moe"}

## 注

### 为什么不用 MDX？{#why-not-mdx}

主要是需求原因。我的需求目前只有复制按钮和 GitHub Card，未来即使增加也只会是一些通用的组件；MDX 可以导入任意组件的优势并不成立；我也不想因为这些小需求将我已有的 md 都转换成 mdx。

同时，MDX 应该被视作「代码源文件」而非普通的纯文本文件，这很不「可移植，portable」。MDX 实际上会被编译成 JavaScript 脚本，它有「依赖」，是文件路径敏感的（而我的 markdown 文件甚至是在另一个 GitHub repo 中，是需要构建时从网络上拉下来的）；而普通 markdown 一般会被转换成 HTML fragment，这也是可以当作一个字符串到处传来传去的。有了这样的可移植性，如果未来想完全重写网站，只需要保留好现有的、组件无关的、路径无关的 markdown 转换管线，就可以轻松迁移。

[^1]: 截止本文成稿，Next.js 仍然是唯一在生产级别支持 RSC 的 Meta Framework。
