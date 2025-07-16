export const authorName = "Yunfi";
export const authorDescription = "Undergraduate";
import obExportIcon from "@/assets/icons/ob-export.svg";
import s3ImagePortIcon from "@/assets/icons/s3-image-port.svg";
import ttsImporterIcon from "@/assets/icons/tts-import.svg";
import Image from "next/image";
import MingcuteGithubLine from "@/assets/icons/MingcuteGithubLine";
import MingcuteTelegramLine from "@/assets/icons/MingcuteTelegramLine";
import MingcuteTwitterLine from "@/assets/icons/MingcuteTwitterLine";
import MingcuteMailSendLine from "@/assets/icons/MingcuteMailSendLine";
import { GlobeIcon } from "lucide-react";

type ConfigIcon = (
  props: Omit<Parameters<typeof Image>[0], "src" | "alt">,
) => React.ReactNode;

export const contactInfo: {
  name: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  link: string;
  color: string;
}[] = [
  {
    name: "GitHub",
    icon: MingcuteGithubLine,
    link: "https://github.com/yy4382",
    color: "#000000",
  },
  {
    name: "Telegram",
    icon: (props) => (
      <MingcuteTelegramLine
        {...props}
        // transform for visual balance
        style={{ transform: "translateX(-4%)", ...props.style }}
      />
    ),
    link: "https://t.me/yunfichannel",
    color: "#24A1DE",
  },
  {
    name: "Twitter",
    icon: MingcuteTwitterLine,
    link: "https://twitter.com/yunfini",
    color: "#1DA1F2",
  },
  {
    name: "Email",
    icon: MingcuteMailSendLine,
    link: "mailto:i@yfi.moe",
    color: "#f87171",
  },
];

export const projects: {
  icon: ConfigIcon;
  title: string;
  desc: string;
  links: {
    href: string;
    text: string;
    icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  }[];
}[] = [
  {
    icon: (props) => (
      <Image {...props} src={s3ImagePortIcon} alt="S3 Image Port" />
    ),
    title: "S3 Image Port",
    desc: "将 S3 作为图床",
    links: [
      {
        href: "https://github.com/yy4382/s3-image-port",
        text: "GitHub",
        icon: MingcuteGithubLine,
      },
      {
        href: "https://iport.yfi.moe",
        text: "Web App",
        icon: GlobeIcon,
      },
    ],
  },
  {
    icon: (props) => (
      <Image {...props} src={ttsImporterIcon} alt="TTS Importer" />
    ),
    title: "TTS Importer",
    desc: "轻松将 Azure TTS 导入阅读软件",
    links: [
      {
        href: "https://github.com/yy4382/tts-importer",
        text: "GitHub",
        icon: MingcuteGithubLine,
      },
      {
        href: "https://tts.yfi.moe",
        text: "Web App",
        icon: GlobeIcon,
      },
    ],
  },
  {
    icon: (props) => (
      <Image {...props} src={obExportIcon} alt="Obsidian Site Exporter" />
    ),
    title: "Obsidian Site Exporter",
    desc: "将 Obsidian 笔记导出为通用 Markdown 文件",
    links: [
      {
        href: "https://github.com/yy4382/obsidian-static-site-export",
        text: "GitHub",
        icon: MingcuteGithubLine,
      },
    ],
  },
];
