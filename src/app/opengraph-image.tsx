import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "#000",
        color: "#fff",
      }}
    >
      <div style={{ fontSize: 120, fontWeight: 800 }}>{siteConfig.name}</div>
      <div style={{ fontSize: 36, opacity: 0.7, marginTop: 24 }}>
        Software · Web · Apps · Hosting · Domains
      </div>
    </div>,
    size,
  );
}
