import React from 'react';
import { useAuth } from '../../context/AuthContext';

export function BrandLogo({ size = '', className = '' }) {
  const { brand } = useAuth() || {};

  if (brand?.logo) {
    return (
      <img
        src={brand.logo}
        alt="Logo"
        className={`brand-img ${size} ${className}`}
      />
    );
  }

  return <span className={`logo-mark ${size} ${className}`} />;
}
