import { describe, it, expect, vi, beforeEach } from "vitest";
import { AkismetService } from "./akismet.js";

// Mock the akismet-api module
const mockAkismetInstance = vi.hoisted(() => {
  return {
    checkSpam: vi.fn(),
    submitSpam: vi.fn(),
    submitHam: vi.fn(),
  };
});

vi.mock("akismet-api", () => ({
  AkismetClient: vi.fn(
    class {
      checkSpam = mockAkismetInstance.checkSpam;
      submitSpam = mockAkismetInstance.submitSpam;
      submitHam = mockAkismetInstance.submitHam;
    },
  ),
}));

vi.mock("@/logger.js", async () => {
  const { pino } = await import("pino");
  return {
    logger: pino({
      transport: {
        targets: [],
      },
    }),
  };
});

describe("AkismetService", () => {
  let akismetService: AkismetService;

  beforeEach(() => {
    vi.clearAllMocks();

    akismetService = new AkismetService({
      key: "test-key",
      blog: "https://example.com",
      isTest: true,
    });
  });

  describe("test mode configuration", () => {
    it("should set isTest to false when not in test mode", async () => {
      const prodService = new AkismetService({
        key: "prod-key",
        blog: "https://example.com",
        isTest: false,
      });

      mockAkismetInstance.checkSpam.mockResolvedValue(false);

      await prodService.checkSpam({
        content: "Content",
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        permalink: "https://example.com/post",
      });

      expect(mockAkismetInstance.checkSpam).toHaveBeenCalledWith({
        content: "Content",
        ip: "192.168.1.1",
        useragent: "Mozilla/5.0",
        permalink: "https://example.com/post",
        is_test: false,
      });
    });

    it("should default to non-test mode when isTest is not specified", async () => {
      const defaultService = new AkismetService({
        key: "default-key",
        blog: "https://example.com",
      });

      mockAkismetInstance.checkSpam.mockResolvedValue(false);

      await defaultService.checkSpam({
        content: "Content",
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        permalink: "https://example.com/post",
      });

      expect(mockAkismetInstance.checkSpam).toHaveBeenCalledWith({
        content: "Content",
        ip: "192.168.1.1",
        useragent: "Mozilla/5.0",
        permalink: "https://example.com/post",
        is_test: false,
      });
    });
  });

  describe("checkSpam", () => {
    it("should return true when Akismet detects spam", async () => {
      mockAkismetInstance.checkSpam.mockResolvedValue(true);

      const result = await akismetService.checkSpam({
        content: "Spam content",
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        author: "Spammer",
        authorEmail: "spam@example.com",
        permalink: "https://example.com/post",
      });

      expect(result).toBe(true);
      expect(mockAkismetInstance.checkSpam).toHaveBeenCalledWith({
        content: "Spam content",
        ip: "192.168.1.1",
        useragent: "Mozilla/5.0",
        name: "Spammer",
        email: "spam@example.com",
        permalink: "https://example.com/post",
        is_test: true,
      });
    });

    it("should return false when Akismet detects ham", async () => {
      mockAkismetInstance.checkSpam.mockResolvedValue(false);

      const result = await akismetService.checkSpam({
        content: "Legitimate content",
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        author: "Real User",
        authorEmail: "user@example.com",
        permalink: "https://example.com/post",
      });

      expect(result).toBe(false);
    });

    it("should handle missing optional parameters", async () => {
      mockAkismetInstance.checkSpam.mockResolvedValue(false);

      const result = await akismetService.checkSpam({
        content: "Content without author info",
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        permalink: "https://example.com/post",
      });

      expect(result).toBe(false);
      expect(mockAkismetInstance.checkSpam).toHaveBeenCalledWith({
        content: "Content without author info",
        ip: "192.168.1.1",
        useragent: "Mozilla/5.0",
        name: undefined,
        email: undefined,
        permalink: "https://example.com/post",
        is_test: true,
      });
    });

    it("should return false when Akismet throws an error", async () => {
      mockAkismetInstance.checkSpam.mockRejectedValue(
        new Error("Akismet error"),
      );

      const result = await akismetService.checkSpam({
        content: "Content",
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        permalink: "https://example.com/post",
      });

      expect(result).toBe(false);
    });
  });

  describe("submitSpam", () => {
    it("should submit spam to Akismet", async () => {
      mockAkismetInstance.submitSpam.mockResolvedValue(undefined);

      await akismetService.submitSpam({
        content: "Spam content",
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        author: "Spammer",
        authorEmail: "spam@example.com",
        permalink: "https://example.com/post",
      });

      expect(mockAkismetInstance.submitSpam).toHaveBeenCalledWith({
        content: "Spam content",
        ip: "192.168.1.1",
        useragent: "Mozilla/5.0",
        name: "Spammer",
        email: "spam@example.com",
        permalink: "https://example.com/post",
        is_test: true,
      });
    });

    it("should handle errors gracefully", async () => {
      mockAkismetInstance.submitSpam.mockRejectedValue(
        new Error("Akismet error"),
      );

      await expect(
        akismetService.submitSpam({
          content: "Content",
          userIp: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          permalink: "https://example.com/post",
        }),
      ).resolves.not.toThrow();
    });
  });

  describe("submitHam", () => {
    it("should submit ham to Akismet", async () => {
      mockAkismetInstance.submitHam.mockResolvedValue(undefined);

      await akismetService.submitHam({
        content: "Ham content",
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        author: "Real User",
        authorEmail: "user@example.com",
        permalink: "https://example.com/post",
      });

      expect(mockAkismetInstance.submitHam).toHaveBeenCalledWith({
        content: "Ham content",
        ip: "192.168.1.1",
        useragent: "Mozilla/5.0",
        name: "Real User",
        email: "user@example.com",
        permalink: "https://example.com/post",
        is_test: true,
      });
    });

    it("should handle errors gracefully", async () => {
      mockAkismetInstance.submitHam.mockRejectedValue(
        new Error("Akismet error"),
      );

      await expect(
        akismetService.submitHam({
          content: "Content",
          userIp: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          permalink: "https://example.com/post",
        }),
      ).resolves.not.toThrow();
    });
  });
});
