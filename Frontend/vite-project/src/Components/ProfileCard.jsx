import React, { useState } from "react";
import { gsap } from "gsap";

const ProfileCard = ({
  name,
  role,
  description,
  image,
  gradient = "from-blue-400 to-indigo-500",
  delay = 0,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    gsap.to(`.card-${name.replace(/\s+/g, "-")}`, {
      y: -10,
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out",
    });
    gsap.to(`.avatar-${name.replace(/\s+/g, "-")}`, {
      scale: 1.1,
      rotation: 5,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    gsap.to(`.card-${name.replace(/\s+/g, "-")}`, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
    gsap.to(`.avatar-${name.replace(/\s+/g, "-")}`, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <div
      className={`p-3 max-w-md mx-auto flex flex-col items-center text-center group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Large Avatar with animated border */}
      <div
        className={`relative mb-6 overflow-hidden rounded-full bg-gradient-to-br ${gradient} p-1 shadow-2xl`}
      >
        <div
          className={`w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-white shadow-lg avatar-${name.replace(/\s+/g, "-")}`}
        >
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        {/* Animated border ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-spin-slow"></div>
      </div>

      {/* Name with gradient text effect */}
      <h3 className="text-2xl font-bold ios-title mb-2 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
        {name}
      </h3>

      {/* Role with accent color */}
      <p className="ios-accent font-medium mt-1 mb-3 text-lg">{role}</p>

      {/* Description */}
      <p className="ios-body mt-3 text-sm leading-relaxed text-gray-600">
        {description}
      </p>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default ProfileCard;
