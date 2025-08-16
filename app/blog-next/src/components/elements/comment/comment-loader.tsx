"use client";

import { Section } from "@/components/ui/section";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";

const CommentYuline = dynamic(() => import("./section"), { ssr: false });

export default function Comment() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  return (
    <div ref={ref}>
      <Section padding="article" className="mx-auto min-h-72 max-w-2xl py-12">
        {/* TODO  check server url to see if it's enabled */}
        {isInView && <CommentYuline />}
      </Section>
    </div>
  );
}
