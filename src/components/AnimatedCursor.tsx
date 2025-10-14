"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const PARTICLE_COUNT = 200;
const SPRING_STIFFNESS = 0.02;
const SPRING_DAMPING = 0.78;
const SNAP_THRESHOLD = 0.25;

export function AnimatedCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number>(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateEnabled = () => {
      setEnabled(pointerQuery.matches && !motionQuery.matches);
    };

    updateEnabled();

    const addMediaListener = (
      mediaQuery: MediaQueryList,
      listener: () => void
    ) => {
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", listener);
        return () => mediaQuery.removeEventListener("change", listener);
      }

      mediaQuery.addListener(listener);
      return () => mediaQuery.removeListener(listener);
    };

    const removePointerListener = addMediaListener(pointerQuery, updateEnabled);
    const removeMotionListener = addMediaListener(motionQuery, updateEnabled);

    return () => {
      removePointerListener();
      removeMotionListener();
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) {
      return;
    }

    const rect = cursor.getBoundingClientRect();
    const offsetX = rect.width / 2;
    const offsetY = rect.height / 2;

    targetPosition.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    currentPosition.current = { ...targetPosition.current };
    velocity.current = { x: 0, y: 0 };

    cursor.style.transform = `translate3d(${
      currentPosition.current.x - offsetX
    }px, ${currentPosition.current.y - offsetY}px, 0)`;
    cursor.classList.remove("cursor-visible");

    const followPointer = () => {
      const deltaX = targetPosition.current.x - currentPosition.current.x;
      const deltaY = targetPosition.current.y - currentPosition.current.y;

      velocity.current.x =
        velocity.current.x * SPRING_DAMPING + deltaX * SPRING_STIFFNESS;
      velocity.current.y =
        velocity.current.y * SPRING_DAMPING + deltaY * SPRING_STIFFNESS;

      currentPosition.current.x += velocity.current.x;
      currentPosition.current.y += velocity.current.y;

      if (
        Math.abs(deltaX) < SNAP_THRESHOLD &&
        Math.abs(deltaY) < SNAP_THRESHOLD &&
        Math.abs(velocity.current.x) < SNAP_THRESHOLD &&
        Math.abs(velocity.current.y) < SNAP_THRESHOLD
      ) {
        currentPosition.current = { ...targetPosition.current };
        velocity.current = { x: 0, y: 0 };
      }

      cursor.style.transform = `translate3d(${
        currentPosition.current.x - offsetX
      }px, ${currentPosition.current.y - offsetY}px, 0)`;

      animationFrame.current = requestAnimationFrame(followPointer);
    };

    const handlePointerMove = (event: PointerEvent) => {
      cursor.classList.add("cursor-visible");
      targetPosition.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handlePointerLeave = () => {
      cursor.classList.remove("cursor-visible");
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    animationFrame.current = requestAnimationFrame(followPointer);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      cursor.classList.remove("cursor-visible");
    };
  }, [enabled]);

  const particles = useMemo(() => {
    const angleStep = (Math.PI * 2) / PARTICLE_COUNT;
    return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
      const radialLayer = (index % 60) / 60;
      const radius =
        24 + radialLayer * 40 + Math.sin(index * 0.35) * 6 + Math.random() * 4;
      const angle = angleStep * index + Math.random() * 0.6;
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;
      const delay = Math.random() * -3;
      const duration = 1.6 + Math.random() * 1.8;

      return {
        style: {
          "--offset-x": `${offsetX}px`,
          "--offset-y": `${offsetY}px`,
          "--delay": `${delay}s`,
          "--duration": `${duration}s`,
        } as CSSProperties,
        key: index,
      };
    });
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="animated-cursor pointer-events-none fixed left-0 top-0 z-50 flex h-16 w-16 items-center justify-center"
    >
      <div className="cursor-core">
        <div className="cursor-halo" />
        {particles.map(({ key, style }) => (
          <span key={key} style={style} className="cursor-particle" />
        ))}
      </div>
    </div>
  );
}
