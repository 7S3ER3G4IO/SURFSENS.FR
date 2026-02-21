import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SurfReport France - Sécurisé & Temps Réel",
  description: "État des vagues, conditions météo en direct et rapports de surfeurs pour la côte atlantique française.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`antialiased bg-neutral-950 text-neutral-100`}>
        {children}
      </body>
    </html>
  );
}
