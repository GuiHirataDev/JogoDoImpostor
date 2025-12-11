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

  // para controlar se o jogador atual já revelou
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
      router.push('/setup')
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
        router.push('/setup')
        return
      }

      const result = assignRolesAndWords(players, setup.impostors, packWords)
      setAssigned(result)
    } catch (err) {
      console.error('Erro ao ler setup do localStorage', err)
      router.push('/setup')
    }
  }, [router])

  // Se ainda não carregou os players
  if (assigned === null) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 text-center">
        <div className="text-gray-600">Carregando jogadores...</div>
      </div>
    )
  }

  // Segurança: se index inválido, volta ao setup
  if (index < 0 || index >= assigned.length) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 text-center">
        <div className="text-gray-600">Índice inválido — retornando à configuração.</div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => router.push('/setup')}
          >
            Voltar para setup
          </button>
        </div>
      </div>
    )
  }

  const current = assigned![index]

  // Handler chamado pelo PlayerCard quando o jogador revelar
  function handleRevealed() {
    setRevealed(true)
  }

  // Avança para o próximo jogador (ler)
  function handleNextPlayer() {
    setRevealed(false)
    if (index < assigned!.length - 1) {
      setIndex(i => i + 1)
    } else {
      // todos já leram; agora mostramos botão "Jogar" (phase permanece 'reading' até o click)
      // mantenha index no último (para poder mostrar "Jogar")
    }
  }

  // Inicia o jogo: escolhe jogador aleatório que começa e inicia mini-contador
  function handleStartGame() {
    // seleciona aleatoriamente um jogador para começar
    const startIdx = Math.floor(Math.random() * assigned!.length)
    setStartingPlayerIndex(startIdx)

    // vai para fase de preparação (mostra "O jogador X começa")
    setPhase('prepare')

    // aguarda 800ms antes de iniciar mini-contador para suavizar a animação
    setTimeout(() => {
      setPhase('mini-countdown')
      setMiniCount(3)
      // iniciar decremento do miniCount
      const miniTimer = setInterval(() => {
        setMiniCount(c => {
          if (c <= 1) {
            clearInterval(miniTimer)
            // quando o mini-contador terminar, inicia discussão
            startDiscussionTimer()
            return 0
          }
          return c - 1
        })
      }, 1000)
    }, 800)
  }

  // inicia o timer principal (discussion)
  function startDiscussionTimer() {
    // ler duração do setup
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

    // limpa qualquer intervalo anterior
    if (mainIntervalRef.current) {
      window.clearInterval(mainIntervalRef.current)
      mainIntervalRef.current = null
    }

    // inicia o intervalo
    mainIntervalRef.current = window.setInterval(() => {
      setMainSeconds(s => {
        if (s <= 1) {
          // tempo acabou
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

  // Parar o timer (quando votar)
  function handleStopAndVote() {
  // para o intervalo principal, se estiver rodando
  if (mainIntervalRef.current) {
    window.clearInterval(mainIntervalRef.current)
    mainIntervalRef.current = null
  }

  // opcional: salvar os players distribuídos (assigned) para uso futuro na votação/resultados
  // assigned pode ser null, então verificamos
  try {
    if (assigned) {
      localStorage.setItem('impostor_assigned', JSON.stringify(assigned))
    }
  } catch (e) {
    console.warn('Falha ao salvar assigned no localStorage', e)
  }

  // muda de fase para finished (ou mantenha outra lógica se preferir)
  setPhase('finished')

  // redireciona para a tela de votação
  router.push('/vote')
  }

  // Formata segundos para mm:ss
  function formatTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
      {/* leitura dos jogadores */}
      {phase === 'reading' && (
        <>
          <h3 className="text-lg font-semibold">{`Jogador ${index + 1}`}</h3>

          {/* key força remount do PlayerCard para resetar o estado interno de reveal */}
          <PlayerCard key={current.id} player={current} onReveal={handleRevealed} />

          <div className="mt-4 flex justify-between items-center">
            <button
              className="text-sm text-gray-600"
              onClick={() => {
                localStorage.removeItem('impostor_setup')
                router.push('/setup')
              }}
            >
              Sair
            </button>

            {/* botão Próximo só aparece depois do reveal */}
            {revealed && index < assigned!.length - 1 && (
              <button
                className="px-3 py-2 bg-blue-600 text-white rounded"
                onClick={handleNextPlayer}
              >
                Próximo jogador
              </button>
            )}

            {/* se for o último jogador e já revelou, mostra botão Jogar */}
            {revealed && index === assigned!.length - 1 && (
              <button
                className="px-3 py-2 bg-green-600 text-white rounded"
                onClick={handleStartGame}
              >
                Jogar
              </button>
            )}
          </div>
        </>
      )}

      {/* fase de preparação: mostra quem começa e mini contador */}
      {phase === 'prepare' && startingPlayerIndex !== null && (
        <div className="text-center space-y-4">
          <div className="text-xl font-bold">O jogador {startingPlayerIndex + 1} começa</div>
          <div className="text-sm text-gray-500">Preparando…</div>
        </div>
      )}

      {/* mini-contador 3..2..1 */}
      {phase === 'mini-countdown' && startingPlayerIndex !== null && (
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">O jogador {startingPlayerIndex + 1} começa</div>
          <div className="text-6xl font-bold">{miniCount > 0 ? miniCount : '🏁'}</div>
        </div>
      )}

      {/* discussão */}
      {phase === 'discussion' && (
        <div className="space-y-4 text-center">
          <div className="text-5xl">💬</div>
          <div className="text-lg font-semibold">Discussão</div>
          <div className="text-sm text-gray-600">Um a um, cada jogador fala uma palavra ou frase relacionada com a palavra secreta</div>

          <div className="text-3xl font-mono mt-2">{formatTime(mainSeconds)}</div>

          <div className="text-sm text-gray-600">Parem o tempo quando estiverem prontos para votar</div>

          <div className="flex justify-center">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={handleStopAndVote}
            >
              Votar
            </button>
          </div>
        </div>
      )}

      {/* final */}
      {phase === 'finished' && (
        <div className="text-center space-y-3">
          <div className="text-lg font-bold">Discussão encerrada</div>
          <div className="text-sm text-gray-600">Agora prossigam para votar.</div>
          <div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => {
                localStorage.removeItem('impostor_setup')
                router.push('/')
              }}
            >
              Voltar ao início
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
