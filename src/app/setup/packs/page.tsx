// src/app/setup/packs/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { packs } from '../../../data/packs'
import { useRouter } from 'next/navigation'

type SetupState = {
  numPlayers: number
  impostors: number
  selectedPacks: string[]
  duration: number
  names: string[]
}

function readSetup() {
  try { return JSON.parse(localStorage.getItem('impostor_setup') || 'null') ?? null } catch { return null }
}

export default function PacksPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    const s: SetupState | null = readSetup()
    setSelected(s?.selectedPacks ?? ['animais'])
  }, [])

  function toggle(pk: string) {
    setSelected(prev => prev.includes(pk) ? prev.filter(p => p !== pk) : [...prev, pk])
  }

  function save() {
    const raw = readSetup() || { numPlayers:4, impostors:1, selectedPacks:[], duration:5, names:[] }
    const next = { ...raw, selectedPacks: selected }
    localStorage.setItem('impostor_setup', JSON.stringify(next))
    router.back()
  }

  return (
    <div className="min-h-screen px-4 pb-28 pt-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full card-surface flex items-center justify-center text-2xl">📦</div>
          <div>
            <div className="text-sm kv-label">Packs</div>
            <div className="text-xl font-bold">Escolher Pacotes</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.keys(packs).map(pk => (
            <button key={pk} onClick={() => toggle(pk)} className={`rounded-2xl p-4 flex flex-col items-start justify-between ${selected.includes(pk) ? 'ring-2 ring-green-500' : 'card-surface'}`}>
              <div className="text-2xl mb-2">🟦</div>
              <div className="text-lg font-semibold">{pk}</div>
            </button>
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
