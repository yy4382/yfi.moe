"use client";

import { Link } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";

export function Logo({ children }: PropsWithChildren) {
  return (
    <Link to="/" className="shrink-0">
      {children}
    </Link>
  );
}
