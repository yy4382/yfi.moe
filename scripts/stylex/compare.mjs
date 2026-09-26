#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const requireFromApp = createRequire(
  resolve(repoRoot, "app/blog-astro/package.json"),
);
const sharp = requireFromApp("sharp");
const options = parseArgs(process.argv.slice(2));
const beforeRoot = resolve(repoRoot, options.before);
const afterRoot = resolve(repoRoot, options.after);
const reportRoot = resolve(repoRoot, options.output);

const beforeReport = await readCapture(beforeRoot);
const afterReport = await readCapture(afterRoot);
const beforeShots = shotMap(beforeReport);
const afterShots = shotMap(afterReport);
const keys = [...new Set([...beforeShots.keys(), ...afterShots.keys()])].sort();
const report = {
  schemaVersion: 1,
  before: options.before,
  after: options.after,
  channelThreshold: options.channelThreshold,
  maxDiffPercent: options.maxDiffPercent,
  compared: [],
  missing: [],
};

await mkdir(resolve(reportRoot, "diff"), { recursive: true });
for (const key of keys) {
  const baseline = beforeShots.get(key);
  const candidate = afterShots.get(key);
  if (!baseline || !candidate) {
    report.missing.push({
      key,
      before: baseline?.status ?? "missing",
      after: candidate?.status ?? "missing",
    });
    continue;
  }
  if (baseline.status !== "captured" || candidate.status !== "captured") {
    report.missing.push({
      key,
      before: baseline.status,
      after: candidate.status,
    });
    continue;
  }
  const comparison = await compareImages(
    resolve(beforeRoot, baseline.file),
    resolve(afterRoot, candidate.file),
    resolve(reportRoot, "diff", `${safeName(key)}.png`),
  );
  report.compared.push({ key, ...comparison });
}

const regressions = report.compared.filter(
  (entry) =>
    !entry.dimensionsMatch || entry.diffPercent > options.maxDiffPercent,
);
report.summary = {
  compared: report.compared.length,
  exactMatches: report.compared.filter((entry) => entry.changedPixels === 0)
    .length,
  regressions: regressions.length,
  missing: report.missing.length,
};
await writeFile(
  resolve(reportRoot, "comparison.json"),
  JSON.stringify(report, null, 2) + "\n",
);
await writeFile(resolve(reportRoot, "comparison.md"), markdownReport(report));
console.log(
  `${report.summary.exactMatches}/${report.summary.compared} exact matches; ${regressions.length} regressions; ${report.missing.length} missing.`,
);
if (regressions.length || report.missing.length) process.exitCode = 1;

async function compareImages(beforePath, afterPath, diffPath) {
  const [before, after] = await Promise.all([
    decode(beforePath),
    decode(afterPath),
  ]);
  const width = Math.max(before.info.width, after.info.width);
  const height = Math.max(before.info.height, after.info.height);
  const totalPixels = width * height;
  const diff = Buffer.alloc(totalPixels * 4);
  let changedPixels = 0;
  let absoluteChannelDelta = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const outputOffset = (y * width + x) * 4;
      const a = pixel(before, x, y);
      const b = pixel(after, x, y);
      let largestDelta = 0;
      for (let channel = 0; channel < 4; channel += 1) {
        const delta = Math.abs(a[channel] - b[channel]);
        absoluteChannelDelta += delta;
        largestDelta = Math.max(largestDelta, delta);
      }
      if (largestDelta > options.channelThreshold) {
        changedPixels += 1;
        diff[outputOffset] = 255;
        diff[outputOffset + 1] = Math.max(0, 255 - largestDelta);
        diff[outputOffset + 2] = 128;
        diff[outputOffset + 3] = 255;
      }
    }
  }

  await sharp(diff, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(diffPath);
  return {
    beforeSize: [before.info.width, before.info.height],
    afterSize: [after.info.width, after.info.height],
    dimensionsMatch:
      before.info.width === after.info.width &&
      before.info.height === after.info.height,
    changedPixels,
    totalPixels,
    diffPercent: Number(((changedPixels / totalPixels) * 100).toFixed(6)),
    meanAbsoluteChannelDelta: Number(
      (absoluteChannelDelta / (totalPixels * 4)).toFixed(6),
    ),
    diffFile: diffPath.slice(reportRoot.length + 1),
  };
}

async function decode(path) {
  return sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}

function pixel(image, x, y) {
  if (x >= image.info.width || y >= image.info.height) return [0, 0, 0, 0];
  const offset = (y * image.info.width + x) * 4;
  return [
    image.data[offset],
    image.data[offset + 1],
    image.data[offset + 2],
    image.data[offset + 3],
  ];
}

function shotMap(report) {
  return new Map(report.screenshots.map((shot) => [shotKey(shot), shot]));
}

function shotKey(shot) {
  return `${shot.scope}/${shot.id}/${shot.viewport}/${shot.colorScheme}`;
}

async function readCapture(root) {
  return JSON.parse(
    await readFile(resolve(root, "capture-report.json"), "utf8"),
  );
}

function markdownReport(report) {
  const lines = [
    "# StyleX pixel comparison",
    "",
    `Threshold: channel delta > ${report.channelThreshold}; allowed changed pixels: ${report.maxDiffPercent}%`,
    "",
    "| Target | Dimensions | Changed pixels | Changed % | Mean channel delta |",
    "| --- | --- | ---: | ---: | ---: |",
    ...report.compared.map(
      (entry) =>
        `| ${entry.key} | ${entry.beforeSize.join("×")} → ${entry.afterSize.join("×")} | ${entry.changedPixels} | ${entry.diffPercent}% | ${entry.meanAbsoluteChannelDelta} |`,
    ),
    "",
    "## Missing or failed captures",
    "",
    ...(report.missing.length
      ? report.missing.map(
          (entry) =>
            `- ${entry.key}: before=${entry.before}, after=${entry.after}`,
        )
      : ["None."]),
    "",
  ];
  return lines.join("\n");
}

function parseArgs(args) {
  const parsed = {
    before: "artifacts.local/stylex/before",
    after: "artifacts.local/stylex/after",
    output: "artifacts.local/stylex/comparison",
    channelThreshold: 0,
    maxDiffPercent: 0,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--before") parsed.before = args[++index];
    else if (arg === "--after") parsed.after = args[++index];
    else if (arg === "--output") parsed.output = args[++index];
    else if (arg === "--channel-threshold")
      parsed.channelThreshold = Number(args[++index]);
    else if (arg === "--max-diff-percent")
      parsed.maxDiffPercent = Number(args[++index]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function safeName(value) {
  return value.replaceAll(/[^a-zA-Z0-9_.-]+/g, "--");
}
