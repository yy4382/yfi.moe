import type { SvgComponent } from "astro/types";

export const authorName = "Yunfi";
export const authorDescription = "Undergraduate";

export const contactInfo: {
  name: string;
  icon: string;
  link: string;
  color: string;
}[] = [
  {
    name: "GitHub",
    icon: "i-mingcute-github-line",
    link: "https://github.com/yy4382",
    color: "#000000",
  },
  {
    name: "Telegram",
    icon: "i-mingcute-telegram-line",
    link: "https://t.me/yunfichannel",
    color: "#24A1DE",
  },
  {
    name: "Twitter",
    icon: "i-mingcute-twitter-line",
    link: "https://twitter.com/yunfini",
    color: "#1DA1F2",
  },
  {
    name: "Email",
    icon: "i-mingcute-mail-send-line",
    link: "mailto:i@yfi.moe",
    color: "#f87171",
  },
];

type Project = {
  icon: SvgComponent;
  title: string;
  desc: string;
  links: {
    href: string;
    text: string;
    icon: string;
  }[];
};

async function getIcon(stat: Promise<typeof import("*.svg")>) {
  const icon = await stat;
  return icon.default;
}

export const projects: Project[] = [
  {
    // filename.svg in /src/icons folder
    icon: await getIcon(import("@/assets/icons/s3-image-port.svg")),
    title: "S3 Image Port",
    desc: "将 S3 作为图床",
    links: [
      {
        href: "https://github.com/yy4382/s3-image-port",
        text: "GitHub",
        icon: "i-mingcute-github-line",
      },
      {
        href: "https://iport.yfi.moe",
        text: "Web App",
        icon: "i-mingcute-compass-3-line",
      },
    ],
  },
  {
    icon: await getIcon(import("@/assets/icons/tts-import.svg")),
    title: "TTS Importer",
    desc: "轻松将 Azure TTS 导入阅读软件",
    links: [
      {
        href: "https://github.com/yy4382/tts-importer",
        text: "GitHub",
        icon: "i-mingcute-github-line",
      },
      {
        href: "https://tts.yfi.moe",
        text: "Web App",
        icon: "i-mingcute-compass-3-line",
      },
    ],
  },
  {
    icon: await getIcon(import("@/assets/icons/ob-export.svg")),
    title: "Obsidian Site Exporter",
    desc: "将 Obsidian 笔记导出为通用 Markdown 文件",
    links: [
      {
        href: "https://github.com/yy4382/obsidian-static-site-export",
        text: "GitHub",
        icon: "i-mingcute-github-line",
      },
    ],
  },
];
