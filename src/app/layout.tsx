// src/app/layout.tsx
import '../styles/global.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Impostor - Quem é o Espião?'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <main className="min-h-screen flex items-center justify-center p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
