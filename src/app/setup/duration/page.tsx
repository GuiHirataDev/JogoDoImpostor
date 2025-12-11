// src/app/setup/duration/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function readSetup() {
  try { return JSON.parse(localStorage.getItem('impostor_setup') || 'null') ?? null } catch { return null }
}

export default function DurationPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<number>(5)
  const options = Array.from({ length: 15 }, (_, i) => i + 1) // 1..15 min

  useEffect(() => {
    const s = readSetup()
    setSelected(s?.duration ?? 5)
  }, [])

  function save() {
    const raw = readSetup() || { numPlayers:4, impostors:1, selectedPacks:['animais'], duration:5, names:[] }
    const next = { ...raw, duration: selected }
    localStorage.setItem('impostor_setup', JSON.stringify(next))
    router.back()
  }

  return (
    <div className="min-h-screen px-4 pb-28 pt-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full card-surface flex items-center justify-center text-2xl">⏱️</div>
          <div>
            <div className="text-sm kv-label">Duração</div>
            <div className="text-xl font-bold">Escolher tempo</div>
          </div>
        </div>

        <div className="divide-y divide-gray-800 mb-6">
          {options.map(opt => (
            <div key={opt} onClick={() => setSelected(opt)} className={`p-4 ${selected === opt ? 'bg-black/30' : ''} cursor-pointer`}>
              <div className={`text-lg ${selected === opt ? 'text-green-400 font-semibold' : 'text-gray-300'}`}>
                {opt} minuto{opt !== 1 ? 's' : ''}
                {opt === 7 && <span className="text-sm text-gray-400"> (Recomendado)</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.back()} className="flex-1 px-4 py-3 rounded-lg border">Fechar</button>
          <button onClick={save} className="flex-1 px-4 py-3 rounded-lg btn-primary-fixed text-white">Salvar</button>
        </div>
      </div>
    </div>
  )
}
