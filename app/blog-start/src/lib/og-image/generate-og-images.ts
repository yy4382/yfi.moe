import { readFile } from "node:fs/promises";
import path from "node:path";
import satori, { type SatoriOptions } from "satori";
import sharp from "sharp";
import { postOgImage } from "./og-image-template";

const fontRegularPath = path.resolve(
  process.cwd(),
  "src/assets/fonts/MiSans-Regular.ttf",
);
const fontBoldPath = path.resolve(
  process.cwd(),
  "src/assets/fonts/MiSans-Bold.ttf",
);
const logoPath = path.resolve(process.cwd(), "src/assets/logo.svg");

let assetPromise:
  | Promise<{
      fontRegular: Buffer;
      fontBold: Buffer;
      logoDataUrl: string;
    }>
  | undefined;

const fetchAssets = () => {
  if (assetPromise) {
    return assetPromise;
  }

  assetPromise = Promise.all([
    readFile(fontRegularPath),
    readFile(fontBoldPath),
    readFile(logoPath),
  ]).then(([fontRegular, fontBold, logo]) => ({
    fontRegular,
    fontBold,
    logoDataUrl: `data:image/svg+xml;base64,${logo.toString("base64")}`,
  }));

  return assetPromise;
};

const getSatoriOptions = async (): Promise<SatoriOptions> => {
  const { fontRegular, fontBold } = await fetchAssets();

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
  const { logoDataUrl } = await fetchAssets();
  const node = postOgImage(info, { logoDataUrl });
  const options = await getSatoriOptions();
  const svg = await satori(node, options);
  return svgBufferToPngBuffer(svg);
}

async function svgBufferToPngBuffer(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}
