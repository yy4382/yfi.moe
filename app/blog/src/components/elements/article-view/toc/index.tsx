"use client";

import dynamic from "next/dynamic";
import type { MarkdownHeading } from "@repo/markdown/parse";

const Toc = dynamic(() => import("./Toc"));

export default function TocLoader({
  headings,
}: {
  headings: MarkdownHeading[];
}) {
  return <Toc headings={headings} />;
}
