// src/app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-8">
      <h1 className="text-2xl font-bold mb-4">Impostor — Quem é o Espião?</h1>
      <p className="mb-6">Jogo local para passar o celular entre os amigos. Crie packs e divirta-se.</p>

      <div className="flex gap-3">
        <Link href="/setup" className="px-4 py-2 bg-blue-600 text-white rounded">Criar Jogo</Link>
        <Link href="/about" className="px-4 py-2 border rounded">Sobre</Link>
      </div>
    </div>
  )
}
