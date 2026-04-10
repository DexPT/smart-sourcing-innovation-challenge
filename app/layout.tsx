import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dubai Chambers Innovation Platform',
  description: 'Enterprise-grade AI-powered innovation and sourcing platform for Dubai Chambers, developed in collaboration with Ignyte.ae',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
