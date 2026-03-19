'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import PresentationSlide1 from './PresentationSlide1'
import PresentationSlide2 from './PresentationSlide2'

const SLIDE_COUNT = 2
const AUTO_ROTATE_MS = 15000

export default function PresentationPanel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDE_COUNT)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextSlide, AUTO_ROTATE_MS)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <div className="hidden lg:flex w-1/2 flex-col relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#162033] to-[#1E293B]">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#E86F28]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#E86F28]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {currentSlide === 0 ? (
            <PresentationSlide1 key="slide-1" />
          ) : (
            <PresentationSlide2 key="slide-2" />
          )}
        </AnimatePresence>
      </div>

      {/* Dot Indicators */}
      <div className="relative z-10 flex items-center justify-center gap-2 pb-8">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === i
                ? 'w-8 bg-[#E86F28]'
                : 'w-2 bg-gray-500/50 hover:bg-gray-400/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
