import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pixai Generator | LUZ',
  description: 'AI 이미지 생성기',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
