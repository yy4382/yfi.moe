import { randomUUID } from "node:crypto";
import SparkMd5 from "spark-md5";
import { createGuestIdentityBackend } from "@repo/guest-identity/backend";

/** The single application-level projection policy used by identity and features. */
export const guestIdentityPolicy = createGuestIdentityBackend({
  createRawKey: randomUUID,
  projectRawKey: (rawKey) => SparkMd5.hash(rawKey),
});
