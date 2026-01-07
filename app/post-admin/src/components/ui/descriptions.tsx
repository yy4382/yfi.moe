import type { ReactNode } from "react";

interface DescriptionItem {
  key?: string;
  label: ReactNode;
  children: ReactNode;
}

interface DescriptionsProps {
  items: DescriptionItem[];
  bordered?: boolean;
}

export function Descriptions({ items, bordered = true }: DescriptionsProps) {
  if (bordered) {
    return (
      <dl className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200">
        {items.map((item, index) => (
          <div
            key={item.key ?? `desc-${index}`}
            className="flex px-4 py-3 text-sm"
          >
            <dt className="w-1/3 shrink-0 font-medium text-neutral-500">
              {item.label}
            </dt>
            <dd className="text-neutral-900">{item.children}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className="space-y-3">
      {items.map((item, index) => (
        <div key={item.key ?? `desc-${index}`} className="flex text-sm">
          <dt className="w-1/3 shrink-0 font-medium text-neutral-500">
            {item.label}
          </dt>
          <dd className="text-neutral-900">{item.children}</dd>
        </div>
      ))}
    </dl>
  );
}
