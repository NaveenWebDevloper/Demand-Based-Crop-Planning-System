import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const Logo = ({ size = 32, ...props }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      {...props}
    >
      <Circle cx="32" cy="32" r="30" fill="url(#gradient1)" />
      <Path
        d="M32 16C32 16 24 24 24 32C24 40 28 44 32 48C36 44 40 40 40 32C40 24 32 16 32 16Z"
        fill="#ffffff"
        opacity="0.9"
      />
      <Path
        d="M20 28C20 28 26 30 30 34C28 38 24 40 20 40C16 40 14 36 14 32C14 28 20 28 20 28Z"
        fill="#ffffff"
        opacity="0.7"
      />
      <Path
        d="M44 28C44 28 38 30 34 34C36 38 40 40 44 40C48 40 50 36 50 32C50 28 44 28 44 28Z"
        fill="#ffffff"
        opacity="0.7"
      />
      <Defs>
        <LinearGradient id="gradient1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#22c55e" />
          <Stop offset="1" stopColor="#16a34a" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

export default Logo;
