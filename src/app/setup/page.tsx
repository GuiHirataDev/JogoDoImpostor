// src/app/setup/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { packs } from '../../data/packs'
import { useRouter } from 'next/navigation'

type SetupState = {
  numPlayers: number
  impostors: number
  selectedPacks: string[]
  duration: number
  names: string[]
}

export default function SetupPage() {
  const router = useRouter()
  const [numPlayers, setNumPlayers] = useState<number>(4)
  const [impostors, setImpostors] = useState<number>(1)
  const [selectedPacks, setSelectedPacks] = useState<string[]>(['animais'])
  const [duration, setDuration] = useState<number>(5) // minutos, opcional
  const [names, setNames] = useState<string[]>([])

  // inicializa array de nomes quando numPlayers muda
  useEffect(() => {
    setNames(prev => {
      const next = Array.from({ length: numPlayers }, (_, i) => prev[i] ?? `Jogador ${i + 1}`)
      return next
    })
  }, [numPlayers])

  function togglePack(name: string) {
    setSelectedPacks(prev => (prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]))
  }

  function updateName(index: number, value: string) {
    setNames(prev => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  function handleStart() {
    // validações básicas
    if (impostors >= numPlayers) {
      alert('Quantidade de impostores deve ser menor que o número de jogadores.')
      return
    }
    if (selectedPacks.length === 0) {
      alert('Selecione ao menos um pack de palavras.')
      return
    }

    const setup: SetupState = {
      numPlayers,
      impostors,
      selectedPacks,
      duration,
      names
    }
    // salva no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('impostor_setup', JSON.stringify(setup))
    }
    // navega para a página do jogo
    router.push('/game')
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Configurar partida</h2>

      <div className="mb-4">
        <label className="block mb-2">Quantidade de jogadores</label>
        <input
          type="number"
          min={3}
          max={12}
          value={numPlayers}
          onChange={e => setNumPlayers(Math.max(3, Math.min(12, Number(e.target.value || 3))))}
          className="border p-2 rounded mb-2 w-24"
        />
        <div className="text-sm text-gray-500">Edite os nomes abaixo (opcional)</div>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Nomes dos jogadores</label>
        <div className="grid gap-2 grid-cols-2">
          {Array.from({ length: numPlayers }).map((_, i) => (
            <input
              key={i}
              type="text"
              value={names[i] ?? `Jogador ${i + 1}`}
              onChange={e => updateName(i, e.target.value)}
              className="border rounded p-2"
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Quantidade de impostores</label>
        <input
          type="number"
          min={1}
          max={Math.max(1, numPlayers - 1)}
          value={impostors}
          onChange={e => setImpostors(Math.max(1, Math.min(numPlayers - 1, Number(e.target.value || 1))))}
          className="border p-2 rounded mb-2 w-24"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Duração da partida (min)</label>
        <input
          type="number"
          min={1}
          max={60}
          value={duration}
          onChange={e => setDuration(Math.max(1, Math.min(60, Number(e.target.value || 5))))}
          className="border p-2 rounded mb-2 w-24"
        />
      </div>

      <div className="mb-4">
        <div className="mb-2">Packs (selecione ao menos 1)</div>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(packs).map(pk => (
            <button
              key={pk}
              onClick={() => togglePack(pk)}
              className={`px-3 py-1 rounded mb-2 ${selectedPacks.includes(pk) ? 'bg-blue-600 text-white' : 'border'}`}
            >
              {pk}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleStart} className="bg-green-600 text-white px-4 py-2 rounded">Iniciar jogo</button>
      </div>
    </div>
  )
}
