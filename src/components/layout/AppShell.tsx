import { useState, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex h-screen bg-pm-app overflow-hidden">
      {/* Padding wrapper so sidebar floats as a rounded glass panel */}
      <div className="p-3 pr-0 flex-shrink-0 flex">
        <Sidebar open={sidebarOpen} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 overflow-hidden">
          {/* Stable scroll container — persists across route changes so we can reset scrollTop */}
          <div ref={scrollRef} className="h-full overflow-y-auto">
            <AnimatePresence
              mode="wait"
              initial={false}
              onExitComplete={() => { if (scrollRef.current) scrollRef.current.scrollTop = 0 }}
            >
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="min-h-full p-6 flex flex-col"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
