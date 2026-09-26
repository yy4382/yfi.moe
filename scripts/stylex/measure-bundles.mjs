#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  constants as zlibConstants,
  brotliCompressSync,
  gzipSync,
} from "node:zlib";

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const defaultRepositoryRoot = resolve(scriptDirectory, "../..");
const snapshotDirectory = "artifacts.local/stylex";
const snapshotNames = new Set(["before", "after"]);
const documentExtensions = new Set([".html", ".htm", ".xml", ".xsl", ".txt"]);

const targets = [
  { name: "blogAstro", directory: "app/blog-astro/dist" },
  { name: "commentLibrary", directory: "lib/comment/dist" },
];

const args = process.argv.slice(2);
const command = args[0];
const repositoryRoot = resolve(
  readOption(args.slice(1), "--repo-root") ?? defaultRepositoryRoot,
);

if (!snapshotNames.has(command) && command !== "compare") {
  fail(
    "Usage: node scripts/stylex/measure-bundles.mjs <before|after|compare> [--repo-root PATH]",
  );
}

if (command === "compare") {
  const comparison = await compareSnapshots(repositoryRoot);
  process.stdout.write(`${JSON.stringify(comparison, null, 2)}\n`);
} else {
  const snapshot = await createSnapshot(command, repositoryRoot);
  const outputPath = resolve(
    repositoryRoot,
    snapshotDirectory,
    `${command}-bundles.json`,
  );
  await mkdir(resolve(repositoryRoot, snapshotDirectory), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  process.stdout.write(
    `${JSON.stringify({ outputPath, summary: snapshot.totals }, null, 2)}\n`,
  );
}

async function createSnapshot(label, root) {
  const measuredTargets = {};

  for (const target of targets) {
    measuredTargets[target.name] = await measureTarget(root, target);
  }

  const lockfilePath = resolve(root, "pnpm-lock.yaml");
  let lockfileSha256 = null;
  try {
    lockfileSha256 = sha256(await readFile(lockfilePath));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  return {
    schemaVersion: 1,
    label,
    generatedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
      lockfileSha256,
    },
    compression: {
      gzipLevel: 9,
      brotliQuality: 11,
    },
    exclusions: ["**/*.map"],
    targets: measuredTargets,
    totals: combineTargetTotals(Object.values(measuredTargets)),
  };
}

async function measureTarget(root, target) {
  const absoluteDirectory = resolve(root, target.directory);
  const targetStat = await stat(absoluteDirectory).catch((error) => {
    if (error?.code === "ENOENT") {
      throw new Error(
        `Missing build directory: ${target.directory}. Run the equivalent production build first.`,
      );
    }
    throw error;
  });

  if (!targetStat.isDirectory()) {
    throw new Error(`Build target is not a directory: ${target.directory}`);
  }

  const paths = await listFiles(absoluteDirectory);
  const includedPaths = paths.filter((path) => !path.endsWith(".map"));
  if (includedPaths.length === 0) {
    throw new Error(
      `Build directory has no measurable files: ${target.directory}`,
    );
  }

  const files = [];
  for (const absolutePath of includedPaths) {
    const buffer = await readFile(absolutePath);
    const path = toPosix(relative(absoluteDirectory, absolutePath));
    const type = classifyFile(path);
    files.push({
      path,
      type,
      resource: type !== "nonResource",
      sha256: sha256(buffer),
      bytes: measureBuffer(buffer),
    });
  }
  files.sort((left, right) => left.path.localeCompare(right.path));

  return {
    directory: target.directory,
    files,
    totals: totalFiles(files),
  };
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await listFiles(path)));
    } else if (entry.isFile()) {
      paths.push(path);
    }
  }

  return paths;
}

function classifyFile(path) {
  const extension = extname(path).toLowerCase();
  if (extension === ".css") return "css";
  if ([".js", ".mjs", ".cjs"].includes(extension)) return "javascript";
  if (documentExtensions.has(extension)) return "nonResource";
  return "resource";
}

