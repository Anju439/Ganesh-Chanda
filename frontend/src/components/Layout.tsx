import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/donors', label: 'Donors' },
  { to: '/donations', label: 'Donations' },
]

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-[#edd8b8] bg-[#fffdf8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-3 no-underline">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#6b1d12] text-lg text-[#e8a317]">
              ॐ
            </span>
            <span>
              <span className="font-display block text-lg leading-none text-[#6b1d12]">
                Ganesh Chanda
              </span>
              <span className="text-xs tracking-wide text-[#7a5a4a]">
                Donation management
              </span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold no-underline ${
                    isActive
                      ? 'bg-[#6b1d12] text-[#fff8ea]'
                      : 'text-[#6b1d12] hover:bg-[#f6e6c8]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/donors/new"
              className="ml-2 rounded-full bg-[#e07a2f] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#c9651d]"
            >
              Register donor
            </NavLink>
          </nav>

          <button
            type="button"
            className="rounded-lg p-2 text-[#6b1d12] md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <div className="flex flex-col gap-1 border-t border-[#edd8b8] px-4 py-3 md:hidden">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-[#6b1d12] no-underline hover:bg-[#f6e6c8]"
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/donors/new"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-[#e07a2f] px-3 py-2 text-center font-semibold text-white no-underline"
            >
              Register donor
            </NavLink>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}
