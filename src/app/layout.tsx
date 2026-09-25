import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Noto_Sans_KR } from "next/font/google";
import { DESCRIPTION, OWNER_EN, OWNER_KO, SITE_URL, personJsonLd, worksJsonLd } from "@/lib/site";
import "./globals.css";

/*
 * Four faces, one job each.
 *
 * Geist is the interface and the display voice — a geometric grotesque that holds up both at
 * 11px in a label and at 14vw in the hero. Geist Mono is the machine voice: indices, tags,
 * readouts, every number that must hold a column. Instrument Serif is the one warm note, used
 * only in italics for the English accents on section titles. Noto Sans KR carries the Korean
 * that most of the copy is written in; it sits second in every stack, so hangul falls through
 * to it while Latin stays in Geist.
 *
 * All self-hosted by next/font at build time, `display: swap` throughout: showing the headline
 * immediately in a fallback beats showing it late in the right face.
 */
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});
const notoKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-kr",
  display: "swap",
});

const TITLE = `${OWNER_KO} — AI Portfolio`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s · ${OWNER_KO}` },
  description: DESCRIPTION.ko,
  applicationName: `${OWNER_EN} Portfolio`,
  authors: [{ name: OWNER_EN, url: "https://github.com/yhkwon2004" }],
  creator: OWNER_EN,
  keywords: [
    "포트폴리오", "portfolio", OWNER_KO, OWNER_EN,
    "AI", "인공지능", "딥러닝", "deep learning", "컴퓨터 비전", "computer vision",
    "자율주행", "autonomous driving", "AirSim", "세그멘테이션", "segmentation",
    "ROS2", "임베디드", "firmware",
  ],
  alternates: { canonical: "/", languages: { ko: "/", en: "/?lang=en" } },
  openGraph: {
    type: "profile",
    siteName: `${OWNER_EN} Portfolio`,
    title: TITLE,
    description: DESCRIPTION.ko,
    url: SITE_URL,
    locale: "ko_KR",
    alternateLocale: ["en_US"],
    images: [{ url: "/og.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION.ko, images: ["/og.png"] },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05060a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${geist.variable} ${geistMono.variable} ${serif.variable} ${notoKr.variable}`}
      // Scripts set data-motion / data-lang before paint; the server cannot know either.
      suppressHydrationWarning
    >
      <body>
        {/*
          Without a script nothing reveals: every [data-reveal] element starts hidden and waits
          for the observer. So with scripting off they are simply shown, and the page arrives as
          the complete static document it is.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>[data-reveal]{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important}.split .u{transform:none!important;opacity:1!important}.loader{display:none!important}</style>",
          }}
        />
        {children}
        {/*
          Structured data from the same records the page renders, so the machine-readable
          claims and the human-readable ones cannot disagree.
        */}
        <script
          type="application/ld+json"
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
