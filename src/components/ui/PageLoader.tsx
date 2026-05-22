import { motion } from 'framer-motion'

interface PageLoaderProps {
  show: boolean
  fullScreen?: boolean
}

export function PageLoader({ show, fullScreen = false }: PageLoaderProps) {
  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={
        fullScreen
          ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-pm-app gap-5'
          : 'flex flex-col items-center justify-center flex-1 py-24 gap-5'
      }
    >
      {/* Spinning ring */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-pm-teal/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-pm-teal"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' as const }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-pm-teal/10"
          animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const }}
        />
      </div>

      {/* Bouncing dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-pm-teal"
            animate={{ y: [0, -6, 0] }}
            transition={{
              delay: i * 0.12,
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
