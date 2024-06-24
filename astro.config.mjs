import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import remarkGithubAlerts from "remark-github-alerts";
import icon from "astro-icon";
import remarkReadingTime from "./src/utils/remarkReadingTime.mjs";
import rehypeExtendedLinks from "rehype-extended-links";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import autoImport from "unplugin-auto-import/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://yfi.moe/",
  integrations: [
    tailwind(),
    vue(),
    icon(),
    sitemap(),
    autoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
        /\.astro$/, // .astro
      ],

      imports: [
        {
          "astro-icon/components": ["Icon"],
          "./src/utils/path": ["getPostPath"],
          // "@comp/base/Card.astro": [["default", "Card"]],
        },
        {
          from: "astro:content",
          imports: ["CollectionEntry"],
          type: true,
        },
      ],
      defaultExportByFilename: true,
      resolvers: [
        async (name) => {
          // 大驼峰，至少一个词
          if (/^([A-Z][a-z]+){1,}$/.test(name)) {
            if (commonSingleWordNonComponents.includes(name)) return;

            console.log(name);
            const autoImportComponents = await getComponentList([
              [
                "./src/components/**/*.astro",
                { relativePath: "./src/components/" },
              ],
              "./src/layouts/*.astro",
            ]);

            const component = autoImportComponents.find(
              (component) => component.name === name,
            );

            if (!component) return;

            return {
              importName: "default",
              name,
              path: component.file,
            };

            // // console.log(name);
            // // 在单词间任意加斜杠/（每个当中可能加可能不加，穷举），检测路径是否存在，返回存在的路径
            // const words = name.match(/[A-Z][a-z]+/g);
            // const paths = [];
            // for (let i = 0; i < Math.pow(2, words.length - 1); i++) {
            //   const path = words.reduce((acc, word, index) => {
            //     return acc + word + (i & (1 << index) ? "/" : "");
            //   }, "./src/components/");
            //   paths.push(path);
            // }
            // // console.log(paths);
            // const realPath = (
            //   await Promise.all(
            //     paths.map(async (path) => {
            //       const fullPath = path + ".astro";
            //       const exists = await checkModuleExists(fullPath);
            //       if (exists) return fullPath;
            //       else return undefined;
            //     }),
            //   )
            // )
            //   .filter((path) => path)
            //   .shift();
            // if (realPath) {
            //   // console.log(realPath);
            //   return {
            //     importName: "default",
            //     path: realPath,
            //     name,
            //   };
            // }
          }
        },
      ],
    }),
  ],
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkReadingTime],
    rehypePlugins: [
      [
        rehypeExtendedLinks,
        {
          preContent(node) {
            const url = node.properties.href;
            if (!url) return undefined;
            const regex = /^(https?:\/\/)?(www\.)?github\.com\/.*/i;
            if (!regex.test(url)) return undefined;
            return {
              type: "element",
              tagName: "span",
              properties: {
                className: ["i-mingcute-github-line"],
              },
              children: [],
            };
          },
          content: {
            type: "element",
            tagName: "span",
            properties: {
              className: ["i-mingcute-external-link-line"],
            },
            children: [],
          },
        },
      ],
    ],
    remarkRehype: {
      allowDangerousHtml: true,
    },
    shikiConfig: {
      theme: "catppuccin-macchiato",
    },
  },
});

// import { promises as fs } from "node:fs";
// import { fileURLToPath } from "node:url";
import path from "node:path";
import fg from "fast-glob";

// async function checkModuleExists(modulePath) {
//   try {
//     const __filename = fileURLToPath(import.meta.url);
//     const __dirname = path.dirname(__filename);
//     const fullPath = path.resolve(__dirname, modulePath);
//     await fs.access(fullPath);
//     return true;
//   } catch {
//     return false;
//   }
// }

const commonSingleWordNonComponents = [
  "Object",
  "Math",
  "Date",
  "Number",
  "Array",
  "Set",
];

/**
 * Get component name list from dirs
 *
 * If ${dir}/Aa/bb/Cc.astro exists, then AaBbCc will be returned
 *
 * @example getComponentList(["./src/components/**", "./src/layouts"])
 *
 * @param {Array<Array<string>|string>} dirs
 * @returns {Promise<Array<{name: string, file: string}>>}
 */
const getComponentList = async (dirs) => {
  const names = await Promise.all(
    dirs.map(async (dir) => {
      const [globDir, { relativePath }] = Array.isArray(dir) ? dir : [dir, {}];

      const files = await fg(globDir, { onlyFiles: true });

      if (!relativePath)
        return files.map((file) => ({
          name: path.basename(file, path.extname(file)),
          file,
        }));
      else
        return files.map((file) => {
          // convert file path to relative path
          const relative = path.relative(relativePath, file);

          // covert any path separator to camel case
          return {
            name: relative
              .split(path.sep)
              .map((part) => part[0].toUpperCase() + part.slice(1))
              .join("")
              .split(".")
              .slice(0, -1)
              .join(""),
            file,
          };
        });
    }),
  );

  return names.flat();
};
