import { expect, test, type Page } from "@playwright/test";
import { openCommentFixture, postGuestComment } from "./comment-fixture";
import { signUpViewer } from "./identity-fixture";

async function postSignedInComment(
  page: Page,
  options: { path: string; content: string; userName: string },
) {
  await openCommentFixture(page, options.path);
  await signUpViewer(page, options.userName);
  await page.getByRole("textbox", { name: "评论内容" }).fill(options.content);
  const added = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/api/v1/comments/add",
  );
  await page.getByRole("button", { name: "发送评论" }).click();
  const response = await added;
  expect(response.ok()).toBe(true);
  return ((await response.json()) as { data: { id: number } }).data.id;
}

test("signed-in author edits and deletes a comment through accessible actions", async ({
  page,
}) => {
  const original = "Signed-in comment to edit";
  await postSignedInComment(page, {
    path: "/e2e/signed-in-comment-ownership",
    content: original,
    userName: "Comment Owner",
  });

  const article = page.getByRole("article", { name: new RegExp(original) });
  await article.getByRole("button", { name: "更多评论操作" }).click();
  await page.getByRole("menuitem", { name: "编辑" }).click();
  await article
    .getByRole("textbox", { name: "评论内容" })
    .fill("Edited signed-in comment");
  await article.getByRole("button", { name: "保存评论" }).click();
  await expect(page.getByText("Edited signed-in comment")).toBeVisible();

  const editedArticle = page.getByRole("article", {
    name: /Edited signed-in comment/,
  });
  await editedArticle.getByRole("button", { name: "更多评论操作" }).click();
  await page.getByRole("menuitem", { name: "删除" }).click();
  await expect(page.getByText("Edited signed-in comment")).toHaveCount(0);
});

test("guest replies through controls scoped to the parent comment", async ({
  page,
}) => {
  const parentContent = "Guest parent comment";
  await postGuestComment(page, {
    path: "/e2e/guest-reply",
    content: parentContent,
  });

  const parent = page.getByRole("article", {
    name: new RegExp(parentContent),
  });
  await parent.getByRole("button", { name: "回复" }).click();
  await parent
    .getByRole("textbox", { name: "评论内容" })
    .fill("Guest child reply");
  await parent.getByRole("button", { name: "发送评论" }).click();
  await expect(page.getByText("Guest child reply")).toBeVisible();
});

test("another viewer cannot see controls or mutate a signed-in comment", async ({
  browser,
  page: ownerPage,
}) => {
  const path = "/e2e/comment-unauthorized";
  const content = "User-owned comment";
  const commentId = await postSignedInComment(ownerPage, {
    path,
    content,
    userName: "Protected Owner",
  });

  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await openCommentFixture(otherPage, path);
  const article = otherPage.getByRole("article", {
    name: new RegExp(content),
  });
  await expect(
    article.getByRole("button", { name: "更多评论操作" }),
  ).toHaveCount(0);

  const update = await otherPage.request.post(
    "http://localhost:3101/api/v1/comments/update",
    { data: { id: commentId, rawContent: "Attacker edit" } },
  );
  expect(update.status()).toBe(401);
  const deletion = await otherPage.request.post(
    "http://localhost:3101/api/v1/comments/delete",
    { data: { id: commentId } },
  );
  expect(deletion.status()).toBe(401);

  await ownerPage.reload();
  await expect(ownerPage.getByText(content)).toBeVisible();
  await otherContext.close();
});
