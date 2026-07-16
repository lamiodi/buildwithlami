import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
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

const ICON_CARD_SIZE = 64;   // square cards for icon-only
const TEXT_CARD_W = 180;     // wide cards for text
const TEXT_CARD_H = 56;

const TechStack = () => {
  const sceneRef = useRef(null);
  const sectionRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);

  useEffect(() => {
    if (!sceneRef.current || !sectionRef.current) return;

    const Engine = Matter.Engine,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint,
          Events = Matter.Events,
          Runner = Matter.Runner;

    const scene = sceneRef.current;
    const section = sectionRef.current;
    
    // Clear existing scene if any
    scene.innerHTML = '';

    let width = section.offsetWidth;
    let height = section.offsetHeight;

    const engine = Engine.create();
    engineRef.current = engine;
    engine.world.gravity.y = 0.02;

    const wallThickness = 100;

    const walls = [
      Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, { isStatic: true, restitution: 0.9, friction: 0.1 }),
      Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, { isStatic: true, restitution: 0.9, friction: 0.1 }),
      Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: 0.9, friction: 0.1 }),
      Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: 0.9, friction: 0.1 })
    ];

    Composite.add(engine.world, walls);

    const cards = [];
    const cardElements = [];
    const padding = 60;

    techStack.forEach((tech, index) => {
      const label = tech.name;
      const isIconOnly = tech.iconOnly && tech.icon;
      const cw = isIconOnly ? ICON_CARD_SIZE : TEXT_CARD_W;
      const ch = isIconOnly ? ICON_CARD_SIZE : TEXT_CARD_H;

      const x = padding + Math.random() * (width - cw - padding * 2);
      const y = padding + Math.random() * (height - ch - padding * 2);

      const body = Bodies.rectangle(x, y, cw, ch, {
        restitution: 0.7,
        friction: 0.02,
        frictionAir: 0.008,
        angle: (Math.random() - 0.5) * 0.3,
        label: label,
        id: index
      });

      cards.push(body);

      const cardEl = document.createElement('div');
      cardEl.className = isIconOnly ? 'tech-card icon-only' : 'tech-card';
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('aria-label', `${label} technology card - drag to interact`);
      cardEl.setAttribute('tabindex', '0');

      if (isIconOnly) {
        // Icon-only card: large centered logo, no text
        cardEl.innerHTML = `<img src="${tech.icon}" alt="${label}" class="tech-logo" />`;
      } else {
        // Text card: accent dot + label
        cardEl.innerHTML = `
          <div class="accent-dot"></div>
          <span>${label}</span>
        `;
      }

      scene.appendChild(cardEl);
      cardElements.push(cardEl);
    });

    Composite.add(engine.world, cards);

    const mouse = Mouse.create(scene);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    Composite.add(engine.world, mouseConstraint);

    let draggedBody = null;

    Events.on(mouseConstraint, 'startdrag', (event) => {
      draggedBody = event.body;
      const index = cards.indexOf(draggedBody);
      if (index !== -1) {
        cardElements[index].classList.add('dragging');
      }
    });

    Events.on(mouseConstraint, 'enddrag', (event) => {
      if (draggedBody) {
        const index = cards.indexOf(draggedBody);
        if (index !== -1) {
          cardElements[index].classList.remove('dragging');
        }
      }
      draggedBody = null;
    });

    let time = 0;
    const beforeUpdate = () => {
      time += 0.016;
      cards.forEach((card, index) => {
        if (!card.isStatic && card !== draggedBody) {
          const floatX = Math.sin(time * 0.8 + index * 1.2) * 0.00015;
          const floatY = Math.cos(time * 0.6 + index * 0.9) * 0.00015;
          Matter.Body.applyForce(card, card.position, { x: floatX, y: floatY });
          Matter.Body.setAngularVelocity(card, card.angularVelocity * 0.995);
        }
      });
    };
    Events.on(engine, 'beforeUpdate', beforeUpdate);

    let animationFrameId;
    const updatePositions = () => {
      cards.forEach((body, index) => {
        const element = cardElements[index];
        if (element) {
          const x = body.position.x;
          const y = body.position.y;
          const angle = body.angle;
          element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}rad)`;
        }
      });
      animationFrameId = requestAnimationFrame(updatePositions);
    };

    const handleResize = () => {
      if (!section) return;
      width = section.offsetWidth;
      height = section.offsetHeight;

      Matter.Body.setPosition(walls[0], { x: width / 2, y: -wallThickness / 2 });
      Matter.Body.setPosition(walls[1], { x: width / 2, y: height + wallThickness / 2 });
      Matter.Body.setPosition(walls[2], { x: -wallThickness / 2, y: height / 2 });
      Matter.Body.setPosition(walls[3], { x: width + wallThickness / 2, y: height / 2 });

      cards.forEach((card) => {
        const pos = card.position;
        const boundedX = Math.max(50, Math.min(width - 50, pos.x));
        const boundedY = Math.max(50, Math.min(height - 50, pos.y));
        if (pos.x !== boundedX || pos.y !== boundedY) {
          Matter.Body.setPosition(card, { x: boundedX, y: boundedY });
        }
      });
    };

    window.addEventListener('resize', handleResize);

    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.opacity = Math.random() * 0.3 + 0.1;
      particle.style.transform = `scale(${Math.random() * 1.5 + 0.5})`;
      scene.appendChild(particle);
      
      const duration = 8000 + Math.random() * 12000;
      const startX = parseFloat(particle.style.left);
      const startY = parseFloat(particle.style.top);
      const endX = startX + (Math.random() - 0.5) * 20;
      const endY = startY + (Math.random() - 0.5) * 20;

      particle.animate([
        { left: startX + '%', top: startY + '%', opacity: particle.style.opacity },
        { left: endX + '%', top: endY + '%', opacity: parseFloat(particle.style.opacity) * 1.5 },
        { left: startX + '%', top: startY + '%', opacity: particle.style.opacity }
      ], {
        duration: duration,
        iterations: Infinity,
        easing: 'ease-in-out'
      });
    }

    cardElements.forEach((el, index) => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const card = cards[index];
          Matter.Body.applyForce(card, card.position, {
            x: (Math.random() - 0.5) * 0.05,
            y: (Math.random() - 0.5) * 0.05
          });
        }
      });
    });

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    updatePositions();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      engine.world.gravity.y = 0;
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      Runner.stop(runner);
      Engine.clear(engine);
      if (engine.world) {
        Composite.clear(engine.world);
      }
      if (scene) {
        scene.innerHTML = '';
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="tech-stack-section font-body" aria-label="Technology Stack Showcase">
      <div className="grid-pattern"></div>
      
      <div className="section-header">
        <div className="section-label">Core Stack</div>
        <h2 className="section-title text-white">What Powers My Builds</h2>
      </div>

      <div id="scene" ref={sceneRef}></div>
    </section>
  );
};

export default TechStack;
