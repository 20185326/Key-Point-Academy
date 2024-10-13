import React from 'react';

const Logo = ({ width, height }) => (
  <svg width={width} height={height} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" fill="none" stroke="#00bcd4" strokeWidth="5" />
    <path d="M30,100 Q100,30 170,100 Q100,170 30,100 Z" fill="none" stroke="#00bcd4" strokeWidth="2" />
    <path d="M50,100 Q100,50 150,100 Q100,150 50,100 Z" fill="none" stroke="#00bcd4" strokeWidth="2" />
    <path d="M70,100 Q100,70 130,100 Q100,130 70,100 Z" fill="none" stroke="#00bcd4" strokeWidth="2" />
    <text x="100" y="115" fontFamily="Arial" fontSize="48" fill="#0064a4" textAnchor="middle">TAI</text>
  </svg>
);

export default Logo;