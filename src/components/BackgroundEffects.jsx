import { useEffect, useState } from 'react'

export const FloatingParticles = () => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-[#3ecf8e] rounded-full animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.speed * 4}s`,
            animationDelay: `${particle.id * 0.1}s`
          }}
        />
      ))}
    </div>
  )
}

export const GridPattern = () => (
  <div className="absolute inset-0 opacity-5">
    <svg
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid"
          width="50"
          height="50"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 50 0 L 0 0 0 50"
            fill="none"
            stroke="#3ecf8e"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
)

export const GlowOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#3ecf8e] opacity-10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-[#3ecf8e] opacity-15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-[#3ecf8e] opacity-20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
  </div>
)
