"use client";
import { SidebarMenuSubButton } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function SidebarMenuSubButtonActive(
  props: React.ComponentProps<typeof SidebarMenuSubButton> & { url: string },
) {
  const pathname = usePathname();

  return (
    <SidebarMenuSubButton
      {...props}
      isActive={pathname.startsWith(props.url)}
    />
  );
}
