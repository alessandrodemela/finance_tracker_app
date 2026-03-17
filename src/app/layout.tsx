import type { Metadata } from "next";
import { BottomNav } from "@/components/BottomNav";
import { DateProvider } from "@/context/DateContext";
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
          <DateProvider>
            {children}
            <BottomNav />
          </DateProvider>
        </div>
      </body>
    </html>
  );
}
