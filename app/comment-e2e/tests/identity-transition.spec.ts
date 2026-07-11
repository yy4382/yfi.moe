import { expect, test } from "@playwright/test";
import { addThumbsUpReaction, postGuestComment } from "./comment-fixture";
import { signOutViewer, signUpViewer } from "./identity-fixture";

test("current reaction identities remain separate across sign in and sign out", async ({
  page,
}) => {
  const path = "/e2e/current-identity-transition";
  const commentId = await postGuestComment(page, {
    path,
    content: "Current identity transition",
  });
  await addThumbsUpReaction(page, commentId);

  const userName = "Transition User";
  await signUpViewer(page, userName);
  await expect(
    page.getByRole("button", { name: /👍.*1/, pressed: false }),
  ).toBeVisible();

  await page.getByRole("button", { name: /👍.*1/, pressed: false }).click();
  await expect(
    page.getByRole("button", { name: /👍.*2/, pressed: true }),
  ).toBeVisible();

  await signOutViewer(page, userName);
  await expect(
    page.getByRole("button", { name: /👍.*2/, pressed: true }),
  ).toBeVisible();
});
