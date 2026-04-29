import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export function LandFooter() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success("You're subscribed! We'll be in touch.")
    setEmail('')
  }

  return (
    <footer className="bg-[#0a100d] text-white">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-8 pb-10 border-b border-white/10">
          <div className="max-w-xs">
            <Link to="/" className="text-xl font-extrabold text-[#5DCAA5] tracking-tight">PitchMind</Link>
            <p className="text-white/40 text-sm mt-2 leading-relaxed">Pitch craft, in your inbox.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 items-start">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#5DCAA5] transition-colors w-56" />
            <button type="submit" className="bg-pm-teal hover:bg-pm-teal-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap">Subscribe</button>
          </form>
        </div>
        <div className="flex flex-wrap gap-6 py-8 border-b border-white/10">
          <a href="#features" className="text-sm text-white/40 hover:text-white/80 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-white/40 hover:text-white/80 transition-colors">How it works</a>
          <a href="#faq" className="text-sm text-white/40 hover:text-white/80 transition-colors">FAQ</a>
          <Link to="/login" className="text-sm text-white/40 hover:text-white/80 transition-colors">Sign in</Link>
          <Link to="/register" className="text-sm text-white/40 hover:text-white/80 transition-colors">Sign Up</Link>
        </div>
        <p className="text-white/25 text-xs pt-6">© 2025 PitchMind. All rights reserved.</p>
      </div>
    </footer>
  )
}