function measureBuffer(buffer) {
  return {
    raw: buffer.byteLength,
    gzip: gzipSync(buffer, { level: 9 }).byteLength,
    brotli: brotliCompressSync(buffer, {
      params: {
        [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
      },
    }).byteLength,
  };
}

function emptyTotal() {
  return { fileCount: 0, raw: 0, gzip: 0, brotli: 0 };
}

function addFile(total, file) {
  total.fileCount += 1;
  total.raw += file.bytes.raw;
  total.gzip += file.bytes.gzip;
  total.brotli += file.bytes.brotli;
}

function addTotal(total, addition) {
  total.fileCount += addition.fileCount;
  total.raw += addition.raw;
  total.gzip += addition.gzip;
  total.brotli += addition.brotli;
}

function totalFiles(files) {
  const totals = {
    css: emptyTotal(),
    javascript: emptyTotal(),
    resources: emptyTotal(),
    nonResources: emptyTotal(),
    all: emptyTotal(),
  };

  for (const file of files) {
    if (file.type === "css") addFile(totals.css, file);
    if (file.type === "javascript") addFile(totals.javascript, file);
    addFile(file.resource ? totals.resources : totals.nonResources, file);
    addFile(totals.all, file);
  }

  return totals;
}

function combineTargetTotals(measuredTargets) {
  const totals = {
    css: emptyTotal(),
    javascript: emptyTotal(),
    resources: emptyTotal(),
    nonResources: emptyTotal(),
    all: emptyTotal(),
  };

  for (const target of measuredTargets) {
    for (const category of Object.keys(totals)) {
      addTotal(totals[category], target.totals[category]);
    }
  }

  return totals;
}

async function compareSnapshots(root) {
  const beforePath = resolve(root, snapshotDirectory, "before-bundles.json");
  const afterPath = resolve(root, snapshotDirectory, "after-bundles.json");
  const before = await readSnapshot(beforePath, "before");
  const after = await readSnapshot(afterPath, "after");

  const targetNames = new Set([
    ...Object.keys(before.targets),
    ...Object.keys(after.targets),
  ]);
  const comparedTargets = {};
  for (const targetName of [...targetNames].sort()) {
    const beforeTarget = before.targets[targetName];
    const afterTarget = after.targets[targetName];
    comparedTargets[targetName] =
      beforeTarget && afterTarget
        ? compareTotals(beforeTarget.totals, afterTarget.totals)
        : {
            status: beforeTarget ? "missing-after" : "missing-before",
          };
  }

  const environmentWarnings = [];
  for (const key of ["node", "platform", "architecture", "lockfileSha256"]) {
    if (before.environment?.[key] !== after.environment?.[key]) {
      environmentWarnings.push({
        key,
        before: before.environment?.[key] ?? null,
        after: after.environment?.[key] ?? null,
      });
    }
  }

  return {
    schemaVersion: 1,
    before: beforePath,
    after: afterPath,
    environmentWarnings,
    targets: comparedTargets,
    totals: compareTotals(before.totals, after.totals),
  };
}

async function readSnapshot(path, expectedLabel) {
  let snapshot;
  try {
    snapshot = JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`Missing ${expectedLabel} snapshot: ${path}`);
    }
    throw error;
  }

  if (snapshot.schemaVersion !== 1 || snapshot.label !== expectedLabel) {
    throw new Error(`Invalid ${expectedLabel} snapshot: ${path}`);
  }
  return snapshot;
}

function compareTotals(before, after) {
  const categories = new Set([...Object.keys(before), ...Object.keys(after)]);
  const comparison = {};
  for (const category of [...categories].sort()) {
    comparison[category] = compareTotal(before[category], after[category]);
  }
  return comparison;
}

function compareTotal(before, after) {
  if (!before || !after) {
    return { status: before ? "missing-after" : "missing-before" };
  }

  const comparison = {};
  for (const key of ["fileCount", "raw", "gzip", "brotli"]) {
    const delta = after[key] - before[key];
    comparison[key] = {
      before: before[key],
      after: after[key],
      delta,
      percent: before[key] === 0 ? null : (delta / before[key]) * 100,
    };
  }
  return comparison;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function toPosix(path) {
  return path.split(sep).join("/");
}

function readOption(optionArgs, name) {
  const optionIndex = optionArgs.indexOf(name);
  if (optionIndex === -1) return undefined;
  const value = optionArgs[optionIndex + 1];
  if (!value || value.startsWith("--")) {
    fail(`Missing value for ${name}`);
  }
  return value;
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
