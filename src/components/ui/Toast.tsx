import { Toaster } from 'react-hot-toast'

export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#1A1A1A',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        },
        success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
        error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
      }}
    />
  )
}
