# yfi.moe

My personal site built with Astro, Vue and Tailwind CSS.

目前部署于 Vercel，访问地址：[yfi.moe](https://yfi.moe)。之前也使用过 GitHub Actions 构建再拉取到 VPS 上部署，参考 [build.yaml](.github/workflows//build.yaml)。

文章存放在另外的库中，每次构建时会自动 clone。文章库 (private)：[blog-posts](https://github.com/yy4382/blog-posts)

# 本地开发

启动 [docker-compose.yaml](./app/blog/docker-compose.yaml) 中的服务，填写好[环境变量](./app/blog/.env.example)。

在根目录或者 `app/blog` 目录下 `pnpm dev` 启动开发服务器。
