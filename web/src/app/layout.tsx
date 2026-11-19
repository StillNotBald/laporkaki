import type { Metadata, Viewport } from "next";
import { submission } from "@/content/submission";
import "./globals.css";

export const metadata: Metadata = {
  title: submission.project.name,
  description: "Report a public problem. We find who fixes it.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: submission.project.name, statusBarStyle: "default" },
  icons: { apple: "/icon-180.png" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
