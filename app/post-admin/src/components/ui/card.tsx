import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  extra?: ReactNode;
}

export function Card({
  title,
  extra,
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white ${className}`}
      {...props}
    >
      {(title || extra) && (
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          {title && (
            <h3 className="text-base font-medium text-neutral-900">{title}</h3>
          )}
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
