import { useEffect, useState } from "react";

export function usePathname() {
  const [pathname, setPathname] = useState(
    typeof window !== "undefined" ? window.location.pathname : "",
  );
  useEffect(() => {
    const handlePopState = () => {
      setPathname(window?.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  return pathname;
}
