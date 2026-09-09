import { useEffect, useRef } from 'react';
import TechIcon from './TechIcon';
import './TechStack.css';

const techStack = [
  'React',
  'Node.js',
  'PostgreSQL',
  'JavaScript',
  'Tailwind CSS',
  'Supabase',
  'Vite',
  'Express',
  'Paystack',
  'Framer Motion'
];

const CARD_WIDTH = 140;
const CARD_HEIGHT = 58;
const CARD_POSITIONS = [
  [0.12, 0.42],
  [0.29, 0.34],
  [0.46, 0.44],
  [0.63, 0.34],
  [0.82, 0.43],
  [0.90, 0.69],
  [0.72, 0.73],
  [0.53, 0.65],
  [0.34, 0.75],
  [0.15, 0.68]
];

const TechStack = () => {
  const sceneRef = useRef(null);
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const scene = sceneRef.current;
    const section = sectionRef.current;
    if (!scene || !section || typeof window === 'undefined') return undefined;

    const capabilityQuery = window.matchMedia(
      '(min-width: 769px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
    );
    const saveDataEnabled = navigator.connection?.saveData === true;
    let disposed = false;
    let loadObserver;
    let cleanupPhysics;
    let loadGeneration = 0;

    const stopPhysics = () => {
      loadGeneration += 1;
      loadObserver?.disconnect();
      loadObserver = undefined;
      cleanupPhysics?.();
      cleanupPhysics = undefined;
    };

    const initializePhysics = async (generation) => {
      const matterModule = await import('matter-js');
      if (disposed || generation !== loadGeneration || !capabilityQuery.matches) return;

      const Matter = matterModule.default || matterModule;
      const {
        Engine,
        Bodies,
        Body,
        Composite,
        Mouse,
        MouseConstraint,
        Events,
        Runner
      } = Matter;

      const engine = Engine.create({ enableSleeping: true });
      engine.world.gravity.y = 0.02;
      const runner = Runner.create();
      const wallThickness = 100;
      let walls = [];
      let isVisible = true;
      let runnerIsActive = false;
      let draggedBody = null;
      let elapsed = 0;

      const dimensions = () => ({
        width: section.clientWidth || 720,
        height: section.clientHeight || 360
      });

      const createWalls = () => {
        if (walls.length) Composite.remove(engine.world, walls);
        const { width, height } = dimensions();
        walls = [
          Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, { isStatic: true }),
          Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, { isStatic: true }),
          Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true }),
          Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true })
        ];
        Composite.add(engine.world, walls);
      };

      createWalls();
      const initialSize = dimensions();
      const cards = techStack.map((name, index) => {
        const [xRatio, yRatio] = CARD_POSITIONS[index];
        const x = Math.max(
          CARD_WIDTH / 2 + 16,
          Math.min(initialSize.width - CARD_WIDTH / 2 - 16, initialSize.width * xRatio)
        );
        const y = Math.max(
          112,
          Math.min(initialSize.height - CARD_HEIGHT / 2 - 16, initialSize.height * yRatio)
        );

        return Bodies.rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, {
          restitution: 0.72,
          friction: 0.02,
          frictionAir: 0.012,
          angle: ((index % 5) - 2) * 0.025,
          label: name
        });
      });
      Composite.add(engine.world, cards);

      const mouse = Mouse.create(scene);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.25, render: { visible: false } }
      });
      Composite.add(engine.world, mouseConstraint);

      const syncCardPositions = () => {
        if (!isVisible) return;
        cards.forEach((card, index) => {
          const element = cardRefs.current[index];
          if (!element) return;
          element.style.transform = `translate3d(${card.position.x}px, ${card.position.y}px, 0) translate(-50%, -50%) rotate(${card.angle}rad)`;
        });
      };

      const addAmbientMotion = () => {
        if (!isVisible) return;
        elapsed += 0.016;
        cards.forEach((card, index) => {
          if (card === draggedBody) return;
          Body.applyForce(card, card.position, {
            x: Math.sin(elapsed * 0.8 + index * 1.2) * 0.0001,
            y: Math.cos(elapsed * 0.6 + index * 0.9) * 0.0001
          });
        });
      };

      const handleStartDrag = ({ body }) => {
        draggedBody = body;
        const index = cards.indexOf(body);
        cardRefs.current[index]?.classList.add('dragging');
      };

      const handleEndDrag = () => {
        const index = cards.indexOf(draggedBody);
        cardRefs.current[index]?.classList.remove('dragging');
        draggedBody = null;
      };

      Events.on(engine, 'beforeUpdate', addAmbientMotion);
      Events.on(engine, 'afterUpdate', syncCardPositions);
      Events.on(mouseConstraint, 'startdrag', handleStartDrag);
      Events.on(mouseConstraint, 'enddrag', handleEndDrag);

      scene.classList.add('physics-ready');
      syncCardPositions();

      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !runnerIsActive) {
            Runner.run(runner, engine);
            runnerIsActive = true;
          } else if (!isVisible && runnerIsActive) {
            Runner.stop(runner);
            runnerIsActive = false;
          }
        },
        { threshold: 0.05 }
      );
      visibilityObserver.observe(section);

      let resizeFrame;
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          createWalls();
          const { width, height } = dimensions();
          cards.forEach((card) => {
            Body.setPosition(card, {
              x: Math.max(CARD_WIDTH / 2 + 12, Math.min(width - CARD_WIDTH / 2 - 12, card.position.x)),
              y: Math.max(112, Math.min(height - CARD_HEIGHT / 2 - 12, card.position.y))
            });
          });
          syncCardPositions();
        });
      });
      resizeObserver.observe(section);

      cleanupPhysics = () => {
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        cancelAnimationFrame(resizeFrame);
        Events.off(engine, 'beforeUpdate', addAmbientMotion);
        Events.off(engine, 'afterUpdate', syncCardPositions);
        Events.off(mouseConstraint, 'startdrag', handleStartDrag);
        Events.off(mouseConstraint, 'enddrag', handleEndDrag);
        if (runnerIsActive) Runner.stop(runner);
        Mouse.clearSourceEvents(mouse);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        scene.classList.remove('physics-ready');
        cardRefs.current.forEach((element) => {
          if (element) {
            element.classList.remove('dragging');
            element.style.transform = '';
          }
        });
      };
    };

    const syncCapability = () => {
      stopPhysics();
      if (saveDataEnabled || !capabilityQuery.matches) return;

      const generation = loadGeneration;
      loadObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          loadObserver?.disconnect();
          loadObserver = undefined;
          initializePhysics(generation);
        },
        { rootMargin: '100px', threshold: 0.01 }
      );
      loadObserver.observe(section);
    };

    capabilityQuery.addEventListener('change', syncCapability);
    syncCapability();

    return () => {
      disposed = true;
      capabilityQuery.removeEventListener('change', syncCapability);
      stopPhysics();
    };
  }, []);

  return (
    <section ref={sectionRef} className="tech-stack-section font-body" aria-labelledby="core-stack-title">
      <header className="stack-header">
        <h2 id="core-stack-title" className="stack-title">What powers my builds</h2>
        <p className="stack-summary">A focused production stack for fast, maintainable products.</p>
      </header>

      <ul ref={sceneRef} className="stack-scene" aria-label="Core technologies">
        {techStack.map((name, index) => (
          <li
            key={name}
            ref={(element) => { cardRefs.current[index] = element; }}
            className="tech-card"
          >
            <TechIcon name={name} className="tech-logo" />
            <span>{name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TechStack;
