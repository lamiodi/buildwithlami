import { useEffect, useRef, useState } from 'react'
import { ExternalLink, ArrowUpRight } from 'lucide-react'
import { GithubIcon } from '../UI/BrandIcons'

const projects = [
  {
    title: 'FinConnect — Banking API Platform',
    summary:
      'A comprehensive banking middleware solution connecting fintech applications with core banking systems. Real-time transaction processing with 99.9% uptime.',
    techStack: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    status: 'LIVE',
    color: '#3498DB',
  },
  {
    title: 'CloudScale — Infrastructure Dashboard',
    summary:
      'Real-time cloud infrastructure monitoring dashboard with automated scaling policies. Tracks resource utilization, cost optimization, and deployment health.',
    techStack: ['React', 'Express', 'AWS', 'D3.js'],
    status: 'LIVE',
    color: '#8b5cf6',
  },
  {
    title: 'DataVault — Analytics Engine',
    summary:
      'High-performance data pipeline and analytics engine processing millions of records daily. Custom ETL workflows with real-time visualization dashboards.',
    techStack: ['Python', 'PostgreSQL', 'React', 'Grafana'],
    status: 'IN DEV',
    color: '#06b6d4',
  },
]

export default function Projects() {
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
      id="projects"
      ref={sectionRef}
      className="section-padding"
      style={{
        position: 'relative',
        background: 'var(--color-bg)',
      }}
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
        <div style={{ marginBottom: '60px' }}>
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
              Projects
            </span>
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
            Featured{' '}
            <span className="animate-gradient-text">works</span>
          </h2>

          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '1rem',
              maxWidth: '500px',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.6s ease 0.2s',
            }}
          >
            A selection of projects that showcase my technical capabilities
          </p>
        </div>

        {/* Project Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {projects.map((project, i) => (
            <div
              key={project.title}
              className="card-glass"
              style={{
                padding: '0',
                overflow: 'hidden',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(25px)',
                transition: `all 0.6s ease ${0.1 + i * 0.12}s`,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
                className="md:!flex-row"
              >
                {/* Project image placeholder */}
                <div
                  style={{
                    minHeight: '200px',
                    background: `linear-gradient(135deg, ${project.color}15, ${project.color}08, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  className="md:!w-[280px] md:!min-h-[auto]"
                >
                  {/* Animated lines pattern */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `
                        linear-gradient(${project.color}08 1px, transparent 1px),
                        linear-gradient(90deg, ${project.color}08 1px, transparent 1px)
                      `,
                      backgroundSize: '30px 30px',
                    }}
                  />
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '3rem',
                      fontWeight: 900,
                      color: `${project.color}25`,
                      letterSpacing: '-0.03em',
                      zIndex: 1,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Project details */}
                <div
                  style={{
                    padding: '28px 24px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* Top row: status + links */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        background:
                          project.status === 'LIVE'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(245, 158, 11, 0.1)',
                        color:
                          project.status === 'LIVE' ? '#22c55e' : '#f59e0b',
                        border: `1px solid ${
                          project.status === 'LIVE'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)'
                        }`,
                      }}
                    >
                      {project.status}
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid var(--color-border)',
                          background: 'transparent',
                          color: 'var(--color-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary)'
                          e.currentTarget.style.color = 'var(--color-primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)'
                          e.currentTarget.style.color = 'var(--color-text-muted)'
                        }}
                        aria-label="View source code"
                      >
                        <GithubIcon size={14} />
                      </button>
                      <button
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid var(--color-border)',
                          background: 'transparent',
                          color: 'var(--color-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary)'
                          e.currentTarget.style.color = 'var(--color-primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)'
                          e.currentTarget.style.color = 'var(--color-text-muted)'
                        }}
                        aria-label="View live project"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--color-white)',
                    }}
                  >
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '0.9rem',
                      lineHeight: 1.7,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {project.summary}
                  </p>

                  {/* Tech Stack */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: 'auto',
                    }}
                  >
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          padding: '5px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          color: 'var(--color-text-muted)',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
