import { expect, test } from "@playwright/test";
import { addThumbsUpReaction, postGuestComment } from "./comment-fixture";
import {
  clearGuestCookie,
  clearGuestProjection,
  signOutViewer,
  signUpViewer,
} from "./identity-fixture";

test.describe("Guest Identity refactor contract", () => {
  test("a signed-in retry keeps the original guest reaction through sign out", async ({
    page,
  }) => {
    const commentId = await postGuestComment(page, {
      path: "/e2e/refactor-sign-in-inheritance",
      content: "Retain this guest reaction after sign in",
    });
    await addThumbsUpReaction(page, commentId);

    const userName = "Inherited Guest User";
    await signUpViewer(page, userName);
    const inheritedReaction = page.getByRole("button", {
      name: /👍.*1/,
      pressed: true,
    });
    await expect(inheritedReaction).toBeVisible();

    const userAdd = await page.request.post(
      `http://localhost:3101/api/v1/comments/reaction/${commentId}/add`,
      { data: { emoji: "👍" } },
    );
    expect(userAdd.ok()).toBe(true);
    await page.reload();
    await expect(
      page.getByRole("button", { name: /👍.*1/, pressed: true }),
    ).toBeVisible();

    await signOutViewer(page, userName);
    await expect(
      page.getByRole("button", { name: /👍.*1/, pressed: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: /👍.*1/, pressed: true }).click();
    await expect(page.getByRole("button", { name: /👍/ })).toHaveCount(0);
  });

  test("a server-confirmed cookie silently restores a missing projection", async ({
    page,
  }) => {
    const commentId = await postGuestComment(page, {
      path: "/e2e/refactor-restore-projection",
      content: "Restore my guest projection",
    });
    await addThumbsUpReaction(page, commentId);
    await clearGuestProjection(page);
    await page.reload();

    await expect(
      page.getByRole("button", { name: /👍.*1/, pressed: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() =>
        localStorage.getItem("guestIdentityProjection"),
      ),
    ).toBeTruthy();
  });

  test("a server-confirmed missing cookie silently clears a stale projection", async ({
    context,
    page,
  }) => {
    const commentId = await postGuestComment(page, {
      path: "/e2e/refactor-clear-stale-projection",
      content: "Do not retain stale guest ownership",
    });
    await addThumbsUpReaction(page, commentId);
    await clearGuestCookie(context);
    await page.reload();

    await expect(
      page.getByRole("button", { name: /👍.*1/, pressed: false }),
    ).toBeVisible();
    expect(
      await page.evaluate(() =>
        localStorage.getItem("guestIdentityProjection"),
      ),
    ).toBeNull();
  });

  test("missing identity confirmation fails closed without claiming guest resources", async ({
    page,
  }) => {
    const commentId = await postGuestComment(page, {
      path: "/e2e/refactor-fail-closed",
      content: "Fail closed when identity metadata is missing",
    });
    await addThumbsUpReaction(page, commentId);

    await page.route(/\/api\/v1\/comments\/get$/, async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      const headers = response.headers();
      delete headers["x-guest-identity"];
      delete headers["x-guest-identity-state"];
      await route.fulfill({ response, headers });
    });
    await page.reload();

    await expect(
      page.getByRole("button", { name: /👍.*1/, pressed: false }),
    ).toBeVisible();
  });
});
