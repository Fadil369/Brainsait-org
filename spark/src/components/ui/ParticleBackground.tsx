// Premium Particle Background - floating particles effect
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

interface ParticleBackgroundProps {
  density?: number
  color?: string
  children?: ReactNode
}

export function ParticleBackground({ 
  density = 20, 
  color = '#0c9eeb',
  children 
}: ParticleBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles = Array.from({ length: density }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
    }))
    setParticles(newParticles)
  }, [density])

  return (
    <div className="relative overflow-hidden">
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: color,
              opacity: particle.opacity,
            }}
            animate={{
              y: [-20, 20],
              x: [0, Math.random() * 30 - 15],
              opacity: [particle.opacity, particle.opacity * 0.3, particle.opacity],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>
      
      {/* Children */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}

// Glow Orb - floating glow effect
interface GlowOrbProps {
  size?: number
  color?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  intensity?: number
}

export function GlowOrb({ 
  size = 200, 
  color = '#0c9eeb',
  position = 'bottom-right',
  intensity = 15,
}: GlowOrbProps) {
  const positionStyles = {
    'top-left': { top: -size / 2, left: -size / 2 },
    'top-right': { top: -size / 2, right: -size / 2 },
    'bottom-left': { bottom: -size / 2, left: -size / 2 },
    'bottom-right': { bottom: -size / 2, right: -size / 2 },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  }

  return (
    <div 
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity: intensity / 100,
        ...positionStyles[position],
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// Star field effect
interface StarFieldProps {
  count?: number
  children?: ReactNode
}

export function StarField({ count = 50, children }: StarFieldProps) {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([])

  useEffect(() => {
    const newStars = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 3 + 2,
    }))
    setStars(newStars)
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: 0.3,
          }}
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}

export default ParticleBackground