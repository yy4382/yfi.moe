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
    icon: "mingcute:github-line",
    link: "https://github.com/yy4382",
    color: "bg-black",
  },
  {
    name: "Telegram",
    icon: "mingcute:telegram-line",
    link: "https://t.me/yunfichannel",
    color: "bg-blue-500",
  },
  {
    name: "Twitter",
    icon: "mingcute:twitter-line",
    link: "https://twitter.com/yunfini",
    color: "bg-blue-400",
  },
  {
    name: "Email",
    icon: "mingcute:mail-send-line",
    link: "mailto:i@yfi.moe",
    color: "bg-red-400",
  },
];

export const projects = [
  {
    icon: "s3-image-port",
    title: "S3 Image Port",
    desc: "将 S3 作为图床",
    links: [
      {
        href: "https://github.com/yy4382/s3-image-port",
        text: "Github",
        icon: "mingcute:github-line",
      },
      {
        href: "https://iport.yfi.moe",
        text: "Demo Web App",
        icon: "mingcute:compass-3-line",
      },
    ],
  },
  {
    icon: "tts-import",
    title: "TTS Importer",
    desc: "轻松将 Azure TTS 导入阅读软件",
    links: [
      {
        href: "https://github.com/yy4382/tts-importer",
        text: "Github",
        icon: "mingcute:github-line",
      },
      {
        href: "https://tts-importer.yfi.moe",
        text: "Web App",
        icon: "mingcute:compass-3-line",
      },
    ],
  },
  {
    icon: "ob-export",
    title: "Obsidian Site Exporter",
    desc: "将 Obsidian 笔记导出为可用于建站的通用 Markdown 文件",
    links: [
      {
        href: "https://github.com/yy4382/obsidian-static-site-export",
        text: "GitHub",
        icon: "mingcute:github-line",
      },
    ],
  },
];
