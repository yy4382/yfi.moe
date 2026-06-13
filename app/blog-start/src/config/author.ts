import obExportIcon from "@/assets/icons/ob-export.svg";
import s3ImagePortIcon from "@/assets/icons/s3-image-port.svg";
import ttsImportIcon from "@/assets/icons/tts-import.svg";

export const authorName = "Yunfi";
export const authorDescription = "Undergraduate";

export const contactInfo = [
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

export const projects = [
  {
    icon: s3ImagePortIcon,
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
    icon: ttsImportIcon,
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
    icon: obExportIcon,
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
