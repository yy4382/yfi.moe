import { expect, test } from "@playwright/test";
import { postGuestComment } from "./comment-fixture";
import { signUpViewer } from "./identity-fixture";

test.describe("guest comment ownership refactor contract", () => {
  test("same-browser guest edits and deletes their comment", async ({
    page,
  }) => {
    const original = "Guest-owned editable comment";
    await postGuestComment(page, {
      path: "/e2e/refactor-guest-comment-owner",
      content: original,
    });

    const article = page.getByRole("article", { name: new RegExp(original) });
    await article.getByRole("button", { name: "更多评论操作" }).click();
    await page.getByRole("menuitem", { name: "编辑" }).click();
    await article
      .getByRole("textbox", { name: "评论内容" })
      .fill("Guest-edited comment");
    await article.getByRole("button", { name: "保存评论" }).click();
    await expect(page.getByText("Guest-edited comment")).toBeVisible();

    const edited = page.getByRole("article", { name: /Guest-edited comment/ });
    await edited.getByRole("button", { name: "更多评论操作" }).click();
    await page.getByRole("menuitem", { name: "删除" }).click();
    await expect(page.getByText("Guest-edited comment")).toHaveCount(0);
  });

  test("signing in preserves controls for the browser's earlier guest comment", async ({
    page,
  }) => {
    const content = "Guest comment retained after sign in";
    await postGuestComment(page, {
      path: "/e2e/refactor-guest-comment-sign-in",
      content,
    });
    await signUpViewer(page, "Later Signed-in Guest");

    const article = page.getByRole("article", { name: new RegExp(content) });
    await expect(
      article.getByRole("button", { name: "更多评论操作" }),
    ).toBeVisible();
  });

  test("another browser cannot modify a guest-owned comment", async ({
    browser,
    page: ownerPage,
  }) => {
    const content = "Cross-browser protected guest comment";
    const commentId = await postGuestComment(ownerPage, {
      path: "/e2e/refactor-guest-comment-other-browser",
      content,
    });

    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    await otherPage.goto(
      "/?path=%2Fe2e%2Frefactor-guest-comment-other-browser",
    );
    const article = otherPage.getByRole("article", {
      name: new RegExp(content),
    });
    await expect(
      article.getByRole("button", { name: "更多评论操作" }),
    ).toHaveCount(0);

    const update = await otherPage.request.post(
      "http://localhost:3101/api/v1/comments/update",
      { data: { id: commentId, rawContent: "Cross-browser attack" } },
    );
    expect([401, 403, 404]).toContain(update.status());
    const deletion = await otherPage.request.post(
      "http://localhost:3101/api/v1/comments/delete",
      { data: { id: commentId } },
    );
    expect([401, 403, 404]).toContain(deletion.status());
    await otherContext.close();
  });
});
