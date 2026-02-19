// src/components/ui/Card.jsx
import React from 'react';

export default function Card({ children, className = "", onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}