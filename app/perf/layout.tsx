import type { Metadata } from "next";
import { SITE_URL } from "@/components/site";
import type { ReactNode } from "react";
import { t } from "@/lib/perf/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: t("meta.title"),
  icons: "/perf/horizon-64.png",
  description: t("meta.description"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0d0e13", color: "#ecedf3" }}>{children}</body>
    </html>
  );
}
