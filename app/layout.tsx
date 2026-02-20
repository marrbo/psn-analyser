// app/layout.tsx
import { jersey, funnel } from "@/styles/fonts";
import "./globals.css";
import { HeaderProvider } from "@/providers/HeaderContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeaderProvider>
      <html lang="pt-BR" className={`${jersey.variable} ${funnel.variable}`}>
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1.0"
        />
        <body className="inset-0 max-w-screen max-h-screen">
          {children}
        </body>
      </html>
    </HeaderProvider>
  );
}
