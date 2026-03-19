'use client'

import { motion } from 'framer-motion'
import { Bot, MessageSquare, Monitor, ClipboardList, ArrowLeftRight } from 'lucide-react'

export default function PresentationSlide2() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full px-8"
    >
      {/* Illustration: Chatbots interacting with UI */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative w-[300px] h-[220px] mb-10"
      >
        {/* Central Monitor */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-24 h-20 rounded-xl border-2 border-gray-500/40 bg-gray-800/50 flex items-center justify-center shadow-lg">
            <Monitor className="w-10 h-10 text-gray-300" />
          </div>
          {/* Monitor stand */}
          <div className="w-8 h-2 bg-gray-600/40 rounded-b mx-auto" />
          <div className="w-14 h-1.5 bg-gray-600/30 rounded mx-auto" />
        </div>

        {/* Bot 1 - Top Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="absolute left-2 top-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E86F28] to-[#C55A1E] flex items-center justify-center shadow-lg shadow-orange-900/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="mt-1 flex items-center gap-0.5">
            <MessageSquare className="w-3 h-3 text-orange-400/60" />
            <MessageSquare className="w-3 h-3 text-orange-400/40" />
          </div>
        </motion.div>

        {/* Bot 2 - Top Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="absolute right-2 top-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E86F28] to-[#C55A1E] flex items-center justify-center shadow-lg shadow-orange-900/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="mt-1 flex items-center justify-end gap-0.5">
            <MessageSquare className="w-3 h-3 text-orange-400/40" />
            <MessageSquare className="w-3 h-3 text-orange-400/60" />
          </div>
        </motion.div>

        {/* Bot 3 - Bottom Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="absolute left-8 bottom-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E86F28] to-[#C55A1E] flex items-center justify-center shadow-lg shadow-orange-900/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Bot 4 - Bottom Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="absolute right-8 bottom-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E86F28] to-[#C55A1E] flex items-center justify-center shadow-lg shadow-orange-900/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Connecting arrows */}
        <svg viewBox="0 0 300 220" className="absolute inset-0 w-full h-full" fill="none">
          {/* Left bots to monitor */}
          <path d="M 70 45 L 115 90" stroke="rgba(232,111,40,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M 80 175 L 120 130" stroke="rgba(232,111,40,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
          {/* Right bots to monitor */}
          <path d="M 230 45 L 185 90" stroke="rgba(232,111,40,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M 220 175 L 180 130" stroke="rgba(232,111,40,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
      </motion.div>

      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <h2 className="text-xl font-bold text-white leading-tight max-w-[240px]">
            A Team of Agents That Interacts with the UI
          </h2>
        </div>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
          Intelligent agents collaborate in real time through the interface, assisting each step of the requirements engineering process.
        </p>
      </motion.div>
    </motion.div>
  )
}
