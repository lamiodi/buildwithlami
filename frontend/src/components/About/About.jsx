import { useEffect, useRef, useState } from 'react'
import { Code2, Briefcase, GraduationCap } from 'lucide-react'

const stats = [
  { value: '3+', label: 'Years Experience' },
  { value: '20+', label: 'Projects Built' },
  { value: '10+', label: 'Happy Clients' },
]

export default function About() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section-padding"
      style={{
        position: 'relative',
        background: 'var(--color-bg)',
      }}
    >
      {/* Section separator gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.3), transparent)',
        }}
      />

      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* Section label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
            transition: 'all 0.6s ease',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '2px',
              background: 'var(--color-primary)',
            }}
          />
          <span
            style={{
              color: 'var(--color-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            About Me
          </span>
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '24px',
            color: 'var(--color-white)',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.6s ease 0.1s',
          }}
        >
          Build engineer &{' '}
          <span style={{ color: 'var(--color-primary)' }}>financial solutions</span>{' '}
          architect
        </h2>

        {/* Bio */}
        <p
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.8,
            color: 'var(--color-text-secondary)',
            marginBottom: '40px',
            maxWidth: '700px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.6s ease 0.2s',
          }}
        >
          I'm a passionate full-stack developer specializing in building 
          robust financial and banking applications. With expertise spanning 
          backend architecture, frontend interfaces, cloud infrastructure, 
          and data management — I transform complex business requirements 
          into elegant, scalable digital solutions that drive real results.
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.3s',
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="card-glass"
              style={{
                padding: '24px 16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                  fontWeight: 800,
                  marginBottom: '4px',
                }}
                className="animate-gradient-text"
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-text-muted)',
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
