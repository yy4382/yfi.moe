import { PageScrollInfoProvider } from "@/components/providers/scroll-detect";
import { Navbar as NavbarComponent, type NavbarProps } from "./navbar";

function NavbarWrapper(props: NavbarProps) {
  return (
    <PageScrollInfoProvider>
      <NavbarComponent {...props} />;
    </PageScrollInfoProvider>
  );
}

export { NavbarWrapper as Navbar };
export type { NavbarProps };
