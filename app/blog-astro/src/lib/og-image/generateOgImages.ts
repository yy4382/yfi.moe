import { readFile } from "node:fs/promises";
import satori, { type SatoriOptions } from "satori";
import sharp from "sharp";
import fontBoldUrl from "@/assets/fonts/MiSans-Bold.ttf?filepath";
import fontRegularUrl from "@/assets/fonts/MiSans-Regular.ttf?filepath";
import { postOgImage } from "./og-image-template";

const fetchFonts = async () => {
  // Use Promise.all with async readFile
  const [fontRegular, fontBold] = await Promise.all([
    readFile(fontRegularUrl),
    readFile(fontBoldUrl),
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

async function svgBufferToPngBuffer(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}
