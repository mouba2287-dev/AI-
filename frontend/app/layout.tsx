import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORKA - Traducteur & Lecteur Manga/Manhwa",
  description: "Traduis tes mangas & manhwas d'anglais en français avec une qualité professionnelle et lis-les en mode webtoon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#0f0f0f] text-zinc-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
