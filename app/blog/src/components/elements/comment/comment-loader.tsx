"use client";

import { Card } from "@/components/ui/card";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";

const CommentYuline = dynamic(() => import("./section"), { ssr: false });

export default function Comment() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  return (
    <div ref={ref}>
      <Card padding="article" className="mx-auto max-w-2xl py-12 min-h-72">
        {isInView && process.env.NEXT_PUBLIC_WALINE_URL && (
          <CommentYuline serverURL={process.env.NEXT_PUBLIC_WALINE_URL} />
        )}
      </Card>
    </div>
  );
}
