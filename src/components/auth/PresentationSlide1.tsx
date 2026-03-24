'use client'

import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

const coordinator = { label: 'Coordinator', x: 210, y: 24 }

const agents = [
  { label: 'Elicitation', x: 90, y: 228 },
  { label: 'Analysis', x: 170, y: 228 },
  { label: 'Specification', x: 250, y: 228 },
  { label: 'Validation', x: 330, y: 228 },
]

export default function PresentationSlide1() {
  const branchY = 124
  const coordinatorBoxBottomY = coordinator.y + 28

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full px-8"
    >
      {/* Hierarchical Agent Diagram */}
      <div className="relative w-105 h-75 mb-8">
        <svg
          viewBox="0 0 420 300"
          className="absolute inset-0 w-full h-full"
          fill="none"
        >
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

          {/* Single flow from coordinator that branches to each agent */}
          <line
            x1={coordinator.x}
            y1={coordinatorBoxBottomY}
            x2={coordinator.x}
            y2={branchY}
            stroke="rgba(232, 111, 40, 0.55)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <line
            x1={coordinator.x}
            y1={branchY}
            x2={coordinator.x}
            y2={coordinatorBoxBottomY}
            stroke="rgba(232, 111, 40, 0.55)"
            strokeWidth="2"
            strokeDasharray="6 4"
            markerEnd="url(#arrowhead)"
          />
          <line
            x1={agents[0].x}
            y1={branchY}
            x2={agents[3].x}
            y2={branchY}
            stroke="rgba(232, 111, 40, 0.55)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          {agents.map((agent) => (
            <line
              key={agent.label}
              x1={agent.x}
              y1={branchY}
              x2={agent.x}
              y2={agent.y - 32}
              stroke="rgba(232, 111, 40, 0.55)"
              strokeWidth="2"
              strokeDasharray="6 4"
              markerEnd="url(#arrowhead)"
            />
          ))}
        </svg>

        {/* Coordinator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="absolute"
          style={{ left: coordinator.x - 28, top: coordinator.y - 28 }}
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-orange-300 whitespace-nowrap">
            {coordinator.label}
          </span>
          <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-orange-900/30 ring-2 ring-orange-300/40">
            <Bot className="w-7 h-7 text-white" />
          </div>
        </motion.div>

        {/* Subordinate agents */}
        {agents.map((agent, i) => {
          return (
            <motion.div
              key={agent.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.12, duration: 0.4 }}
              className="absolute flex flex-col items-center"
              style={{
                left: agent.x - 28,
                top: agent.y - 28,
              }}
            >
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-orange-900/30">
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
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-primary-dark flex items-center justify-center">
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
