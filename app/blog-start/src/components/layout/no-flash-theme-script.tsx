const themeScript = `
(() => {
  const el = document.documentElement;
  const backgrounds = {
    light: "oklch(0.9911 0 0)",
    dark: "oklch(0.1822 0 0)",
  };

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function resolveTheme(theme) {
    if (!theme || theme === "system") {
      return getSystemTheme();
    }
    return theme === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    el.dataset.theme = theme;
    el.style.colorScheme = theme;
    el.style.backgroundColor = backgrounds[theme];
  }

  try {
    applyTheme(resolveTheme(localStorage.getItem("theme") || "system"));
  } catch (_) {
    applyTheme(getSystemTheme());
  }
})();
`;

export function NoFlashThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
