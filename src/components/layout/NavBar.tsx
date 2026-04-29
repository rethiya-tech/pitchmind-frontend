import { Link } from 'react-router-dom'

export function NavBar() {
  return (
    <nav className="bg-pm-surface border-b border-pm-border px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-pm-teal font-bold text-xl">
        PitchMind
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm text-pm-muted hover:text-pm-primary transition-colors">
          Sign in
        </Link>
        <Link
          to="/register"
          className="text-sm bg-pm-teal hover:bg-pm-teal-hover text-white px-4 py-2 rounded-lg transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  )
}
