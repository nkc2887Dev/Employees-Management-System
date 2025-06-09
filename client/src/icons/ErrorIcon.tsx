import React from 'react';

interface IconProps {
  className?: string;
}

const ErrorIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
};

export default ErrorIcon;
