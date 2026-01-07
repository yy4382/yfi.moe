import type { HTMLAttributes, ReactNode } from "react";

type TagColor = "default" | "success" | "warning" | "danger" | "info";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  color?: TagColor;
  icon?: ReactNode;
}

const colorStyles: Record<TagColor, string> = {
  default: "bg-neutral-100 text-neutral-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
};

export function Tag({
  color = "default",
  icon,
  children,
  className = "",
  ...props
}: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${colorStyles[color]} ${className} `}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
