import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  baseOpacity = 0.1,
  enableBlur = true,
  baseRotation = 3,
  blurStrength = 4,
  duration = 1.2,
  yOffset = 20,
  threshold = 0.1,
  stagger = 0,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initial state
    gsap.set(el, {
      opacity: baseOpacity,
      filter: enableBlur ? `blur(${blurStrength}px)` : "none",
      rotate: baseRotation,
      y: yOffset,
    });

    // Animation
    const anim = gsap.to(el, {
      opacity: 1,
      filter: "blur(0px)",
      rotate: 0,
      y: 0,
      duration: duration,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
      anim.kill();
    };
  }, [baseOpacity, enableBlur, baseRotation, blurStrength, duration, yOffset]);

  return (
    <div ref={containerRef} style={{ display: "inline-block", width: "100%" }}>
      {children}
    </div>
  );
};

export default ScrollReveal;
