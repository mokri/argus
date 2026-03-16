import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Argus AI — The Civil Infrastructure for AI Agents',
  description: 'Architectural Intelligence & Safety Platform for autonomous AI agents. Architect, Secure, Govern.',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Libre+Caslon+Condensed:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
