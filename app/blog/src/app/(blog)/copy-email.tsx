"use client";

import { ComponentProps } from "react";
import { toast } from "sonner";

export default function CopyEmail(
  props: ComponentProps<"button"> & { email: string },
) {
  const handleClick = () => {
    navigator.clipboard.writeText(props.email).catch(() => {
      toast.error("复制失败，可能您没有使用 HTTPS 访问");
    });
  };
  return <button {...props} onClick={handleClick} />;
}
