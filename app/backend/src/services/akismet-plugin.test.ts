/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi } from "vitest";

// Mock the akismet service
vi.mock("./akismet.js", () => ({
  AkismetService: vi.fn(),
}));

// Mock environment variables
const mockEnv = {
  AKISMET_KEY: "test-key",
  AKISMET_BLOG: "test-blog",
  FRONTEND_URL: "http://localhost:3000",
};

vi.mock("@/env.js", () => ({
  env: mockEnv,
}));

describe("akismetPlugin", () => {
  it("should enable test mode when FRONTEND_URL contains localhost", async () => {
    const { AkismetService } = await import("./akismet.js");
    const { akismetPlugin } = await import("./akismet-plugin.js");

    const mockContext = {
      set: vi.fn(),
    };
    const mockNext = vi.fn();

    await akismetPlugin(mockContext as any, mockNext);

    expect(AkismetService).toHaveBeenCalledWith({
      key: "test-key",
      blog: "test-blog",
      isTest: true,
    });
    expect(mockContext.set).toHaveBeenCalledWith("akismet", expect.any(Object));
    expect(mockNext).toHaveBeenCalled();
  });

  it("should disable test mode when FRONTEND_URL is production domain", async () => {
    // Update mock env for production URL
    mockEnv.FRONTEND_URL = "https://myblog.com";

    const { AkismetService } = await import("./akismet.js");
    const { akismetPlugin } = await import("./akismet-plugin.js");

    vi.clearAllMocks();

    const mockContext = {
      set: vi.fn(),
    };
    const mockNext = vi.fn();

    await akismetPlugin(mockContext as any, mockNext);

    expect(AkismetService).toHaveBeenCalledWith({
      key: "test-key",
      blog: "test-blog",
      isTest: false,
    });
  });

  it("should handle 127.0.0.1 as localhost", async () => {
    // Update mock env for 127.0.0.1
    mockEnv.FRONTEND_URL = "http://127.0.0.1:3000";

    const { AkismetService } = await import("./akismet.js");
    const { akismetPlugin } = await import("./akismet-plugin.js");

    vi.clearAllMocks();

    const mockContext = {
      set: vi.fn(),
    };
    const mockNext = vi.fn();

    await akismetPlugin(mockContext as any, mockNext);

    expect(AkismetService).toHaveBeenCalledWith({
      key: "test-key",
      blog: "test-blog",
      isTest: true,
    });
  });

  it("should set akismet to null when credentials are missing", async () => {
    // Remove credentials from mock env
    const originalKey = mockEnv.AKISMET_KEY;
    mockEnv.AKISMET_KEY = "";

    const { akismetPlugin } = await import("./akismet-plugin.js");

    vi.clearAllMocks();

    const mockContext = {
      set: vi.fn(),
    };
    const mockNext = vi.fn();

    await akismetPlugin(mockContext as any, mockNext);

    expect(mockContext.set).toHaveBeenCalledWith("akismet", null);

    // Restore original key
    mockEnv.AKISMET_KEY = originalKey;
  });
});
