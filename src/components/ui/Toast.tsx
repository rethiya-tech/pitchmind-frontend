import { Toaster } from 'react-hot-toast'

export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgb(var(--pm-surface))',
          color: 'rgb(var(--pm-text-primary))',
          border: '1px solid var(--pm-border)',
          borderRadius: '12px',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          boxShadow: 'var(--pm-shadow-card)',
        },
        success: { iconTheme: { primary: 'rgb(var(--pm-success))', secondary: 'rgb(var(--pm-surface))' } },
        error: { iconTheme: { primary: 'rgb(var(--pm-danger))', secondary: 'rgb(var(--pm-surface))' } },
      }}
    />
  )
}
