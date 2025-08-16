import { Metadata } from "next";

export function getOpenGraph(
  opts?: Partial<Metadata["openGraph"]>,
): Metadata["openGraph"] {
  return {
    images: "/base-og.svg",
    locale: "zh-CN",
    ...opts,
  };
}
