import { primaryHue } from "@configs/site";

export function getDefaultHue(): number {
  return primaryHue;
}

export function getHue(): number {
  if (typeof window === "undefined") {
    return getDefaultHue();
  }
  const stored = localStorage.getItem("style:primary-hue");
  return stored ? parseInt(stored) : getDefaultHue();
}

export function setHue(hue: number): void {
  localStorage.setItem("style:primary-hue", String(hue));
  document.documentElement.style.setProperty("--primary-hue", String(hue));
}
