import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Header({ isNavOpen, setIsNavOpen, scrollY }) {
  const isScrolled = scrollY > 50

  return (
    <header
      id="header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '16px 20px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isScrolled
          ? 'rgba(10, 10, 10, 0.85)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled
          ? '1px solid rgba(52, 152, 219, 0.1)'
          : '1px solid transparent',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <a
          href="#home"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--color-white)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          <span style={{ color: 'var(--color-primary)' }}>{'<'}</span>
          OE
          <span style={{ color: 'var(--color-primary)' }}>{'/>'}</span>
        </a>

        {/* Desktop Nav */}
        <nav
          style={{
            display: 'none',
          }}
          className="md:!flex"
        >
          <ul
            style={{
              display: 'flex',
              listStyle: 'none',
              gap: '32px',
              alignItems: 'center',
            }}
          >
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  style={{
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'color 0.3s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.target.style.color = 'var(--color-text-secondary)')}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          id="menu-toggle"
          onClick={() => setIsNavOpen(!isNavOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-white)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
          className="md:!hidden"
        >
          {isNavOpen ? <X size={22} /> : <Menu size={22} />}
          <span>menu</span>
        </button>
      </div>
    </header>
  )
}
