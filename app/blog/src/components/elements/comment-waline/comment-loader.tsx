"use client";

import { Section } from "@/components/ui/section";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { env } from "@/env";

const CommentYuline = dynamic(() => import("./section"), { ssr: false });

export default function Comment() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  return (
    <div ref={ref}>
      <Section padding="article" className="mx-auto min-h-72 max-w-2xl py-12">
        {isInView && env.NEXT_PUBLIC_WALINE_URL && (
          <CommentYuline serverURL={env.NEXT_PUBLIC_WALINE_URL} />
        )}
      </Section>
    </div>
  );
}
