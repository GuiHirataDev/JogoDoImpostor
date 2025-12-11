// src/app/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { packs as ALL_PACKS } from '../data/packs'
import spy from '../public/images/spy.png'

type SetupState = {
  numPlayers: number
  impostors: number
  selectedPacks: string[]
  duration: number
  names: string[]
}

const DEFAULT: SetupState = {
  numPlayers: 4,
  impostors: 1,
  selectedPacks: ['animais'],
  duration: 5,
  names: Array.from({ length: 4 }, (_, i) => `Jogador ${i + 1}`)
}

function readSetup(): SetupState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('impostor_setup')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default function Home() {
  const router = useRouter()
  const [setup, setSetup] = useState<SetupState>(DEFAULT)

  useEffect(() => {
    const s = readSetup()
    if (s) {
      // merge with defaults so campos faltantes não causem problemas
      setSetup({ ...DEFAULT, ...s })
    } else {
      setSetup(DEFAULT)
    }
  }, [])

  // salva em localStorage e state
  function save(update: Partial<SetupState>) {
    const next = { ...setup, ...update }
    setSetup(next)
    try { localStorage.setItem('impostor_setup', JSON.stringify(next)) } catch (e) { console.warn('Falha ao salvar setup', e) }
  }

  // decrement/increment impostors (respeita limites)
  function decImpostors() {
    if (setup.impostors <= 1) return
    save({ impostors: setup.impostors - 1 })
  }
  function incImpostors() {
    if (setup.impostors >= setup.numPlayers - 1) return
    save({ impostors: setup.impostors + 1 })
  }

  function openPlayers() { router.push('/setup/players') }
  function openPacks() { router.push('/setup/packs') }
  function openDuration() { router.push('/setup/duration') }

  // ********** FUNÇÃO RESILIENTE DE INICIAR JOGO **********
  function startGame() {
    try {
      // verifica se já existe setup válido
      let current = readSetup()

      // se não existir, cria um setup padrão com os valores atuais da UI
      if (!current) {
        current = {
          numPlayers: setup.numPlayers ?? DEFAULT.numPlayers,
          impostors: setup.impostors ?? DEFAULT.impostors,
          selectedPacks: setup.selectedPacks && setup.selectedPacks.length ? setup.selectedPacks : DEFAULT.selectedPacks,
          duration: setup.duration ?? DEFAULT.duration,
          names: setup.names && setup.names.length ? setup.names : DEFAULT.names
        }
        try { localStorage.setItem('impostor_setup', JSON.stringify(current)) } catch (e) { console.warn('Falha ao salvar setup padrão', e) }
      }

      // quick sanity: ensure there are pack words present; if not, fallback to ALL_PACKS.animais
      try {
        const packWords = (current.selectedPacks ?? DEFAULT.selectedPacks).flatMap(pk => {
          const p = (ALL_PACKS as any)[pk]
          return Array.isArray(p) ? p : []
        })
        if (!packWords || packWords.length === 0) {
          // garante pelo menos o pack 'animais'
          current.selectedPacks = ['animais']
          localStorage.setItem('impostor_setup', JSON.stringify(current))
        }
      } catch {
        // ignore, guarantee animals pack
        current.selectedPacks = ['animais']
        try { localStorage.setItem('impostor_setup', JSON.stringify(current)) } catch {}
      }

      // Tudo pronto, tenta navegar para /game
      router.push('/game')
    } catch (err) {
      // fallback duro
      console.warn('router.push falhou — fallback para /game', err)
      if (typeof window !== 'undefined') window.location.href = '/game'
    }
  }

  const packsCount = setup.selectedPacks?.length ?? 0

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4 pt-8 pb-28 flex-1">
        <div className="max-w-xl mx-auto">

          {/* topo */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden card-surface flex items-center justify-center">
              <Image src={spy} alt="Espião" width={160} height={160} priority style={{ objectFit: 'cover' }} />
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-red-400">Impostor</h1>
            <p className="text-sm text-gray-400">Jogue presencial com os amigos — passe o aparelho e divirta-se</p>
          </div>

          {/* grid cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Jogadores */}
            <button onClick={openPlayers} className="rounded-2xl p-4 card-surface flex flex-col items-start justify-between">
              <div className="text-2xl">👥</div>
              <div className="mt-2">
                <div className="kv-label">Jogadores</div>
                <div className="kv-value text-lg">{setup.numPlayers}</div>
              </div>
            </button>

            {/* Impostores */}
            <div className="rounded-2xl p-4 card-surface flex flex-col items-start justify-between">
              <div className="text-2xl">🎭</div>
              <div className="mt-2 w-full flex items-center justify-between">
                <div>
                  <div className="kv-label">Impostores</div>
                  <div className="kv-value text-lg">{setup.impostors}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={decImpostors} className="px-3 py-1 rounded bg-black/20">-</button>
                  <button onClick={incImpostors} className="px-3 py-1 rounded bg-black/20">+</button>
                </div>
              </div>
            </div>

            {/* Pacotes */}
            <button onClick={openPacks} className="rounded-2xl p-4 card-surface flex flex-col items-start justify-between">
              <div className="text-2xl">📦</div>
              <div className="mt-2">
                <div className="kv-label">Pacotes</div>
                <div className="kv-value text-lg">{packsCount} Pacote{packsCount !== 1 ? 's' : ''}</div>
              </div>
            </button>

            {/* Duração */}
            <button onClick={openDuration} className="rounded-2xl p-4 card-surface flex flex-col items-start justify-between">
              <div className="text-2xl">⏱️</div>
              <div className="mt-2">
                <div className="kv-label">Duração</div>
                <div className="kv-value text-lg">{setup.duration} min</div>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* big start button fixed */}
      <div className="fixed left-0 right-0 bottom-4 px-4">
        <div className="max-w-xl mx-auto">
          <button onClick={startGame} className="w-full py-4 rounded-full btn-primary-fixed text-lg font-bold text-white">
            Iniciar Jogo
          </button>
        </div>
      </div>
    </div>
  )
}
