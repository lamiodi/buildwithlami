import { X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function MobileNav({ isOpen, setIsOpen }) {
  const handleClick = (e, href) => {
    e.preventDefault()
    setIsOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 55,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Nav Panel */}
      <nav
        id="mobile-nav"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '280px',
          height: '100vh',
          background: 'rgba(15, 15, 15, 0.98)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 60,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px 32px 40px',
        }}
      >
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          <X size={24} />
        </button>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navLinks.map((link, i) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                style={{
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  display: 'block',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border)',
                  transition: 'color 0.3s ease, padding-left 0.3s ease',
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? 'translateX(0)' : 'translateX(20px)',
                  transitionDelay: `${i * 0.05}s`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--color-primary)'
                  e.target.style.paddingLeft = '12px'
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--color-text-primary)'
                  e.target.style.paddingLeft = '0'
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 'auto' }}>
          <a
            href="#contact"
            onClick={(e) => handleClick(e, '#contact')}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>Let's Talk</span>
          </a>
        </div>
      </nav>
    </>
  )
}
