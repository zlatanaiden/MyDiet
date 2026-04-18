import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Leaf, User, ArrowRightLeft, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const links = [
  { to: '/', label: 'Homepage' },
  { to: '/plan', label: 'Plan' },
  { to: '/identifier', label: 'Identifier' },
  { to: '/community', label: 'Community' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { signOut } = useApp()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className="glass sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-white/10 px-6 lg:px-12">
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-8">
        <div className="flex cursor-pointer items-center gap-2.5" onClick={() => navigate('/')}>
          <Leaf className="h-7 w-7 text-[#4ADE80]" />
          <span className="text-[22px] font-bold tracking-tight text-white">MyDiet</span>
        </div>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-[14px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#4ADE8025] text-[#4ADE80]'
                    : 'text-white/50 hover:text-white/80'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Right: Avatar with dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => navigate('/profile')}
          onMouseEnter={() => setShowMenu(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#4ADE80] to-[#22D3EE] transition-transform hover:scale-105"
        >
          <User className="h-5 w-5 text-white" />
        </button>

        {showMenu && (
          <div
            onMouseLeave={() => setShowMenu(false)}
            className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e]/95 shadow-2xl backdrop-blur-xl"
          >
            <button
              onClick={() => { setShowMenu(false); signOut(); navigate('/login', { replace: true }) }}
              className="flex w-full items-center gap-3 px-4 py-3 text-[13px] text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Change Account
            </button>
            <button
              onClick={() => { setShowMenu(false); signOut(); navigate('/login', { replace: true }) }}
              className="flex w-full items-center gap-3 px-4 py-3 text-[13px] text-[#F87171]/80 transition hover:bg-[#F87171]/10 hover:text-[#F87171]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
