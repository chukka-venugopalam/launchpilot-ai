import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LaunchPilot AI - Autonomous Business Launch Agent',
  description:
    'LaunchPilot AI is an autonomous agent that helps you launch your business. Enter a goal and watch as the AI researches, plans, and generates a complete business launch strategy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
