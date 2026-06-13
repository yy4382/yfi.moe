import { readFile } from "node:fs/promises";
import path from "node:path";
import satori, { type SatoriOptions } from "satori";
import { postOgImage } from "./og-image-template";

const fontRegularPath = path.resolve(
  process.cwd(),
  "src/assets/fonts/MiSans-Regular.ttf",
);
const fontBoldPath = path.resolve(
  process.cwd(),
  "src/assets/fonts/MiSans-Bold.ttf",
);

let fontPromise: Promise<{ fontRegular: Buffer; fontBold: Buffer }> | undefined;

const fetchFonts = () => {
  if (fontPromise) {
    return fontPromise;
  }

  fontPromise = Promise.all([
    readFile(fontRegularPath),
    readFile(fontBoldPath),
  ]).then(([fontRegular, fontBold]) => ({ fontRegular, fontBold }));

  return fontPromise;
};

const getSatoriOptions = async (): Promise<SatoriOptions> => {
  const { fontRegular, fontBold } = await fetchFonts();

  return {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Regular", data: fontRegular },
      { name: "Bold", data: fontBold },
    ],
  };
};

export type OgImageInfo = {
  title: string;
  date: string;
};

export async function generateOgImageForPost(info: OgImageInfo) {
  const node = postOgImage(info);
  const options = await getSatoriOptions();
  const svg = await satori(node, options);
  return svgBufferToPngBuffer(svg);
}

async function svgBufferToPngBuffer(svg: string): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
