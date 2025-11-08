import React from 'react'

export function Hero3DGraphic() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full h-full"
      style={{
        filter: 'drop-shadow(0 20px 60px rgba(0, 0, 0, 0.1))'
      }}
    >
      {/* 3D Cube representing integrated system */}
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.9 }} />
        </linearGradient>
        <linearGradient id="grad3" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Back face */}
      <polygon
        points="100,150 300,150 280,270 120,270"
        fill="url(#grad3)"
        opacity="0.5"
      />

      {/* Top face */}
      <polygon
        points="100,150 120,100 320,100 300,150"
        fill="url(#grad1)"
      />

      {/* Right face */}
      <polygon
        points="300,150 320,100 320,220 300,270"
        fill="url(#grad2)"
      />

      {/* Left face */}
      <polygon
        points="100,150 120,100 120,220 100,270"
        fill="url(#grad2)"
        opacity="0.7"
      />

      {/* Front face - main */}
      <polygon
        points="100,150 300,150 300,270 100,270"
        fill="url(#grad1)"
      />

      {/* Icons/Text inside the cube */}
      {/* Plan icon */}
      <g transform="translate(80, 180)">
        <rect x="0" y="0" width="35" height="35" fill="white" opacity="0.2" rx="4" />
        <text x="18" y="24" fontSize="20" textAnchor="middle" fill="white" fontWeight="bold">
          📋
        </text>
      </g>

      {/* Execute icon */}
      <g transform="translate(185, 180)">
        <rect x="0" y="0" width="35" height="35" fill="white" opacity="0.2" rx="4" />
        <text x="18" y="24" fontSize="20" textAnchor="middle" fill="white" fontWeight="bold">
          ⚙️
        </text>
      </g>

      {/* Bill icon */}
      <g transform="translate(290, 180)">
        <rect x="0" y="0" width="35" height="35" fill="white" opacity="0.2" rx="4" />
        <text x="18" y="24" fontSize="20" textAnchor="middle" fill="white" fontWeight="bold">
          💰
        </text>
      </g>

      {/* Decorative floating elements */}
      <circle cx="150" cy="80" r="8" fill="#60a5fa" opacity="0.6" />
      <circle cx="250" cy="85" r="6" fill="#3b82f6" opacity="0.5" />
      <circle cx="320" cy="150" r="7" fill="#60a5fa" opacity="0.4" />

      {/* Connecting lines showing flow */}
      <line x1="115" y1="200" x2="185" y2="200" stroke="white" strokeWidth="1.5" opacity="0.4" strokeDasharray="3,3" />
      <line x1="220" y1="200" x2="290" y2="200" stroke="white" strokeWidth="1.5" opacity="0.4" strokeDasharray="3,3" />
    </svg>
  )
}
