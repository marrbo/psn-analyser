// styles/fonts.ts
import { Ubuntu, Jersey_10, Funnel_Sans } from "next/font/google";

export const ubuntu = Ubuntu({
  weight: ['400', '700'], // Specify the weights you need
  subsets: ['latin'],
  display: 'swap', // Ensures the best loading experience
  variable: '--font-ubuntu', // Define a CSS variable name
});

export const jersey = Jersey_10 ({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jersey-10',
})

export const funnel = Funnel_Sans ({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-funnel',
})