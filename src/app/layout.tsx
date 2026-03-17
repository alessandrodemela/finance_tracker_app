import type { Metadata } from "next";
import { BottomNav } from "@/components/BottomNav";
import { DateProvider } from "@/context/DateContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Personal finance dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finance Tracker",
  },
};

export const viewport = {
  themeColor: "#050714",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
