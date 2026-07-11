import { mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const databaseDir = resolve(packageDir, ".tmp");
mkdirSync(databaseDir, { recursive: true });
rmSync(resolve(databaseDir, "comment-e2e.db"), { force: true });
