'use client'

import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

const agents = [
  { label: 'Elicitation', angle: -90 },
  { label: 'Analysis', angle: 0 },
  { label: 'Specification', angle: 90 },
  { label: 'Validation', angle: 180 },
]

function getPosition(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius }
}

export default function PresentationSlide1() {
  const radius = 90
  const center = 150

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full px-8"
    >
      {/* Circular Agent Diagram */}
      <div className="relative w-[300px] h-[300px] mb-8">
        <svg
          viewBox="0 0 300 300"
          className="absolute inset-0 w-full h-full"
          fill="none"
        >
          {/* Circular arrows */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="rgba(232, 111, 40, 0.7)" />
            </marker>
          </defs>
          {/* Arc paths connecting agents clockwise */}
          {/* Top -> Right */}
          <path
            d={`M ${center + 30} ${center - radius + 10} A ${radius - 10} ${radius - 10} 0 0 1 ${center + radius - 10} ${center - 30}`}
            stroke="rgba(232, 111, 40, 0.5)"
            strokeWidth="2"
            strokeDasharray="6 4"
            markerEnd="url(#arrowhead)"
          />
          {/* Right -> Bottom */}
          <path
            d={`M ${center + radius - 10} ${center + 30} A ${radius - 10} ${radius - 10} 0 0 1 ${center + 30} ${center + radius - 10}`}
            stroke="rgba(232, 111, 40, 0.5)"
            strokeWidth="2"
            strokeDasharray="6 4"
            markerEnd="url(#arrowhead)"
          />
          {/* Bottom -> Left */}
          <path
            d={`M ${center - 30} ${center + radius - 10} A ${radius - 10} ${radius - 10} 0 0 1 ${center - radius + 10} ${center + 30}`}
            stroke="rgba(232, 111, 40, 0.5)"
            strokeWidth="2"
            strokeDasharray="6 4"
            markerEnd="url(#arrowhead)"
          />
          {/* Left -> Top */}
          <path
            d={`M ${center - radius + 10} ${center - 30} A ${radius - 10} ${radius - 10} 0 0 1 ${center - 30} ${center - radius + 10}`}
            stroke="rgba(232, 111, 40, 0.5)"
            strokeWidth="2"
            strokeDasharray="6 4"
            markerEnd="url(#arrowhead)"
          />
        </svg>

        {/* Agent icons positioned around the circle */}
        {agents.map((agent, i) => {
          const pos = getPosition(agent.angle, radius)
          return (
            <motion.div
              key={agent.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
              className="absolute flex flex-col items-center"
              style={{
                left: center + pos.x - 28,
                top: center + pos.y - 28,
              }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#E86F28] to-[#C55A1E] flex items-center justify-center shadow-lg shadow-orange-900/30">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-gray-300 whitespace-nowrap">
                {agent.label}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E86F28] to-[#C55A1E] flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            CONREQ Multi-Agent
          </h2>
        </div>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
          A multi-agent system for conjectural requirements engineering, combining elicitation, analysis, specification, and validation.
        </p>
      </motion.div>
    </motion.div>
  )
}
