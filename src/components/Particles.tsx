'use client'

import { useEffect } from 'react'

export default function Particles() {
  useEffect(() => {
    const createParticles = () => {
      const particlesContainer = document.querySelector('.particles')
      const colors = ['#00a8ff', '#9c27b0', '#ff4081']
      
      if (particlesContainer) {
        particlesContainer.innerHTML = ''
        
        for (let i = 0; i < 20; i++) {
          const particle = document.createElement('div')
          particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.2};
            animation: particleMove ${Math.random() * 20 + 10}s linear infinite;
            animation-delay: -${Math.random() * 20}s;
          `
          particlesContainer.appendChild(particle)
        }
      }
    }

    createParticles()

    // Recreate particles on resize for better responsiveness
    const handleResize = () => {
      createParticles()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return null
}