import { useEffect, useRef, useState } from 'react'
import {
  Server,
  Monitor,
  Cloud,
  Database,
  Smartphone,
  Shield,
} from 'lucide-react'

const services = [
  {
    icon: Server,
    title: 'Backend Development',
    description:
      'Robust server-side architectures with Node.js, Express, and scalable database designs. RESTful APIs, authentication systems, and microservice patterns.',
    color: '#3498DB',
  },
  {
    icon: Monitor,
    title: 'Frontend Development',
    description:
      'Pixel-perfect, responsive user interfaces with React, Next.js, and modern CSS frameworks. Exceptional UX with smooth animations and accessibility.',
    color: '#8b5cf6',
  },
  {
    icon: Cloud,
    title: 'Cloud Engineering',
    description:
      'Cloud infrastructure on AWS, Azure, and GCP. CI/CD pipelines, containerization with Docker, and deployment automation for maximum uptime.',
    color: '#06b6d4',
  },
  {
    icon: Database,
    title: 'Data Management',
    description:
      'Database architecture, optimization, and data pipeline design. PostgreSQL, MongoDB, Redis — structured for performance and reliability.',
    color: '#22c55e',
  },
  {
    icon: Smartphone,
    title: 'Mobile Development',
    description:
      'Cross-platform mobile applications with React Native. Native-feel experiences with shared codebases for iOS and Android.',
    color: '#f59e0b',
  },
  {
    icon: Shield,
    title: 'Security & DevOps',
    description:
      'Application security hardening, penetration testing awareness, automated deployments, and infrastructure monitoring.',
    color: '#ef4444',
  },
]

export default function Services() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="services"
      ref={sectionRef}
      className="section-padding animate-gradient-bg"
      style={{ position: 'relative' }}
    >
      {/* Section separator */}
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

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.6s ease',
            }}
          >
            <div style={{ width: '32px', height: '2px', background: 'var(--color-primary)' }} />
            <span
              style={{
                color: 'var(--color-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Services
            </span>
            <div style={{ width: '32px', height: '2px', background: 'var(--color-primary)' }} />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
              fontWeight: 800,
              color: 'var(--color-white)',
              marginBottom: '12px',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
              transition: 'all 0.6s ease 0.1s',
            }}
          >
            What service do I{' '}
            <span className="animate-gradient-text">offer?</span>
          </h2>

          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '1rem',
              maxWidth: '500px',
              margin: '0 auto',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.6s ease 0.2s',
            }}
          >
            End-to-end development services tailored to your business needs
          </p>
        </div>

        {/* Service Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <div
                key={service.title}
                className="card-glass"
                style={{
                  padding: '32px 24px',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.6s ease ${0.1 + i * 0.08}s`,
                  cursor: 'default',
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-md)',
                    background: `${service.color}15`,
                    border: `1px solid ${service.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Icon size={24} style={{ color: service.color }} />
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--color-white)',
                    marginBottom: '12px',
                  }}
                >
                  {service.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
