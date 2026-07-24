import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import ScrollToTop from "@/components/ScrollToTop";
import SplashScreen from "@/components/SplashScreen";

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
      <body>
        <SplashScreen />
        <ScrollToTop />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
