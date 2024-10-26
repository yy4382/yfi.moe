import { useEffect, useRef, useState, useMemo } from "react";
import remToPixel from "@utils/remToPixel";
import { tvButton } from "@styles/tv";
import { type NavMenu, navMenu } from "@configs/navbar";
import { siteConfig } from "@configs/site";
import MingcuteSearch3Line from "~icons/mingcute/search-3-line";
import NavbarMobile from "./NavBarMobile";

const DEFAULT_NAV_TOP_MARGIN = 1; // in rem

interface NavbarWrapperProps {
  children: React.ReactNode;
}

const NavbarWrapper: React.FC<NavbarWrapperProps> = ({ children }) => {
  const navRef = useRef<HTMLElement>(null);
  const [height, setHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const isFixed = scrollY >= remToPixel(DEFAULT_NAV_TOP_MARGIN);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update element height
  useEffect(() => {
    if (navRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(navRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Set CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--navbar-height",
      `${height}px`,
    );
  }, [height]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--navbar-top-margin",
      isFixed ? "0rem" : `${DEFAULT_NAV_TOP_MARGIN}rem`,
    );
  }, [isFixed]);

  return (
    <nav ref={navRef} className="sticky top-0 z-20 h-16 min-h-16 w-full">
      <div
        className={`absolute inset-y-0 left-1/2 h-full -translate-x-1/2 transform-gpu text-heading shadow backdrop-blur-lg ${isFixed ? "w-screen" : "w-full"} ${isFixed ? "bg-card/80" : "bg-card"} ${isFixed ? "rounded-none" : "rounded-card"} ${isFixed ? "transition-expand" : "transition-shrink"} `}
        style={{ viewTransitionName: "navbar" }}
      >
        {children}
      </div>
    </nav>
  );
};

interface NavbarProps {
  navStats?: NavMenu | string;
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ navStats, children }) => {
  const highlight = useMemo(() => {
    if (navStats === undefined) return navMenu.length - 1;
    if (typeof navStats === "string")
      return navMenu.findIndex((item) => item.text === navStats);
    return navMenu.findIndex(
      (item) => item.text === (navStats as NavMenu).text,
    );
  }, [navStats]);

  return (
    <NavbarWrapper>
      <div className="mx-auto grid size-full grid-cols-[1fr_auto_1fr] grid-rows-1 content-center items-center px-3 py-2 sm:px-4">
        <div className="h-8 justify-self-start md:hidden">
          <NavbarMobile />
        </div>
        <div className="justify-self-center md:justify-self-start">
          <a className="flex items-center text-xl" href="/">
            {children}
            <span className="ml-3 hidden md:inline">{siteConfig.title}</span>
          </a>
        </div>
        <div className="hidden h-full items-center space-x-1 justify-self-center md:flex">
          {navMenu.map((item, index) => {
            const Icon = item.iconSvg; // Assuming the icon prop name changed from vueIcon to icon
            return (
              <a
                key={item.text}
                href={item.link}
                className={`flex h-full w-20 font-medium center ${
                  highlight === index ? "text-primary" : "text-heading"
                } ${tvButton()}`}
              >
                <span className="z-1 inline-flex select-none items-center gap-1 self-center align-middle">
                  {highlight === index && Icon && <Icon />}
                  <span
                    style={{
                      viewTransitionName: `nav-item-text-${item.text}`,
                    }}
                  >
                    {item.text}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
        <div className="flex h-fit gap-4 justify-self-end">
          {/* <ColorSelectPopover /> */}
          <a href="/search" aria-label="Search Button" className="size-6">
            <MingcuteSearch3Line className="size-6" />
          </a>
        </div>
      </div>
    </NavbarWrapper>
  );
};

export default Navbar;
