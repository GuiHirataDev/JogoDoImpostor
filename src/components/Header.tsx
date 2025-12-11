// src/components/Header.tsx
'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

export default function Header({ title }: { title?: string }) {
  const router = useRouter()
  return (
    <header className="w-full max-w-2xl mx-auto mb-4 px-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="px-3 py-1 rounded bg-gray-100 border text-sm"
        >
          Voltar
        </button>
        <h2 className="text-lg font-semibold">{title}</h2>
        <div style={{ width: 56 }} /> {/* placeholder para manter alinhamento */}
      </div>
    </header>
  )
}
