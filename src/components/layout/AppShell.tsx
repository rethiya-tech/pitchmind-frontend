import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  return (
    <div className="flex h-screen bg-pm-app overflow-hidden">
      {/* Padding wrapper so sidebar floats as a rounded glass panel */}
      <div className="p-3 pr-0 flex-shrink-0 flex">
        <Sidebar open={sidebarOpen} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="absolute inset-0 overflow-y-auto p-6 flex flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
