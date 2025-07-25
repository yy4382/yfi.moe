"use client";

// modified from next-themes, by ChatGPT o3, only keep a core subset of original functionality

/*
MIT License

Copyright (c) 2022 Paco Coursey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type Theme = "light" | "dark";
interface Props {
  /** Also update <html style="color-scheme: …">. Default: true */
  enableColorScheme?: boolean;
  /** CSP nonce forwarded to the inline <script> */
  nonce?: string;
  scriptProps?: React.ComponentProps<"script">;
  children: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* Hook / Context                                                     */
/* ------------------------------------------------------------------ */
const ThemeContext = React.createContext<Theme>("light");
export const useTheme = () => React.useContext(ThemeContext);

/* ------------------------------------------------------------------ */
/* Implementation                                                     */
/* ------------------------------------------------------------------ */
const MEDIA = "(prefers-color-scheme: dark)";

export const ThemeProvider = ({
  enableColorScheme = true,
  nonce,
  scriptProps,
  children,
}: Props) => {
  // Initial value comes from the OS preference (prevents first‑paint flash)
  const [theme, setTheme] = React.useState<Theme>(() =>
    typeof window !== "undefined" && window.matchMedia(MEDIA).matches
      ? "dark"
      : "light",
  );

  // Watch OS preference changes
  React.useEffect(() => {
    const mql = window.matchMedia(MEDIA);
    const apply = (e: MediaQueryList | MediaQueryListEvent) =>
      setTheme(e.matches ? "dark" : "light");

    // addListener / removeListener for legacy iOS & old browsers
    mql.addListener(apply);
    apply(mql); // Sync immediately
    return () => mql.removeListener(apply);
  }, []);

  // Write the result onto <html>
  React.useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", theme === "dark");
    if (enableColorScheme) {
      html.style.colorScheme = theme;
    }
  }, [theme, enableColorScheme]);

  return (
    <ThemeContext.Provider value={theme}>
      <InitScript
        enableColorScheme={enableColorScheme}
        nonce={nonce}
        scriptProps={scriptProps}
      />
      {children}
    </ThemeContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* Inline script executed before hydration to avoid FOUC              */
/* ------------------------------------------------------------------ */
const InitScript = ({
  enableColorScheme,
  nonce,
  scriptProps,
}: {
  enableColorScheme: boolean;
  nonce?: string;
  scriptProps?: React.ComponentProps<"script">;
}) => {
  // Plain JS function that will be stringified and inlined
  const fn = function (enableCS: boolean) {
    try {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const html = document.documentElement;
      html.classList.toggle("dark", dark);
      if (enableCS) {
        // eslint-disable-next-line react-hooks-rc/react-compiler
        html.style.colorScheme = dark ? "dark" : "light";
      }
    } catch {}
  };

  return (
    <script
      {...scriptProps}
      suppressHydrationWarning
      nonce={typeof window === "undefined" ? nonce : undefined}
      dangerouslySetInnerHTML={{
        __html: `(${fn.toString()})(${enableColorScheme})`,
      }}
    />
  );
};
