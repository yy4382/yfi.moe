import { expect, type BrowserContext, type Page } from "@playwright/test";

const sessionCacheKey = "yfi-session";

export async function signUpViewer(page: Page, name: string) {
  const email = `${name.toLowerCase().replaceAll(" ", "-")}-${Date.now()}@example.com`;
  const response = await page.request.post(
    "http://localhost:3101/api/v1/auth/sign-up/email",
    {
      data: { name, email, password: "comment-e2e-password" },
      headers: { Origin: "http://localhost:3100" },
    },
  );
  expect(response.ok()).toBe(true);

  await page.evaluate((key) => localStorage.removeItem(key), sessionCacheKey);
  await page.reload();
  await expect(page.getByRole("img", { name })).toBeVisible();
}

export async function signOutViewer(page: Page, name: string) {
  await page.getByRole("img", { name }).hover();
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page.getByRole("textbox", { name: "评论内容" })).toBeVisible();
}

export async function clearGuestCookie(context: BrowserContext) {
  await context.clearCookies({ name: "anon_key" });
}

export async function clearGuestProjection(page: Page) {
  await page.evaluate(() => localStorage.removeItem("guestIdentityProjection"));
}
