import type { ReactNode } from "react";
import { NavLink } from "react-router";

interface MenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  to: string;
}

interface MenuProps {
  items: MenuItem[];
}

export function Menu({ items }: MenuProps) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.key}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
              isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            } `
          }
        >
          {item.icon && <span className="h-5 w-5 shrink-0">{item.icon}</span>}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
