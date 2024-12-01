import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";

import { postOgImage } from "./og-image-template";

import fontRegularUrl from "@assets/fonts/SarasaUiSC-Regular.ttf?url";
import fontBoldUrl from "@assets/fonts/SarasaUiSC-Bold.ttf?url";

const findRootDir = (startDir: string, rootDir: string): string => {
  const parts = startDir.split(/[\\/]/);
  const rootIndex = parts.lastIndexOf(rootDir);
  if (rootIndex === -1) {
    throw new Error(`Cannot find ${rootDir} directory`);
  }
  return parts.slice(0, rootIndex + 1).join("/");
};

const fetchFonts = async () => {
  const rootDir = findRootDir(import.meta.dirname, "blog"); // dirty hack
  // Use Promise.all with async readFile
  const [fontRegular, fontBold] = await Promise.all([
    readFile(resolve(rootDir, fontRegularUrl.slice(1))),
    readFile(resolve(rootDir, fontBoldUrl.slice(1))),
  ]);

  return { fontRegular, fontBold };
};

const { fontRegular, fontBold } = await fetchFonts();

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  fonts: [
    { name: "Regular", data: fontRegular },
    { name: "Bold", data: fontBold },
  ],
};

export type OgImageInfo = {
  title: string;
  date: string;
};

export async function generateOgImageForPost(info: OgImageInfo) {
  const node = postOgImage(info);
  const svg = await satori(node, options);
  return svgBufferToPngBuffer(svg);
}

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}
