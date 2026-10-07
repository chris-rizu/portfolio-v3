import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--nf-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const sans = Inter({
  variable: "--nf-sans",
  subsets: ["latin"],
});


const description =
  "Step into Chris Paolo Caral's 3D workshop — a Computer Engineer and Software Engineer from Cebu, Philippines, building web apps, automation, and robots.";

export const metadata: Metadata = {
  title: "Chris Paolo Caral — The Workshop",
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
    title: "Chris Paolo Caral — The Workshop",
    description,
    type: "website",
    images: [{ url: "/images/profile.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#120d0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
