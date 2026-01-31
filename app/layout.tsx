import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Use Outfit font
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "600"], // Import weights used in design
});

export const metadata: Metadata = {
  title: "Smart AIoT Dashboard",
  description: "Control your AIoT devices with voice and ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
