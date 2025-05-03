import { format } from "date-fns";
import logo from "@assets/logo.svg?raw";
import type { OgImageInfo } from "./generateOgImages";

const logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;
const clickDataUrl = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0xMSAyMUw0IDRsMTcgN2wtNi4yNjUgMi42ODVhMiAyIDAgMCAwLTEuMDUgMS4wNXoiLz48L3N2Zz4=`;

export function postOgImage(info: OgImageInfo) {
  return (
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
            {info.title}
          </span>
          <span
            style={{
              fontSize: "36px",
              fontFamily: "Regular",
              letterSpacing: "-0.02em",
            }}
          >
            {format(info.date, "LLLL dd, yyyy")}
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
