// src/app/vote/page.tsx
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

type AssignedPlayer = {
  id: number
  name: string
  role?: 'civil' | 'impostor'
  word?: string
}

export default function VotePage() {
  const router = useRouter()
  const [setup, setSetup] = useState<SetupState | null>(null)
  const [assigned, setAssigned] = useState<AssignedPlayer[] | null>(null)
  const [selected, setSelected] = useState<number | null>(null) // índice selecionado
  const [voted, setVoted] = useState(false)
  const [result, setResult] = useState<'civis' | 'impostor' | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const rawSetup = localStorage.getItem('impostor_setup')
    if (!rawSetup) {
      router.push('/')
      return
    }
    try {
      const s: SetupState = JSON.parse(rawSetup)
      setSetup(s)
    } catch {
      router.push('/')
      return
    }

    // tenta ler assigned salvo (preferível)
    const rawAssigned = localStorage.getItem('impostor_assigned')
    if (rawAssigned) {
      try {
        const a: AssignedPlayer[] = JSON.parse(rawAssigned)
        setAssigned(a)
      } catch {
        setAssigned(null)
      }
    } else {
      // se não tiver, tentamos reconstruir players só com nomes (sem roles)
      try {
        const s: SetupState = JSON.parse(rawSetup)
        const players = (s.names && s.names.length > 0)
          ? s.names.map((n, i) => ({ id: i + 1, name: n || `Jogador ${i + 1}` }))
          : Array.from({ length: s.numPlayers }, (_, i) => ({ id: i + 1, name: `Jogador ${i + 1}` }))
        setAssigned(players as AssignedPlayer[])
      } catch {
        setAssigned(null)
      }
    }
  }, [router])

  if (!setup || !assigned) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 text-center">
        <div className="text-gray-600">Carregando votação...</div>
      </div>
    )
  }

  const players = assigned.map(p => p.name || `Jogador ${p.id}`)

  function handleSelect(idx: number) {
    if (voted) return // não permite mudança depois do voto
    setSelected(prev => prev === idx ? null : idx)
  }

  function handleVote() {
    if (selected === null) {
      alert('Selecione quem vocês acham que é o impostor antes de votar.')
      return
    }

    // determina o resultado lendo assigned (com roles)
    // assigned pode ter roles (quando salvamos), caso contrário a decisão é inconclusiva (tratamos como impostor venceu)
    const votedPlayer = assigned[selected]
    if (!votedPlayer) {
      alert('Erro ao identificar o jogador selecionado.')
      return
    }

    // Se existir role e for 'impostor' → civis venceram
    // Se existir role e for 'civil' → impostor venceu
    // Se não existir role no assigned (fallback) → consideramos que não temos dados e tratamos como empate -> impostor venceu (opcional)
    if (votedPlayer.role === 'impostor') {
      setResult('civis')
    } else if (votedPlayer.role === 'civil') {
      setResult('impostor')
    } else {
      // fallback conservador
      setResult('impostor')
    }

    setVoted(true)
  }

  function handleEndGame() {
    localStorage.removeItem('impostor_setup')
    localStorage.removeItem('impostor_assigned')
    router.push('/')
  }

  // Tela de resultado após votar
  if (voted && result) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6 text-center space-y-6">
        {result === 'civis' ? (
          <>
            <div className="text-6xl text-blue-600">👥</div>
            <div className="text-2xl font-bold">Civis venceram</div>
            <div className="text-sm text-gray-600">Parabéns! Vocês acertaram quem era o impostor.</div>
          </>
        ) : (
          <>
            <div className="text-6xl text-red-600">🎩🕶️</div>
            <div className="text-2xl font-bold">Impostor venceu</div>
            <div className="text-sm text-gray-600">O impostor enganou os civis desta vez.</div>
          </>
        )}

        <div>
          <button
            onClick={handleEndGame}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6 space-y-6">
      <div className="text-center">
        <div className="text-6xl">🗳️</div>
        <div className="text-2xl font-bold mt-2">Votação</div>
        <p className="text-sm text-gray-600 mt-2">Discutam em grupo, e decidam quem será eliminado.</p>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Quem vocês acham que é o impostor?</div>

        <div className="grid grid-cols-2 gap-3">
          {players.map((name, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition ${
                selected === i ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:shadow-sm'
              }`}
              aria-pressed={selected === i}
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
                👤
              </div>

              <div className="text-sm font-medium">{name || `Jogador ${i + 1}`}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleVote}
          className={`w-full px-4 py-2 rounded-lg text-white ${selected === null ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600'}`}
          disabled={selected === null}
        >
          Votar
        </button>

        <button
          onClick={handleEndGame}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg"
        >
          Encerrar jogo
        </button>
      </div>
    </div>
  )
}
