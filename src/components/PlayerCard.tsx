// src/components/PlayerCard.tsx
'use client'
import React, { useEffect, useRef, useState } from 'react'
import { motion, PanInfo, useAnimation } from 'framer-motion'

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

/**
 * PlayerCard final (ajustado: conteúdo do card branco centralizado)
 */
export default function PlayerCard({ player, onReveal }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const controls = useAnimation()
  const revealedCalledRef = useRef(false)

  const [TOP_HEIGHT, setTopHeight] = useState<number | null>(null)
  const H_PAD = 24
  const REVEAL_THRESHOLD = 70
  const TOP_HEIGHT_MOBILE = 300

  useEffect(() => {
    function measure() {
      const small = typeof window !== 'undefined' && window.innerWidth < 380
      const suggested = small ? TOP_HEIGHT_MOBILE : 340

      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight
        const finalTop = Math.max(contentHeight, suggested)
        setTopHeight(finalTop)

        if (containerRef.current) {
          const total = finalTop + contentHeight + 28
          containerRef.current.style.height = `${total}px`
          containerRef.current.style.transform = 'none'
        }
      } else {
        setTopHeight(suggested)
        if (containerRef.current) {
          const total = suggested + 180 + 28
          containerRef.current.style.height = `${total}px`
          containerRef.current.style.transform = 'none'
        }
      }
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  function maybeCallReveal() {
    if (revealedCalledRef.current) return
    revealedCalledRef.current = true
    if (onReveal) onReveal()
  }

  function handleDrag(_: any, info: PanInfo) {
    if (info.offset.y < -REVEAL_THRESHOLD) maybeCallReveal()
  }

  async function handleDragEnd(_: any, info: PanInfo) {
    if (info.offset.y < -REVEAL_THRESHOLD) maybeCallReveal()
    await controls.start({ y: 0, transition: { type: 'spring', stiffness: 160, damping: 22 } })
  }

  if (TOP_HEIGHT === null) {
    return (
      <div ref={containerRef} className="w-full max-w-md mx-auto relative overflow-hidden" style={{ minHeight: 220 }}>
        {/* placeholder até medirmos */}
      </div>
    )
  }

  const revealDistance = TOP_HEIGHT + 20

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md mx-auto relative overflow-hidden"
      style={{ touchAction: 'pan-y', transform: 'none' }}
    >
      {/* CONTENT (fundo) — wrapper absoluto alinhado com H_PAD */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: H_PAD,
          right: H_PAD,
          zIndex: 0,
          height: TOP_HEIGHT,
        }}
      >
        {/* elemento branco com altura 100% - CENTRALIZADO */}
        <div
          ref={contentRef}
          className="reveal-card"
          style={{
            height: '100%',
            boxSizing: 'border-box',
            borderRadius: 14,
            padding: 18,
            overflow: 'hidden',
            // centraliza todo o conteúdo internamente
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div className="role-icon" aria-hidden style={{ fontSize: 36, marginBottom: 6 }}>👥</div>

          <div style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>
            {player.role === 'impostor' ? 'Impostor' : 'Civil'}
          </div>

          <div style={{ marginTop: 10, width: '100%' }}>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Sua palavra secreta é:</div>
            <div className="secret-word" style={{ marginTop: 8, fontWeight: 800, fontSize: 20 }}>
              "{player.word ?? '---'}"
            </div>
          </div>

          <div style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>
            A palavra é secreta! Dê pistas sem revelar a palavra.
          </div>
        </div>
      </div>

      {/* TOP (capa) — arrastável — tem exatamente a mesma largura do content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: -revealDistance, bottom: 0 }}
        dragElastic={0.18}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ y: 0 }}
        style={{
          position: 'absolute',
          top: 0,
          left: H_PAD,
          right: H_PAD,
          zIndex: 99999,
          touchAction: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          willChange: 'transform',
        }}
      >
        <div style={{ width: '100%', height: TOP_HEIGHT, boxSizing: 'border-box' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
              position: 'relative',
              backgroundColor: '#070707'
            }}
          >
            <img
              src="/images/spy.png"
              alt="capa"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
              draggable={false}
            />

            <div style={{
              position: 'absolute',
              left: 0, right: 0, bottom: 18,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.1 }} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 22, color: '#fff' }}>⬆️</div>
              </motion.div>

              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>
                Deslize para cima
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
