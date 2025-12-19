import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conjectural Assist",
  description: "Gerenciamento de requisitos de software com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
