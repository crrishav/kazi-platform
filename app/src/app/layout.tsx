import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kazi Manufacturing | Sustainable Garment Factory Bangladesh",
  description: "Premium ethical garment manufacturing from Bangladesh. Custom collections, minimum order 50 pieces. Worldwide delivery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
