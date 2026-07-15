import React, { useRef, useEffect } from 'react';
import Matter from 'matter-js';

const TechStack = () => {
  // Refs for proper cleanup and performance optimization
  const sectionRef = useRef(null);
  const sceneRef = useRef(null);
  const runnerRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const particlesRef = useRef([]); // For storing particle animation objects
  const keydownListenersRef = useRef([]); // For storing keydown event listener references
  const mediaQueryRef = useRef(null); // For reduced motion media query listener
  const visibilityHandlerRef = useRef(null); // For document visibility change handler

  useEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    
    if (!section || !scene) return;

    // Initialize Matter.js engine
    const engine = Matter.Engine.create();
    const wallThickness = 20;
    
    // Create wall boundaries for the physics world
    const walls = [
      Matter.Bodies.rectangle(
        window.innerWidth / 2,
        -wallThickness / 2,
        window.innerWidth,
        wallThickness
      ),
      Matter.Bodies.rectangle(
        window.innerWidth / 2,
        window.innerHeight + wallThickness / 2,
        window.innerWidth,
        wallThickness
      ),
      Matter.Bodies.rectangle(
        -wallThickness / 2,
        window.innerHeight / 2,
        wallThickness,
        window.innerHeight
      ),
      Matter.Bodies.rectangle(
        window.innerWidth + wallThickness / 2,
        window.innerHeight / 2,
        wallThickness,
        window.innerHeight
      )
    ];

    // Create physics bodies for interactive cards
    const cards = [
      Matter.Bodies.rectangle(window.innerWidth / 4, window.innerHeight / 2, 200, 120),
      Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight / 3, 180, 100),
      Matter.Bodies.rectangle(window.innerWidth * 3 / 4, window.innerHeight / 4, 160, 140),
      Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight * 3 / 4, 140, 110),
      Matter.Bodies.rectangle(window.innerWidth / 3, window.innerHeight * 2 / 3, 220, 130)
    ];

    // Create DOM elements for cards and store references
    const cardElements = [];

    cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.tabIndex = 0; // Accessibility: make card keyboard focusable
      cardEl.role = 'button'; // Accessibility: indicate button-like behavior
      cardEl.setAttribute('aria-label', `Technology card ${index + 1}`); // Accessibility: meaningful label
      cardEl.innerHTML = `<div class="card-content">${['React', 'TypeScript', 'Node.js', 'Python', 'Go'][index]}</div>`;
      
      // Performance optimizations for GPU acceleration
      cardEl.style.willChange = 'transform';
      cardEl.style.backfaceVisibility = 'hidden';
      cardEl.style.transformStyle = 'preserve-3d';
      
      scene.appendChild(cardEl);
      cardElements.push(cardEl);
    });

    // Animation loop to update card positions based on physics
    const updatePositions = () => {
      // Update transform styles for all physics bodies
      Matter.Composite.allBodies(engine.world).forEach((body) => {
        if (body.element) {
          const x = body.position.x;
          const y = body.position.y;
          const angle = body.angle;
          // GPU acceleration: use translate3d instead of translate
          body.element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${angle}rad)`;
        }
      });
      animationFrameIdRef.current = requestAnimationFrame(updatePositions);
    };

    // Resize handler to update physics boundaries
    const handleResize = () => {
      if (!section) return;
      const width = section.offsetWidth;
      const height = section.offsetHeight;

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

    // Throttled resize handler to prevent excessive recalculations
    let resizeTimeout;
    const throttledResize = () => {
      if (resizeTimeout) cancelAnimationFrame(resizeTimeout);
      resizeTimeout = requestAnimationFrame(handleResize);
    };

    window.addEventListener('resize', throttledResize);

    // Create and animate floating particles
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.opacity = Math.random() * 0.3 + 0.1;
      particle.style.transform = `scale(${Math.random() * 1.5 + 0.5})`;
      particle.style.willChange = 'left, top, opacity'; // Performance optimization
      
      scene.appendChild(particle);
      particlesRef.current.push(particle);

      const duration = 8000 + Math.random() * 12000;
      const startX = parseFloat(particle.style.left);
      const startY = parseFloat(particle.style.top);
      const endX = startX + (Math.random() - 0.5) * 20;
      const endY = startY + (Math.random() - 0.5) * 20;

      const animation = particle.animate([
        { left: startX + '%', top: startY + '%', opacity: particle.style.opacity },
        { left: endX + '%', top: endY + '%', opacity: parseFloat(particle.style.opacity) * 1.5 },
        { left: startX + '%', top: startY + '%', opacity: particle.style.opacity }
      ], {
        duration: duration,
        iterations: Infinity,
        easing: 'ease-in-out'
      });
      particlesRef.current.push(animation); // Store animation for cleanup
    }

    // Event listeners for keyboard interactions
    cardElements.forEach((el, index) => {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const card = cards[index];
          Matter.Body.applyForce(card, card.position, {
            x: (Math.random() - 0.5) * 0.05,
            y: (Math.random() - 0.5) * 0.05
          });
        }
      };
      
      el.addEventListener('keydown', handleKeyDown);
      keydownListenersRef.current.push({ el, handler: handleKeyDown }); // Store for cleanup
    });

    // Start physics simulation
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    updatePositions();

    // Reduced motion support with dynamic listener
    mediaQueryRef.current = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQueryRef.current.matches) {
      engine.world.gravity.y = 0;
    }
    mediaQueryRef.current.addEventListener('change', (e) => {
      engine.world.gravity.y = e.matches ? 0 : 1;
    });

    // Visibility change handler for pausing physics
    visibilityHandlerRef.current = () => {
      if (document.hidden) {
        Matter.Runner.stop(runnerRef.current);
      } else {
        Matter.Runner.run(runnerRef.current, engine);
      }
    };
    document.addEventListener('visibilitychange', visibilityHandlerRef.current);

    // Cleanup function
    return () => {
      // Remove all event listeners
      window.removeEventListener('resize', throttledResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      // Handle reduced motion listener cleanup
      if (mediaQueryRef.current) {
        // Remove the specific handler that was added in the effect
        mediaQueryRef.current.removeEventListener('change', (e) => {
          engine.world.gravity.y = e.matches ? 0 : 1;
        });
      }
      
      // Handle visibility change listener cleanup
      if (visibilityHandlerRef.current) {
        document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
      }
      
      // Clean up Matter.js physics
      Matter.Runner.stop(runnerRef.current);
      Matter.Engine.clear(engine);
      if (engine.world) {
        Matter.Composite.clear(engine.world);
      }

      // Clean up keydown event listeners
      keydownListenersRef.current.forEach(({ el, handler }) => {
        el.removeEventListener('keydown', handler);
      });
      keydownListenersRef.current = [];

      // Clean up particle animations using DOM methods (avoid innerHTML)
      particlesRef.current.forEach((item) => {
        if (item.className === 'particle') {
          // Use replaceChildren instead of innerHTML for DOM cleanup
          scene.replaceChildren();
        } else {
          item.cancel(); // Cancel animation objects
        }
      });
      particlesRef.current = [];

      // Clean up card elements
      cardElements.forEach(el => {
        if (scene.contains(el)) {
          scene.removeChild(el);
        }
      });
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