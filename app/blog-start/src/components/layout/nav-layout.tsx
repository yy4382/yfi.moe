import type { PropsWithChildren } from "react";
import logo from "@/assets/logo.png";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/nav";

type NavLayoutProps = PropsWithChildren<{
  postInfo?: {
    title: string;
    tags: string[];
  };
}>;

export function NavLayout({ postInfo, children }: NavLayoutProps) {
  return (
    <div className="m-0 bg-background bg-fixed p-0 text-content">
      <div className="grid min-h-[100lvh] grid-rows-[var(--navbar-height)_auto_1fr_auto]">
        <Navbar postInfo={postInfo}>
          <img src={logo} alt="logo" className="h-8 w-8 rounded-lg" />
        </Navbar>
        <main className="w-full">{children}</main>
        <section className="bg-grid h-full min-h-12 border-b border-container" />
        <Footer />
      </div>
    </div>
  );
}
