import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
// @ts-expect-error svg source
import logo from "@/assets/logo.svg?source";
import { notFound } from "next/navigation";
import { postCollection } from "@/lib/content-layer/collections";
import { format } from "date-fns";

// Image metadata
export const alt = "Yunfi's blog";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const dynamic = "error";

const logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;
const clickDataUrl = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0xMSAyMUw0IDRsMTcgN2wtNi4yNjUgMi42ODVhMiAyIDAgMCAwLTEuMDUgMS4wNXoiLz48L3N2Zz4=`;

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await postCollection.getEntry(slug);
  if (!post) {
    return notFound();
  }
  // Font loading, process.cwd() is Next.js project directory
  const fontRegular = await readFile(
    join(process.cwd(), "src/assets/fonts/SarasaUiSC-Regular.ttf"),
  );
  const fontBold = await readFile(
    join(process.cwd(), "src/assets/fonts/SarasaUiSC-Bold.ttf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `linear-gradient(to top right, rgb(225, 183, 205), rgb(209, 188, 232), rgb(179, 189, 255))`,
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
              {format(post.data.date, "LLLL dd, yyyy")}
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
    ),
    {
      ...size,
      fonts: [
        { name: "Regular", data: fontRegular },
        { name: "Bold", data: fontBold },
      ],
    },
  );
}
