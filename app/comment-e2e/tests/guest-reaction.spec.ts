import { expect, test } from "@playwright/test";
import {
  addThumbsUpReaction,
  openCommentFixture,
  postGuestComment,
} from "./comment-fixture";

const anonymousCookie = "anon_key";
const anonymousProjection = "commentAnonymousKey";

test("first guest reaction creates and reuses a browser identity", async ({
  context,
  page,
}) => {
  const path = "/e2e/guest-reaction-first";
  const commentId = await postGuestComment(page, {
    path,
    content: "React to this as a first-time guest",
  });

  expect(
    (await context.cookies()).find((cookie) => cookie.name === anonymousCookie),
  ).toBeUndefined();
  expect(
    await page.evaluate(
      (key) => localStorage.getItem(key),
      anonymousProjection,
    ),
  ).toBeNull();

  await addThumbsUpReaction(page, commentId);

  const cookie = (await context.cookies()).find(
    (candidate) => candidate.name === anonymousCookie,
  );
  expect(cookie?.httpOnly).toBe(true);
  const projectedKey = await page.evaluate(
    (key) => localStorage.getItem(key),
    anonymousProjection,
  );
  expect(projectedKey).toBeTruthy();

  for (const emoji of ["👍", "👍🏻"]) {
    const response = await page.request.post(
      `http://localhost:3101/api/v1/comments/reaction/${commentId}/add`,
      { data: { emoji } },
    );
    expect(response.ok()).toBe(true);
  }

  await openCommentFixture(page, path);
  const selectedReaction = page.getByRole("button", {
    name: /👍.*1/,
    pressed: true,
  });
  await expect(selectedReaction).toBeVisible();

  await selectedReaction.click();
  await expect(page.getByRole("button", { name: /👍/ })).toHaveCount(0);
});

test("a copied public key cannot remove another browser's reaction", async ({
  browser,
  page: victimPage,
}) => {
  const path = "/e2e/guest-reaction-forgery";
  const commentId = await postGuestComment(victimPage, {
    path,
    content: "Victim guest reaction",
  });
  await addThumbsUpReaction(victimPage, commentId);
  const victimProjectedKey = await victimPage.evaluate(
    (key) => localStorage.getItem(key),
    anonymousProjection,
  );
  expect(victimProjectedKey).toBeTruthy();

  const attackerContext = await browser.newContext();
  const attackerPage = await attackerContext.newPage();
  await openCommentFixture(attackerPage, path);
  await attackerPage.evaluate(
    ({ key, value }) => localStorage.setItem(key, value!),
    { key: anonymousProjection, value: victimProjectedKey },
  );
  await attackerPage.reload();

  const forgedSelectedReaction = attackerPage.getByRole("button", {
    name: /👍.*1/,
    pressed: true,
  });
  await expect(forgedSelectedReaction).toBeVisible();
  const removeAttempt = attackerPage.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname ===
        `/api/v1/comments/reaction/${commentId}/remove`,
  );
  await forgedSelectedReaction.click();
  expect((await removeAttempt).status()).toBe(204);
  await expect(forgedSelectedReaction).toBeVisible();

  await attackerPage.reload();
  await expect(
    attackerPage.getByRole("button", { name: /👍.*1/, pressed: true }),
  ).toBeVisible();

  const forgedRequest = await attackerPage.request.post(
    `http://localhost:3101/api/v1/comments/reaction/${commentId}/remove`,
    {
      data: { emoji: "👍", anonymousKey: victimProjectedKey },
      headers: { "x-anonymous-key": victimProjectedKey! },
    },
  );
  expect(forgedRequest.status()).toBe(204);

  await victimPage.reload();
  await expect(
    victimPage.getByRole("button", { name: /👍.*1/, pressed: true }),
  ).toBeVisible();
  await attackerContext.close();
});
