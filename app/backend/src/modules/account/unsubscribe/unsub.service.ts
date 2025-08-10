import crypto from "node:crypto";

export function generateUnsubscribeSignature(
  email: string,
  expiresAtTimestampSec: number,
  secret: string,
) {
  const data = `${email}:${expiresAtTimestampSec}`;
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function generateUnsubscribeUrl(
  email: string,
  secret: string,
  baseUrl: string,
  expireDays: number = 120,
): string {
  const expiresAtTimestampSec =
    Math.floor(Date.now() / 1000) + expireDays * 24 * 60 * 60;
  const signature = generateUnsubscribeSignature(
    email,
    expiresAtTimestampSec,
    secret,
  );

  const params = new URLSearchParams({
    email,
    signature,
    expiresAtTimestampSec: expiresAtTimestampSec.toString(),
  });

  return `${baseUrl}/account/notification?${params.toString()}`;
}

export function verifyUnsubscribeSignature(
  email: string,
  signature: string,
  expiresAtTimestampSec: number,
  now: Date,
  secret: string,
): "expired" | "invalid" | "valid" {
  if (now.getTime() / 1000 > expiresAtTimestampSec) {
    return "expired";
  }

  const expectedSignature = generateUnsubscribeSignature(
    email,
    expiresAtTimestampSec,
    secret,
  );
  return signature === expectedSignature ? "valid" : "invalid";
}
