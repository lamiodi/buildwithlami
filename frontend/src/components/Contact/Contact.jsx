import { useEffect, useRef, useState } from 'react'
import { Send, Mail, MapPin, Phone } from 'lucide-react'
import { GithubIcon, LinkedinIcon, TwitterIcon } from '../UI/BrandIcons'

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState(null) // 'sending' | 'sent' | 'error'
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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('sent')
      setFormData({ full_name: '', email: '', subject: '', message: '' })
      setTimeout(() => setStatus(null), 4000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus(null), 4000)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-white)',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'all 0.3s ease',
  }

  const handleFocus = (e) => {
    e.target.style.borderColor = 'var(--color-primary)'
    e.target.style.background = 'rgba(52, 152, 219, 0.05)'
    e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)'
  }

  const handleBlur = (e) => {
    e.target.style.borderColor = 'var(--color-border)'
    e.target.style.background = 'rgba(255, 255, 255, 0.04)'
    e.target.style.boxShadow = 'none'
  }

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@odibenuah.dev' },
    { icon: MapPin, label: 'Location', value: 'Lagos, Nigeria' },
    { icon: Phone, label: 'Phone', value: '+234 XXX XXX XXXX' },
  ]

  const socials = [
    { icon: GithubIcon, href: '#', label: 'GitHub' },
    { icon: LinkedinIcon, href: '#', label: 'LinkedIn' },
    { icon: TwitterIcon, href: '#', label: 'Twitter' },
  ]

  return (
    <section
      id="contact"
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
          background:
            'linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.3), transparent)',
        }}
      />

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
              Contact
            </span>
            <div
              style={{
                width: '32px',
                height: '2px',
                background: 'var(--color-primary)',
              }}
            />
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
            Let's work{' '}
            <span className="animate-gradient-text">together</span>
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
            Have a project in mind? Let's discuss how I can help bring your
            vision to life.
          </p>
        </div>

        {/* Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px',
          }}
          className="md:!grid-cols-[1fr_320px]"
        >
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="card-glass"
            style={{
              padding: '32px 24px',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s ease 0.3s',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '16px',
              }}
              className="sm:!grid-cols-2"
            >
              <div>
                <label
                  htmlFor="full_name"
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="John Doe"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="john@example.com"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label
                htmlFor="subject"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                }}
              >
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Project inquiry"
                style={inputStyle}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label
                htmlFor="message"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                }}
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Tell me about your project..."
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: '120px',
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={status === 'sending'}
              style={{
                marginTop: '24px',
                width: '100%',
                justifyContent: 'center',
                opacity: status === 'sending' ? 0.7 : 1,
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {status === 'sending'
                  ? 'Sending...'
                  : status === 'sent'
                  ? '✓ Message Sent!'
                  : status === 'error'
                  ? 'Try Again'
                  : 'Send Message'}
                {!status && <Send size={16} />}
              </span>
            </button>
          </form>

          {/* Sidebar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s ease 0.4s',
            }}
          >
            {/* Contact Info Cards */}
            {contactInfo.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="card-glass"
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(52, 152, 219, 0.1)',
                    border: '1px solid rgba(52, 152, 219, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--color-text-muted)',
                      marginBottom: '2px',
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--color-white)',
                      fontWeight: 500,
                    }}
                  >
                    {value}
                  </div>
                </div>
              </div>
            ))}

            {/* QR Code placeholder */}
            <div
              className="card-glass"
              style={{
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  margin: '0 auto 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* QR Code pattern placeholder */}
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(11, 1fr)',
                    gridTemplateRows: 'repeat(11, 1fr)',
                    gap: '1px',
                  }}
                >
                  {Array.from({ length: 121 }).map((_, i) => {
                    // Create a realistic QR pattern
                    const row = Math.floor(i / 11)
                    const col = i % 11
                    const isCorner =
                      (row < 3 && col < 3) ||
                      (row < 3 && col > 7) ||
                      (row > 7 && col < 3)
                    const isRandom = Math.random() > 0.5
                    const isFilled = isCorner || isRandom

                    return (
                      <div
                        key={i}
                        style={{
                          background: isFilled ? '#0a0a0a' : 'transparent',
                          borderRadius: '1px',
                        }}
                      />
                    )
                  })}
                </div>
              </div>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Scan to connect
              </p>
            </div>

            {/* Social links */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
              }}
            >
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    background: 'rgba(255, 255, 255, 0.03)',
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
                    e.currentTarget.style.background =
                      'rgba(52, 152, 219, 0.1)'
                    e.currentTarget.style.transform = 'translateY(-3px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                    e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.03)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
