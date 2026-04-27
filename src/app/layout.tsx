import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from '@/components/layout/main-layout';
import { FirebaseClientProvider } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { AuthProvider } from '@/lib/hooks/use-auth';

export const metadata: Metadata = {
  title: 'SEL Assistant',
  description: 'An AI-powered Social-Emotional Learning Assistant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Lilita+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <FirebaseClientProvider>
            <FirebaseErrorListener />
            <MainLayout>{children}</MainLayout>
            <Toaster />
          </FirebaseClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
