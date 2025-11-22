import type { Metadata } from 'next'
import { Orbitron, Rajdhani } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orbitron',
})

const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rajdhani',
})

export const metadata: Metadata = {
  title: 'PSN Analyser - Sua Análise de Perfil PlayStation',
  description: 'Descubra suas estatísticas épicas da PlayStation Network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <div className="background-animation">
          <div className="particles"></div>
          <div className="grid-lines"></div>
        </div>
        {children}
      </body>
    </html>
  )
}