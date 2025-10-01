import type { PropsWithChildren } from "react";

export function Logo({ children }: PropsWithChildren) {
  return (
    <a href="/" className="shrink-0">
      {children}
    </a>
  );
}
