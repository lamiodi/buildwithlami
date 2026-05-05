import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ChevronRight } from 'lucide-react'

const roles = [
  'Backend Developer',
  'Frontend Developer',
  'Cloud Developer',
  'Data Manager',
]

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      id="home"
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '100px 20px 60px',
      }}
    >
      {/* Animated gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1520 25%, #0a1628 50%, #12081f 75%, #0a0a0a 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 12s ease infinite',
          zIndex: 0,
        }}
      />

      {/* Floating gradient orbs */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52, 152, 219, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'gradientPulse 4s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'gradientPulse 5s ease-in-out infinite 1s',
          zIndex: 0,
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(52, 152, 219, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52, 152, 219, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '800px',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Profile Image */}
        <div
          style={{
            width: '160px',
            height: '160px',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            border: '3px solid rgba(52, 152, 219, 0.3)',
            position: 'relative',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.8)',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Placeholder image using gradient */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 6s ease infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--color-primary)',
            }}
          >
            OE
          </div>
          {/* Animated border glow */}
          <div
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: 'var(--radius-xl)',
              border: '2px solid transparent',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-purple), var(--color-accent-cyan)) border-box',
              WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              animation: 'gradientShift 3s ease infinite',
              backgroundSize: '200% 200%',
            }}
          />
        </div>

        {/* Status badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(52, 152, 219, 0.1)',
            border: '1px solid rgba(52, 152, 219, 0.2)',
            fontSize: '0.82rem',
            color: 'var(--color-primary-light)',
            fontWeight: 500,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.6s ease 0.2s',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: -3,
                borderRadius: '50%',
                border: '2px solid #22c55e',
                animation: 'pulse-ring 1.5s ease-out infinite',
              }}
            />
          </span>
          Available for Projects
        </div>

        {/* Name */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 10vw, 5rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
          }}
          className="animate-gradient-text"
        >
          ODIBENUAH
          <br />
          EUGENE
        </h1>

        {/* Role Tags */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.6s ease 0.5s',
          }}
        >
          {roles.map((role, i) => (
            <span
              key={role}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border-light)',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                background: 'rgba(255, 255, 255, 0.03)',
                transition: 'all 0.3s ease',
                cursor: 'default',
                animationDelay: `${i * 0.1}s`,
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--color-primary)'
                e.target.style.color = 'var(--color-primary)'
                e.target.style.background = 'rgba(52, 152, 219, 0.08)'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--color-border-light)'
                e.target.style.color = 'var(--color-text-secondary)'
                e.target.style.background = 'rgba(255, 255, 255, 0.03)'
              }}
            >
              {role}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '8px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.6s ease 0.7s',
          }}
        >
          <a href="#projects" className="btn-primary">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Explore Portfolio
              <ChevronRight size={18} />
            </span>
          </a>
          <a href="#contact" className="btn-outline">
            Get In Touch
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          opacity: 0.5,
          animation: 'floatUp 2s ease-in-out infinite alternate',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}
        >
          Scroll
        </span>
        <ArrowDown size={16} style={{ color: 'var(--color-primary)' }} />
      </div>
    </section>
  )
}
