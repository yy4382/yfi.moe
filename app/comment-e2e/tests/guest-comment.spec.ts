import { expect, test } from "@playwright/test";

test("guest posts a comment through accessible controls", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "以游客身份留言" }).click();
  await page.getByRole("textbox", { name: "昵称" }).fill("E2E Guest");
  await page.getByRole("textbox", { name: "邮箱" }).fill("guest@example.com");
  await page
    .getByRole("textbox", { name: "评论内容" })
    .fill("Accessible end-to-end comment");
  await page.getByRole("button", { name: "发送评论" }).click();

  await expect(page.getByText("Accessible end-to-end comment")).toBeVisible();
});
