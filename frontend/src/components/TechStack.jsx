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
  const animFrameRef = useRef(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    if (!sceneRef.current || !sectionRef.current) return;

    const {
      Engine,
      Bodies,
      Composite,
      Mouse,
      MouseConstraint,
      Events,
      Runner
    } = Matter;

    const scene = sceneRef.current;
    const section = sectionRef.current;
    
    // Clear existing scene if any
    scene.innerHTML = '';

    let width = section.offsetWidth || 600;
    let height = section.offsetHeight || 380;

    // Create engine with sleep enabled for peak performance
    const engine = Engine.create({
      enableSleeping: true
    });
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
    const padding = 50;

    techStack.forEach((tech, index) => {
      const label = tech.name;
      const isIconOnly = tech.iconOnly && tech.icon;
      const cw = isIconOnly ? ICON_CARD_SIZE : TEXT_CARD_W;
      const ch = isIconOnly ? ICON_CARD_SIZE : TEXT_CARD_H;

      const x = padding + Math.random() * Math.max(50, width - cw - padding * 2);
      const y = padding + Math.random() * Math.max(50, height - ch - padding * 2);

      const body = Bodies.rectangle(x, y, cw, ch, {
        restitution: 0.7,
        friction: 0.02,
        frictionAir: 0.01,
        angle: (Math.random() - 0.5) * 0.25,
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
        cardEl.innerHTML = `<img src="${tech.icon}" alt="${label}" class="tech-logo" loading="lazy" />`;
      } else {
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
        stiffness: 0.25,
        render: { visible: false }
      }
    });

    Composite.add(engine.world, mouseConstraint);

    let draggedBody = null;

    Events.on(mouseConstraint, 'startdrag', (event) => {
      draggedBody = event.body;
      const index = cards.indexOf(draggedBody);
      if (index !== -1 && cardElements[index]) {
        cardElements[index].classList.add('dragging');
      }
    });

    Events.on(mouseConstraint, 'enddrag', (event) => {
      if (draggedBody) {
        const index = cards.indexOf(draggedBody);
        if (index !== -1 && cardElements[index]) {
          cardElements[index].classList.remove('dragging');
        }
      }
      draggedBody = null;
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    let time = 0;
    const beforeUpdate = () => {
      if (prefersReducedMotion || isMobile || !isVisibleRef.current) return;
      time += 0.016;
      cards.forEach((card, index) => {
        if (!card.isStatic && card !== draggedBody) {
          const floatX = Math.sin(time * 0.8 + index * 1.2) * 0.00012;
          const floatY = Math.cos(time * 0.6 + index * 0.9) * 0.00012;
          Matter.Body.applyForce(card, card.position, { x: floatX, y: floatY });
          Matter.Body.setAngularVelocity(card, card.angularVelocity * 0.99);
        }
      });
    };
    Events.on(engine, 'beforeUpdate', beforeUpdate);

    const updatePositions = () => {
      if (isVisibleRef.current) {
        cards.forEach((body, index) => {
          const element = cardElements[index];
          if (element) {
            const x = body.position.x;
            const y = body.position.y;
            const angle = body.angle;
            element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${angle}rad)`;
          }
        });
      }
      animFrameRef.current = requestAnimationFrame(updatePositions);
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
        const boundedX = Math.max(40, Math.min(width - 40, pos.x));
        const boundedY = Math.max(40, Math.min(height - 40, pos.y));
        if (pos.x !== boundedX || pos.y !== boundedY) {
          Matter.Body.setPosition(card, { x: boundedX, y: boundedY });
        }
      });
    };

    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);

    const runner = Runner.create();
    runnerRef.current = runner;

    // Viewport-aware Intersection Observer: Pause physics when section is offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            Runner.run(runner, engine);
            if (!animFrameRef.current) {
              updatePositions();
            }
          } else {
            Runner.stop(runner);
            if (animFrameRef.current) {
              cancelAnimationFrame(animFrameRef.current);
              animFrameRef.current = null;
            }
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(section);

    // Initial render
    updatePositions();

    if (prefersReducedMotion) {
      engine.world.gravity.y = 0;
    }

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', debouncedResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      Events.off(engine, 'beforeUpdate', beforeUpdate);
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
