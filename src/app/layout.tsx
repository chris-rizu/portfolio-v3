import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Archivo's width axis gives the expanded, industrial headlines; body text uses its normal width.
const sans = Archivo({
  variable: "--nf-sans",
  subsets: ["latin"],
  axes: ["wdth"],
});

const mono = JetBrains_Mono({
  variable: "--nf-mono",
  subsets: ["latin"],
});

const description =
  "Chris Paolo Caral, a computer engineer in Cebu building web apps, internal tools and bots. Walk through his workshop in 3D.";

export const metadata: Metadata = {
  title: "Chris Paolo Caral — Computer Engineer, Cebu",
  description,
  keywords: ["Chris Paolo Caral", "Computer Engineer", "Software Engineer", "Cebu", "Philippines", "Portfolio", "Three.js"],
  authors: [{ name: "Chris Paolo Caral" }],
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Chris Paolo Caral — Computer Engineer, Cebu",
    description,
    type: "website",
    images: [{ url: "/images/profile.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
