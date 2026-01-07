import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wallet Profiler - Discover Crypto Wallet Identities",
  description: "Discover social identities, on-chain activity, and portfolio data linked to any crypto wallet. Supports Ethereum, Solana, and 12+ chains.",
  openGraph: {
    title: "Wallet Profiler",
    description: "Discover identities linked to crypto wallets",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
        {children}
      </body>
    </html>
  );
}
