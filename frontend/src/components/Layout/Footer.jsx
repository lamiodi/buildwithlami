import { Heart } from 'lucide-react'
import { GithubIcon, LinkedinIcon, TwitterIcon } from '../UI/BrandIcons'

export default function Footer() {
  return (
    <footer
      id="footer"
      style={{
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
        padding: '60px 20px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient line at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--color-primary), var(--color-accent-cyan), var(--color-primary), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite',
        }}
      />

      {/* Large brand text */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 8vw, 4.5rem)',
          fontWeight: 900,
          letterSpacing: '0.05em',
          lineHeight: 1.1,
          marginBottom: '32px',
        }}
        className="animate-gradient-text"
      >
        BUILDWITHLAMI™
      </div>

      {/* Social links */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {[
          { icon: GithubIcon, href: '#', label: 'GitHub' },
          { icon: LinkedinIcon, href: '#', label: 'LinkedIn' },
          { icon: TwitterIcon, href: '#', label: 'Twitter' },
        ].map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
              e.currentTarget.style.color = 'var(--color-primary)'
              e.currentTarget.style.background = 'rgba(52, 152, 219, 0.1)'
              e.currentTarget.style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Icon size={20} />
          </a>
        ))}
      </div>

      {/* Copyright */}
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        © {new Date().getFullYear()} Odibenuah Eugene. Built with
        <Heart size={14} style={{ color: 'var(--color-primary)' }} />
      </p>
    </footer>
  )
}
