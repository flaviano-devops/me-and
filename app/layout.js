import "./globals.css";
import Script from "next/script";
import ThemeToggle from "@/components/ThemeToggle";
import AppNav from "@/components/AppNav";

export const metadata = {
  title: { default: "Entre Maldições", template: "%s — Entre Maldições" },
  description: "Perfis e histórias de personagens de Jujutsu Kaisen.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Script id="theme-init" strategy="beforeInteractive">{`try{document.documentElement.dataset.theme=localStorage.getItem('theme')||'dark'}catch(e){}`}</Script>
        <AppNav />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
