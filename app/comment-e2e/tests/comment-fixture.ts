import { expect, type Page } from "@playwright/test";

type AddedCommentResponse = {
  data: { id: number };
};

export async function openCommentFixture(page: Page, path: string) {
  await page.goto(`/?path=${encodeURIComponent(path)}`);
}

export async function postGuestComment(
  page: Page,
  options: { path: string; content: string },
) {
  await openCommentFixture(page, options.path);
  await page.getByRole("button", { name: "以游客身份留言" }).click();
  await page.getByRole("textbox", { name: "昵称" }).fill("E2E Guest");
  await page.getByRole("textbox", { name: "邮箱" }).fill("guest@example.com");
  await page.getByRole("textbox", { name: "评论内容" }).fill(options.content);

  const added = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/api/v1/comments/add",
  );
  await page.getByRole("button", { name: "发送评论" }).click();
  const response = await added;
  expect(response.ok()).toBe(true);
  await expect(page.getByText(options.content)).toBeVisible();

  return ((await response.json()) as AddedCommentResponse).data.id;
}

export async function addThumbsUpReaction(page: Page, commentId: number) {
  const added = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname ===
        `/api/v1/comments/reaction/${commentId}/add`,
  );
  await page.getByRole("button", { name: "添加表情" }).click();
  await page.getByRole("button", { name: "thumbs up" }).click();
  const response = await added;
  expect(response.ok()).toBe(true);
  await expect(
    page.getByRole("button", { name: /👍.*1/, pressed: true }),
  ).toBeVisible();
}
