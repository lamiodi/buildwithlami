import React from 'react';
import { motion } from 'framer-motion';
import './TechStack.css';

// iconOnly: true = show ONLY the HD logo (no text label), renders as a square card
// iconOnly: false or missing = show text label with accent dot, renders as a wide card
const techStack = [
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', iconOnly: true },
  { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg', iconOnly: true },
  { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg', iconOnly: true },
  { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg', iconOnly: true },
  { name: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', iconOnly: true },
  { name: 'Supabase', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg', iconOnly: true },
  { name: 'Vite', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg', iconOnly: true },
  { name: 'Express', icon: '' },
  { name: 'Paystack', icon: '' },
  { name: 'Framer Motion', icon: '' }
];

// Deterministic placement so cards don't "teleport" on every render
// and we don't need a physics engine. A small jitter on x/y gives
// the floating layout its visual character.
const positions = [
  { x: '8%',  y: '20%' },
  { x: '32%', y: '65%' },
  { x: '58%', y: '18%' },
  { x: '78%', y: '58%' },
  { x: '14%', y: '72%' },
  { x: '46%', y: '40%' },
  { x: '70%', y: '78%' },
  { x: '24%', y: '12%' },
  { x: '52%', y: '78%' },
  { x: '86%', y: '32%' },
];

const floatVariants = {
  initial: { opacity: 0, y: 14, scale: 0.96 },
  float: (i) => ({
    opacity: 1,
    y: [0, -6, 0],
    scale: 1,
    transition: {
      opacity: { duration: 0.5, delay: i * 0.05 },
      y: {
        duration: 4 + (i % 3),
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
        delay: i * 0.2,
      },
    },
  }),
  hover: { scale: 1.06, y: -4 },
  tap:   { scale: 0.97, y: 2 },
};

const TechStack = () => {
  return (
    <section className="tech-stack-section font-body" aria-label="Technology Stack Showcase">
      <div className="grid-pattern"></div>

      <div className="section-header">
        <div className="section-label">Core Stack</div>
        <h2 className="section-title text-white">What Powers My Builds</h2>
      </div>

      <div id="scene">
        {techStack.map((tech, index) => {
          const isIconOnly = tech.iconOnly && tech.icon;
          const pos = positions[index % positions.length];

          return (
            <motion.div
              key={tech.name}
              className={isIconOnly ? 'tech-card icon-only' : 'tech-card'}
              role="button"
              aria-label={`${tech.name} technology card`}
              tabIndex={0}
              style={{ left: pos.x, top: pos.y, position: 'absolute' }}
              custom={index}
              variants={floatVariants}
              initial="initial"
              animate="float"
              whileHover="hover"
              whileTap="tap"
              drag
              dragMomentum={false}
              dragElastic={0.2}
            >
              {isIconOnly ? (
                <img src={tech.icon} alt={tech.name} className="tech-logo" />
              ) : (
                <>
                  <div className="accent-dot"></div>
                  <span>{tech.name}</span>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default TechStack;
