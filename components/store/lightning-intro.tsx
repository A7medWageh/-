'use client'

import { useState, useEffect } from 'react'

export function LightningIntro() {
  const [show, setShow] = useState(true)
  const [bolt, setBolt] = useState(false)

  useEffect(() => {
    // Trigger bolt after a short delay
    const boltTimer = setTimeout(() => {
      setBolt(true)
    }, 300)

    // Hide intro after 2 seconds
    const hideTimer = setTimeout(() => {
      setShow(false)
    }, 2000)

    return () => {
      clearTimeout(boltTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none">
      {/* Background Flash */}
      <div className="absolute inset-0 animate-thunder-flash" />
      
      {/* Lightning Bolt */}
      {bolt && (
        <svg 
          className="absolute h-full w-full pointer-events-none opacity-0 animate-lightning-bolt" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <path 
            d="M 50 0 L 45 40 L 55 35 L 50 100" 
            className="stroke-white stroke-[0.5] fill-none"
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      )}

      {/* Extreme Flash Effect Overlay */}
      <div className="absolute inset-0 bg-white/0 mix-blend-overlay animate-lightning" />
    </div>
  )
}
