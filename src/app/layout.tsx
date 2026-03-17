import type { Metadata } from "next";
import { BottomNav } from "@/components/BottomNav";
import { DateProvider } from "@/context/DateContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Personal finance dashboard",
  manifest: "/manifest.json",
  themeColor: "#050714",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finance Tracker",
  },
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
