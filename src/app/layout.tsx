import "react-medium-image-zoom/dist/styles.css";
import "react-image-crop/dist/ReactCrop.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// PRIMARY UI FONT
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SR Portraits & Events",
    template: "%s | SR Portraits & Events",
  },

  description:
    "Book event photography, purchase custom photo frames, and manage your vendor or customer profile at SR Portraits & Events.",

  keywords: [
    "event photography",
    "wedding photography",
    "photo frames",
    "photo studio",
    "vendor booking",
    "SR Portraits & Events",
  ],

  metadataBase: new URL("https://sr-portraits-events.com"),

  alternates: {
    canonical: "/",
  },

  // --- OpenGraph ---
  openGraph: {
    title: "SR Portraits & Events",
    description:
      "Professional photography, events, vendor onboarding, and custom frames.",
    url: "https://sr-portraits-events.com",
    siteName: "SR Portraits & Events",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SR Portraits OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // --- Twitter Cards ---
  twitter: {
    card: "summary_large_image",
    title: "SR Portraits & Events",
    description: "Photography, events, frames, and vendor services.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased bg-background text-foreground`}
      >
        <Toaster richColors closeButton position="top-center" />
        {children}
      </body>
    </html>
  );
}
