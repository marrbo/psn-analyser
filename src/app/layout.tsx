import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'PSN Trophy Master - Analise Seus Troféus da PlayStation',
  description: 'Descubra seus padrões de jogo, analise suas conquistas e eleve seu nível gamer com análises profundas do seu perfil PSN',
  keywords: 'PSN, PlayStation, troféus, platinas, análise, estatísticas, gaming',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}