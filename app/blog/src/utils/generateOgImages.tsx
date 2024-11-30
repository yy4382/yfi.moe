import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { CollectionEntry } from "astro:content";
import fs from "node:fs";
import { DateTime } from "luxon";

const logo = fs.readFileSync(new URL("../assets/logo.svg", import.meta.url));
const logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;
const clickDataUrl = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0xMSAyMUw0IDRsMTcgN2wtNi4yNjUgMi42ODVhMiAyIDAgMCAwLTEuMDUgMS4wNXoiLz48L3N2Zz4=`;

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  fonts: [
    {
      name: "Regular",
      data: fs.readFileSync(
        new URL("../assets/SarasaUiSC-Regular.ttf", import.meta.url),
      ),
    },
    {
      name: "Bold",
      data: fs.readFileSync(
        new URL("../assets/SarasaUiSC-Bold.ttf", import.meta.url),
      ),
    },
  ],
};

export async function generateOgImageForPost(post: CollectionEntry<"post">) {
  // console.log(post);
  const node = postOgImage(post);
  const svg = await satori(node, options);
  // console.log(svg);
  return svgBufferToPngBuffer(svg);
  // return Buffer.from([1]);
}

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

function postOgImage(post: CollectionEntry<"post">) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `linear-gradient(to top right, rgb(225, 183, 205), rgb(209, 188, 232), rgb(136, 146, 217))`,
        padding: "48px",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: "80%",
          maxHeight: "80%",
          alignItems: "center",
          gap: "32px",
        }}
      >
        <img
          src={logoDataUrl}
          style={{ borderRadius: "16px", border: "4px solid #555" }}
          alt="logo"
          width={128}
          height={128}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "40px",
              fontFamily: "Bold",
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            {post.data.title}
          </span>
          <span
            style={{
              fontSize: "36px",
              fontFamily: "Regular",
              letterSpacing: "-0.02em",
            }}
          >
            {DateTime.fromJSDate(post.data.date)
              .setLocale("en")
              .toFormat("LLLL dd, yyyy")}
          </span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          right: "32px",
          padding: "16px 24px",
          borderRadius: "16px",
          backgroundColor: "#f5edef",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          gap: "8px",
          boxShadow: "0 0 16px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <span
          style={{
            fontSize: "36px",
            fontFamily: "Bold",
          }}
        >
          yfi.moe
        </span>
        <img
          src={clickDataUrl}
          alt="click"
          width={48}
          height={48}
          style={{ transform: "translateY(2px)" }}
        />
      </div>
    </div>
  );
}
