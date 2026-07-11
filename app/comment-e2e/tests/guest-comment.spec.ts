import { expect, test } from "@playwright/test";
import { postGuestComment } from "./comment-fixture";

test("guest posts a comment through accessible controls", async ({ page }) => {
  await postGuestComment(page, {
    path: "/e2e/guest-comment",
    content: "Accessible end-to-end comment",
  });
  await expect(page.getByText("Accessible end-to-end comment")).toBeVisible();
});
