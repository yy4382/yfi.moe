# Post Admin

用于管理文章的 Web 管理后台。

面向用户 feature：查看文章列表、修改文章，markdown 双栏编辑。

实现：将包含文章的 git 仓库 clone 到本地，然后提供 api 供 web 管理后台使用。
通过一个环境变量配置本地 git 仓库的地址。

技术栈：
前端：React, React Router Declarative mode, tanstack query, antd, tailwindcss.
后端：通过 Nitro v3 提供 api。Hono。Node.js。Use a very simple way to protect the api with auth.

后端位于 `server` 目录下，前端位于 `src` 目录下。
