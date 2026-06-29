import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PingPilot",
  description: "AI outreach assistant for LinkedIn and email messages"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
