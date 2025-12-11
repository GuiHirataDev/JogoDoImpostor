// src/components/PlayerCard.tsx
'use client'
import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

type Player = {
  id?: number
  name?: string
  role?: 'civil' | 'impostor'
  word?: string
}

type Props = {
  player: Player
  onReveal?: () => void
}

export default function PlayerCard({ player, onReveal }: Props) {
  const [revealed, setRevealed] = useState(false)
  const startY = useRef<number | null>(null)

  function handleReveal() {
    if (!revealed) {
      setRevealed(true)
      if (onReveal) onReveal()
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const endY = e.changedTouches[0].clientY
    if (startY.current !== null && startY.current - endY > 40) {
      handleReveal()
    }
    startY.current = null
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleReveal()
    }
  }

  return (
    <div className="w-full">
      <div
        className="relative overflow-hidden rounded-2xl h-52 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Overlay / card oculto */}
        {!revealed && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleReveal}
            onKeyDown={handleKey}
            aria-label="Deslize para cima ou clique para revelar sua palavra"
            className="absolute inset-0 bg-gray-800 text-white flex flex-col items-center justify-center p-6"
          >
            <div className="text-lg font-medium mb-2">Deslize para cima</div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.1 }}
              className="text-2xl mb-3"
            >
              ⬆️
            </motion.div>

            <div className="text-sm text-gray-200">Passe o dispositivo para o próximo jogador</div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleReveal() }}
              className="mt-4 px-3 py-2 bg-white text-gray-800 rounded"
            >
              Revelar (clique)
            </button>
          </div>
        )}

        {/* Card revelado */}
        {revealed && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className={`text-5xl ${player.role === 'impostor' ? 'text-red-600' : 'text-blue-600'}`}>
              {player.role === 'impostor' ? '🎩🕶️' : '👥'}
            </div>

            <div className="font-bold text-lg mt-3">{player.role === 'impostor' ? 'Impostor' : 'Civil'}</div>

            <div className="mt-4 text-sm">
              Sua palavra secreta é <span className="font-semibold">"{player.word}"</span>
            </div>

            <div className="text-xs text-gray-500 mt-2">A palavra é secreta! Dê pistas sem revelar a palavra.</div>
          </div>
        )}
      </div>
    </div>
  )
}
