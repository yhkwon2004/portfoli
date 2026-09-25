import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import { DESCRIPTION, OWNER_EN, OWNER_KO, SITE_URL, personJsonLd, worksJsonLd } from "@/lib/site";
import "./globals.css";

/*
 * Three faces, one job each.
 *
 * Inter carries the headlines — a neo-grotesque set tight and heavy, which is the voice the
 * reference uses for display type. JetBrains Mono is the instrument voice: nav, labels, tags,
 * and every number in the telemetry block, where digits have to hold a column without
 * shifting. Noto Sans KR is the Korean gothic that most of the copy is actually written in.
 *
 * Fonts are self-hosted by next/font: the files are fetched at build time and served from our
 * own origin with the @font-face unicode-ranges Google generated. That removes a
 * render-blocking round trip to a third party, and for the Korean face it keeps the per-range
 * chunking that stops a phone downloading megabytes of hangul it will never draw.
 *
 * `display: "swap"` throughout: the first paint is a name at display size, and showing it late
 * in the right face is worse than showing it immediately in a fallback.
 *
 * Only `latin` is requested, which is the only named subset Google exposes for these families —
 * the hangul still arrives, in the unicode-range blocks the CSS declares.
 */
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "700", "900"],
  variable: "--font-noto-kr",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${OWNER_KO} · HOURGLASS`,
    template: `%s · ${OWNER_KO}`,
  },
  description: DESCRIPTION.ko,
  applicationName: "HOURGLASS",
  authors: [{ name: OWNER_EN, url: "https://github.com/yhkwon2004" }],
  creator: OWNER_EN,
  keywords: [
    "포트폴리오", "portfolio", OWNER_KO, OWNER_EN,
    "로보틱스", "robotics", "자율주행", "autonomous driving",
    "임베디드", "embedded", "펌웨어", "firmware", "ROS2", "PCB",
  ],
  alternates: {
    canonical: "/",
    languages: { ko: "/", en: "/?lang=en" },
  },
  openGraph: {
    type: "profile",
    siteName: "HOURGLASS",
    title: `${OWNER_KO} · HOURGLASS`,
    description: DESCRIPTION.ko,
    url: SITE_URL,
    locale: "ko_KR",
    alternateLocale: ["en_US"],
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${OWNER_KO} · HOURGLASS` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${OWNER_KO} · HOURGLASS`,
    description: DESCRIPTION.ko,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The letterbox bars run to the edge of a notched display.
  viewportFit: "cover",
  themeColor: "#05060d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${jetbrains.variable} ${notoSansKr.variable}`}
    >
      <body>
        {/*
          Without a script, nothing will ever open the power-on shutter or release the
          chapters' held keyframes — so both are switched off before the first paint, and the
          page arrives as the static document it is.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>.boot{display:none!important}.scene,.scene *,.scene *::before,.scene *::after{animation:none!important}</style>",
          }}
        />
        {children}
        {/*
          Structured data, generated from the same records the page renders — so the machine-
          readable claims and the human-readable ones cannot disagree. Emitted from the server
          component, so it is in the static HTML rather than injected later.
        */}
        <script
          type="application/ld+json"
          // The content is our own build-time JSON, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(worksJsonLd()) }}
        />
      </body>
    </html>
  );
}
