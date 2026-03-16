import type { Metadata } from "next";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Tracker - MVP",
  description: "Personal finance dashboard for single user",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mobile-wrapper">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
