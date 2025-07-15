"use client";

import { Card } from "@/components/ui/card";
import { commentConfig } from "@/config/site";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useRef } from "react";

const CommentWaline = dynamic(() => import("./comment-waline"), { ssr: false });

export default function Comment() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  const pathname = usePathname();

  return (
    <div ref={ref}>
      <Card padding="article" className="mx-auto max-w-2xl py-12">
        {isInView && (
          <CommentWaline path={pathname} serverURL={commentConfig.walineUrl} />
        )}
      </Card>
    </div>
  );
}
