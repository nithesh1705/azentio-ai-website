import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { PersonaProvider } from '@/context/PersonaContext';
import { AppShell } from '@/components/layout/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'azentio.ai — Enterprise AI & Governed Collective Learning',
  description:
    'Enterprise AI showcase, exclusive client and employee portals, and governed collective learning for financial services.',
  icons: {
    icon: [
      { url: '/favicon.jpeg', type: 'image/jpeg' },
    ],
    shortcut: '/favicon.jpeg',
    apple: '/favicon.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <PersonaProvider>
            <AppShell>{children}</AppShell>
          </PersonaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
