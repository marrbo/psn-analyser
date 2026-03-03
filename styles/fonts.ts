// styles/fonts.ts
import { Ubuntu, Funnel_Sans, Courgette, Jersey_25 } from "next/font/google";

export const ubuntu = Ubuntu({
  weight: ['400', '700'], // Specify the weights you need
  subsets: ['latin'],
  display: 'swap', // Ensures the best loading experience
  variable: '--font-ubuntu', // Define a CSS variable name
});

export const jersey = Jersey_25 ({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jersey-25',
})

export const courgette = Courgette ({
  weight: ['400'],
  subsets: ['latin', 'latin-ext'],
  preload: true,
  style: 'normal',
  display: 'swap',
  variable: '--font-courgette',
})

export const funnel = Funnel_Sans ({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-funnel',
})