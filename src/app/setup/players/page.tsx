// src/app/setup/players/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type SetupState = {
  numPlayers: number
  impostors: number
  selectedPacks: string[]
  duration: number
  names: string[]
}

function readSetup(): SetupState {
  if (typeof window === 'undefined') return { numPlayers:4, impostors:1, selectedPacks:['animais'], duration:5, names: [] }
  try { return JSON.parse(localStorage.getItem('impostor_setup') || 'null') ?? { numPlayers:4, impostors:1, selectedPacks:['animais'], duration:5, names: [] } }
  catch { return { numPlayers:4, impostors:1, selectedPacks:['animais'], duration:5, names: [] } }
}

export default function PlayersPage() {
  const router = useRouter()
  const [names, setNames] = useState<string[]>([])
  const [numPlayers, setNumPlayers] = useState(4)

  useEffect(() => {
    const s = readSetup()
    setNumPlayers(s.numPlayers ?? 4)
    setNames(s.names && s.names.length ? s.names : Array.from({ length: s.numPlayers ?? 4 }, (_, i) => `Jogador ${i + 1}`))
  }, [])

  function saveAll(newNames: string[]) {
    const raw = readSetup()
    const next = { ...raw, numPlayers: newNames.length, names: newNames }
    localStorage.setItem('impostor_setup', JSON.stringify(next))
    router.back()
  }

  function updateName(i: number, v: string) {
    setNames(prev => { const copy = [...prev]; copy[i] = v; return copy })
  }

  function removePlayer(i: number) {
    setNames(prev => {
      const copy = prev.filter((_, idx) => idx !== i)
      return copy.length ? copy : prev
    })
  }

  function addPlayer() {
    setNames(prev => [...prev, `Jogador ${prev.length + 1}`])
  }

  return (
    <div className="min-h-screen px-4 pb-28 pt-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full card-surface flex items-center justify-center text-2xl">👥</div>
          <div>
            <div className="text-sm kv-label">Adicionar Jogadores</div>
            <div className="text-xl font-bold">Jogadores</div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {names.map((n, i) => (
            <div key={i} className="rounded-xl p-3 card-surface flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center">👤</div>
                <input className="bg-transparent outline-none" value={n} onChange={e => updateName(i, e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => removePlayer(i)} className="text-red-400 px-2">✖</button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-3 card-surface flex items-center gap-3 mb-6">
          <button onClick={addPlayer} className="flex-1 text-left">➕ Adicionar Jogador</button>
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.back()} className="flex-1 px-4 py-3 rounded-lg border">Fechar</button>
          <button onClick={() => saveAll(names)} className="flex-1 px-4 py-3 rounded-lg btn-primary-fixed text-white">Salvar</button>
        </div>
      </div>
    </div>
  )
}
