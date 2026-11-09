import type {Metadata} from 'next';
import {Manrope, Plus_Jakarta_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext', 'cyrillic-ext'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Fluid Notch Navigation Studio',
  description:
    'Интерактивный демо-стенд, оптимизированный движок физической геометрии и авторские темы для компонента AdaptiveNotchNav.',
  openGraph: {
    title: 'Fluid Notch Navigation Studio',
    description:
      'Интерактивный демо-стенд, оптимизированный движок физической геометрии и авторские темы для компонента AdaptiveNotchNav.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fluid Notch Navigation Studio',
    description:
      'Интерактивный демо-стенд, оптимизированный движок физической геометрии и авторские темы для компонента AdaptiveNotchNav.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} dark`}
    >
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-[#07070C] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200"
      >
        {children}
      </body>
    </html>
  );
}
