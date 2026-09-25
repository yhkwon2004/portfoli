import type { Metadata } from "next";

/** The media render harness is a tool, not a page: keep it out of every index. */
export const metadata: Metadata = {
  title: "render",
  robots: { index: false, follow: false },
};

export default function RenderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
