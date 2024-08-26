import { useState, useEffect } from "react";

type Breakpoints = Record<string, number>;

const useBreakpoints = (breakpoints: Breakpoints) => {
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    // 初始化窗口宽度
    setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const smaller = (breakpoint: keyof Breakpoints): boolean => {
    if (windowWidth === null) return false; // 服务器端渲染时返回false
    return windowWidth < breakpoints[breakpoint];
  };

  const greater = (breakpoint: keyof Breakpoints): boolean => {
    if (windowWidth === null) return false; // 服务器端渲染时返回false
    return windowWidth >= breakpoints[breakpoint];
  };

  return {
    smaller,
    greater,
  };
};

export default useBreakpoints;

export const breakpointsTailwind = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
