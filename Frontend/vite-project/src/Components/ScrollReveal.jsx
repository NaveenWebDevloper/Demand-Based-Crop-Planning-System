import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  baseOpacity = 0,
  enableBlur = false,
  baseRotation = 0,
  blurStrength = 2,
  duration = 1,
  delay = 0,
  ease = "power2.out",
  className = "",
  ...props
}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set initial state
    gsap.set(element, {
      opacity: baseOpacity,
      rotation: baseRotation,
      filter: enableBlur ? `blur(${blurStrength}px)` : "blur(0px)",
      y: 50, // Add slight upward movement
    });

    // Create scroll trigger animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: "top 80%", // Start when top of element is 80% from top of viewport
        end: "bottom 20%", // End when bottom of element is 20% from top of viewport
        toggleActions: "play none none reverse", // Play on enter, reverse on leave
      },
    });

    tl.to(element, {
      opacity: 1,
      rotation: 0,
      y: 0,
      filter: "blur(0px)",
      duration: duration,
      delay: delay,
      ease: ease,
    });

    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
    };
  }, [
    baseOpacity,
    enableBlur,
    baseRotation,
    blurStrength,
    duration,
    delay,
    ease,
  ]);

  return (
    <div ref={elementRef} className={className} {...props}>
      {children}
    </div>
  );
};

export default ScrollReveal;
