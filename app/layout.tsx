"use client";

// app/layout.tsx
import { courgette, funnel, jersey } from "@/styles/fonts";
import "./globals.css";
import { HeaderProvider } from "@/providers/HeaderContext";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('✅ SW registrado:', reg))
        .catch(err => console.error('❌ Erro ao registrar SW:', err));
    }
  }, []);

  return (
    <HeaderProvider>
      <html lang="pt-BR" className={`${jersey.variable} ${courgette.variable} ${funnel.variable}`}>
        <head>
          <meta
            name="viewport"
            content="width=device-width, height=device-height, initial-scale=1.0"
          />
          <meta name="manifest" content="/manifest.json" />
          <meta name="theme-color" content="#000000" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="PSN Analyser" />
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        </head>
        <body className="inset-0 max-w-screen max-h-screen">
          {children}
        </body>
      </html>
    </HeaderProvider>
  );
}
