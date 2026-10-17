import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClearPath | 3-Second Counterparty Screen',
  description: 'The trust agent that shows its work: multi-hop graph proof with FalkorDB.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-[#f3f4f6] antialiased selection:bg-purple-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
