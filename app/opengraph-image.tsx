import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card people see when a link is pasted anywhere. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafaf9",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          {[24, 46, 64, 34].map((height, index) => (
            <div key={index} style={{ width: 9, height, borderRadius: 5, background: "#09090b" }} />
          ))}
          <div style={{ marginLeft: 14, fontSize: 38, fontWeight: 600, color: "#09090b" }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* The same claim as the hero, because a link preview that promises
              something else is the first broken promise a visitor gets. */}
          <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: -3, lineHeight: 1.04, color: "#09090b" }}>
            Nothing you type
          </div>
          <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: -3, lineHeight: 1.04, color: "#09090b" }}>
            ever leaves this tab
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 27, color: "#71717a", maxWidth: 900, lineHeight: 1.4 }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size,
  );
}
