"use client";

import { ComponentProps } from "react";

export default function CopyEmail(
  props: ComponentProps<"button"> & { email: string },
) {
  const handleClick = () => {
    navigator.clipboard.writeText(props.email);
  };
  return <button {...props} onClick={handleClick} />;
}
