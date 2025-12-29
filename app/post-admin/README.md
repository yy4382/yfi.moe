# Post Admin

博客文章管理后台。

## 功能

- 文章列表：搜索、按标签过滤、按日期排序
- 文章编辑：Frontmatter 表单 + Markdown 编辑器（Edit/Preview 切换）
- 新建/删除文章
- Git 同步：查看仓库状态，手动 pull/commit/push

## 技术栈

**前端** (`src/`)：React 19, React Router, TanStack Query, Ant Design, TailwindCSS, CodeMirror 6, @repo/markdown

**后端** (`server/`)：Nitro v3, Hono, simple-git, Bearer Token 认证

## 环境变量

```bash
POSTS_REPO_PATH=/path/to/blog-posts   # Git 仓库路径
POSTS_SUBDIR=post                      # 文章子目录
AUTH_TOKEN=your-secret-token           # API 认证 Token
```

## 开发

```bash
pnpm --filter post-admin dev
```
