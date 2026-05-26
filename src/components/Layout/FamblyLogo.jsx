import React from 'react';

export default function FamblyLogo({ className = "h-8" }) {
  return (
    <div className="flex items-center gap-2">
      {/* Icono de Casa y Mascota minimalista */}
      <svg
        viewBox="0 0 135 34"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Letra F */}
        <path
          d="M 12 26 V 8 H 22 M 12 17 H 20"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-900"
        />

        {/* Letra A (con tejado de casa) */}
        {/* Trazado del tejado en naranja */}
        <path
          d="M 23 12 L 33 4 L 43 12"
          stroke="#F97316"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Patas y barra transversal */}
        <path
          d="M 25 26 L 33 9 L 41 26 M 28 19 H 38"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-900"
        />

        {/* Letra M */}
        <path
          d="M 48 26 V 8 L 57 18 L 66 8 V 26"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-900"
        />

        {/* Letra B */}
        <path
          d="M 72 26 V 8 H 80 C 83 8 83 16 80 16 H 72 M 72 16 H 80 C 83.5 16 83.5 26 80 26 H 72"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-900"
        />

        {/* Letra L */}
        <path
          d="M 88 8 V 26 H 98"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-900"
        />

        {/* Letra Y (con rabo de mascota) */}
        <path
          d="M 103 8 L 110 16 M 117 8 L 110 16 V 21"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-900"
        />
        {/* Rabo de mascota curvado al final */}
        <path
          d="M 110 21 C 110 26, 113 29, 117 27 C 120 25, 121 21, 118 18 C 116 16, 112 17, 111 20"
          stroke="#F97316"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
