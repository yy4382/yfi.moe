import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

// Comment is source-only: production StyleX compilation belongs to the host app.
// Unit tests exercise behavior with a deliberately inert StyleX runtime.
vi.mock("@stylexjs/stylex", () => ({
  attrs: () => ({}),
  create: <T>(styles: T) => styles,
  defineVars: (values: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        value && typeof value === "object" && "default" in value
          ? (value as { default: unknown }).default
          : value,
      ]),
    ),
  keyframes: () => "test-animation",
  props: () => ({}),
}));

afterEach(() => {
  cleanup();
});

// Mock the ResizeObserver
const ResizeObserverMock = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

beforeAll(() => {
  globalThis.ResizeObserver = ResizeObserverMock;
});
