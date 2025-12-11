// src/app/game/page.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import PlayerCard from '../../components/PlayerCard'
import { packs as ALL_PACKS } from '../../data/packs'
import { assignRolesAndWords, Player } from '../../utils/assign'
import { useRouter } from 'next/navigation'

type SetupState = {
  numPlayers: number
  impostors: number
  selectedPacks: string[]
  duration: number // minutos
  names: string[]
}

type Phase = 'reading' | 'prepare' | 'mini-countdown' | 'discussion' | 'finished'

export default function GamePageClient() {
  const router = useRouter()
  const [assigned, setAssigned] = useState<Player[] | null>(null)
  const [index, setIndex] = useState(0)

  // controla se o jogador atual já revelou
  const [revealed, setRevealed] = useState(false)

  // fluxo de jogo
  const [phase, setPhase] = useState<Phase>('reading')

  // quem começa (índice dentro do assigned)
  const [startingPlayerIndex, setStartingPlayerIndex] = useState<number | null>(null)

  // mini contador 3..2..1
  const [miniCount, setMiniCount] = useState(3)

  // timer principal em segundos
  const [mainSeconds, setMainSeconds] = useState<number>(0)
  const mainIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem('impostor_setup')
    if (!raw) {
      router.push('/')
      return
    }

    try {
      const setup: SetupState = JSON.parse(raw)
      const players = setup.names.map((n, i) => ({ id: i + 1, name: n || `Jogador ${i + 1}` }))

      const packWords: string[] = setup.selectedPacks.flatMap(pk => {
        const p = (ALL_PACKS as any)[pk]
        return Array.isArray(p) ? p : []
      })

      if (packWords.length === 0) {
        alert('Nenhuma palavra disponível nos packs selecionados.')
        router.push('/')
        return
      }

      const result = assignRolesAndWords(players, setup.impostors, packWords)
      setAssigned(result)
    } catch (err) {
      console.error('Erro ao ler setup do localStorage', err)
      router.push('/')
    }
  }, [router])

  if (assigned === null) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 text-center">
        <div className="text-gray-600">Carregando jogadores...</div>
      </div>
    )
  }

  if (index < 0 || index >= assigned.length) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 text-center">
        <div className="text-gray-600">Índice inválido — retornando à configuração.</div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => router.push('/')}
          >
            Voltar para início
          </button>
        </div>
      </div>
    )
  }

  const current = assigned[index]

  // Handler chamado pelo PlayerCard quando o jogador revelar
  function handleRevealed() {
    setRevealed(true)
  }

  // Avança para o próximo jogador (ler)
  function handleNextPlayer() {
    setRevealed(false)
    if (index < assigned.length - 1) {
      setIndex(i => i + 1)
    } else {
      // todos já leram; mantém index no último para poder mostrar "Jogar" depois
    }
    // rola para top para garantir que o próximo jogador veja o topo
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // inicia o jogo: escolhe jogador aleatório que começa e inicia mini-contador
  function handleStartGame() {
    const startIdx = Math.floor(Math.random() * assigned.length)
    setStartingPlayerIndex(startIdx)
    setPhase('prepare')

    setTimeout(() => {
      setPhase('mini-countdown')
      setMiniCount(3)
      const miniTimer = setInterval(() => {
        setMiniCount(c => {
          if (c <= 1) {
            clearInterval(miniTimer)
            startDiscussionTimer()
            return 0
          }
          return c - 1
        })
      }, 1000)
    }, 800)
  }

  function startDiscussionTimer() {
    const raw = localStorage.getItem('impostor_setup')
    let durationMin = 5
    if (raw) {
      try {
        const setup: SetupState = JSON.parse(raw)
        durationMin = setup.duration ?? 5
      } catch {
        durationMin = 5
      }
    }
    const totalSeconds = Math.max(1, Math.floor(durationMin * 60))
    setMainSeconds(totalSeconds)
    setPhase('discussion')

    if (mainIntervalRef.current) {
      window.clearInterval(mainIntervalRef.current)
      mainIntervalRef.current = null
    }

    mainIntervalRef.current = window.setInterval(() => {
      setMainSeconds(s => {
        if (s <= 1) {
          if (mainIntervalRef.current) {
            window.clearInterval(mainIntervalRef.current)
            mainIntervalRef.current = null
          }
          setPhase('finished')
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  function handleStopAndVote() {
    if (mainIntervalRef.current) {
      window.clearInterval(mainIntervalRef.current)
      mainIntervalRef.current = null
    }

    try {
      if (assigned) {
        localStorage.setItem('impostor_assigned', JSON.stringify(assigned))
      }
    } catch (e) {
      console.warn('Falha ao salvar assigned no localStorage', e)
    }

    setPhase('finished')
    router.push('/vote')
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // botão sair: ícone X no canto superior esquerdo (posição absoluta relativa ao main container)
  function handleExit() {
    localStorage.removeItem('impostor_setup')
    router.push('/')
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-10 relative">
      {/* exit icon (X) - superior esquerda */}
      <button
        onClick={handleExit}
        aria-label="Sair"
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          width: 44,
          height: 44,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 120000
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>✕</span>
      </button>

      <div className="w-full max-w-md">
        <h3 className="text-center text-2xl font-semibold mb-4">{`Jogador ${index + 1}`}</h3>

        <PlayerCard key={current.id} player={current} onReveal={handleRevealed} />

        <div className="mt-6 text-center">
          {!revealed ? (
            <div className="instruction-text text-white/90 text-lg font-medium">
              Arraste seu cartão para revelar sua palavra. Não deixe que ninguém mais a veja.
            </div>
          ) : (
            <div className="text-white text-lg font-semibold">Passe o dispositivo para o próximo jogador</div>
          )}
        </div>

        <div className="mt-8">
          {revealed ? (
            <button
              onClick={handleNextPlayer}
              className="w-full py-4 rounded-full btn-purple text-lg font-bold"
            >
              Próximo Jogador
            </button>
          ) : null}
        </div>

        {/* Se for o último jogador e já estiver revelado, mostrar botão Jogar */}
        {revealed && index === (assigned.length - 1) && (
          <div className="mt-4">
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-full btn-green-large text-lg font-bold"
            >
              Jogar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
