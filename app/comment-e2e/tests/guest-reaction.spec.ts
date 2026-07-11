import { expect, test } from "@playwright/test";
import {
  addThumbsUpReaction,
  openCommentFixture,
  postGuestComment,
} from "./comment-fixture";

const anonymousCookie = "anon_key";
const guestProjection = "guestIdentityProjection";

test("a first guest reaction creates and then reuses a browser identity", async ({
  browser,
  context,
  page,
}) => {
  const path = "/e2e/guest-reaction-first";
  const seedContext = await browser.newContext();
  const seedPage = await seedContext.newPage();
  const commentId = await postGuestComment(seedPage, {
    path,
    content: "React to this as a first-time guest",
  });
  await seedContext.close();
  await openCommentFixture(page, path);

  expect(
    (await context.cookies()).find((cookie) => cookie.name === anonymousCookie),
  ).toBeUndefined();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), guestProjection),
  ).toBeNull();

  await addThumbsUpReaction(page, commentId);

  const initialCookie = (await context.cookies()).find(
    (cookie) => cookie.name === anonymousCookie,
  );
  expect(initialCookie?.httpOnly).toBe(true);
  const initialProjectedKey = await page.evaluate(
    (key) => localStorage.getItem(key),
    guestProjection,
  );
  expect(initialProjectedKey).toBeTruthy();

  const cookie = (await context.cookies()).find(
    (candidate) => candidate.name === anonymousCookie,
  );
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.value).toBe(initialCookie?.value);
  const projectedKey = await page.evaluate(
    (key) => localStorage.getItem(key),
    guestProjection,
  );
  expect(projectedKey).toBe(initialProjectedKey);

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
    guestProjection,
  );
  expect(victimProjectedKey).toBeTruthy();

  const attackerContext = await browser.newContext();
  const attackerPage = await attackerContext.newPage();
  await openCommentFixture(attackerPage, path);
  await attackerPage.evaluate(
    ({ key, value }) => localStorage.setItem(key, value!),
    { key: guestProjection, value: victimProjectedKey },
  );
  await attackerPage.reload();

  const forgedReaction = attackerPage.getByRole("button", {
    name: /👍.*1/,
    pressed: false,
  });
  await expect(forgedReaction).toBeVisible();

  const forgedRequest = await attackerPage.request.post(
    `http://localhost:3101/api/v1/comments/reaction/${commentId}/remove`,
    {
      data: { emoji: "👍", guestKey: victimProjectedKey },
      headers: { "x-guest-identity": victimProjectedKey! },
    },
  );
  expect(forgedRequest.status()).toBe(204);
  await attackerPage.reload();
  await expect(
    attackerPage.getByRole("button", { name: /👍.*1/, pressed: false }),
  ).toBeVisible();

  await victimPage.reload();
  await expect(
    victimPage.getByRole("button", { name: /👍.*1/, pressed: true }),
  ).toBeVisible();
  await attackerContext.close();
});
