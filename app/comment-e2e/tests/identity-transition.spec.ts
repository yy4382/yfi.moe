import { expect, test } from "@playwright/test";
import { addThumbsUpReaction, postGuestComment } from "./comment-fixture";
import { signOutViewer, signUpViewer } from "./identity-fixture";

test("sign in retains guest reactions while sign out excludes user-only reactions", async ({
  page,
}) => {
  const path = "/e2e/identity-transition";
  const commentId = await postGuestComment(page, {
    path,
    content: "Current identity transition",
  });
  await addThumbsUpReaction(page, commentId);

  const userName = "Transition User";
  await signUpViewer(page, userName);
  await expect(
    page.getByRole("button", { name: /👍.*1/, pressed: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "添加表情" }).click();
  await page.getByRole("button", { name: "hooray" }).click();
  await expect(
    page.getByRole("button", { name: /🎉.*1/, pressed: true }),
  ).toBeVisible();

  await signOutViewer(page, userName);
  await expect(
    page.getByRole("button", { name: /👍.*1/, pressed: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /🎉.*1/, pressed: false }),
  ).toBeVisible();
});
