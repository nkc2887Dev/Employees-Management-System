import React from 'react';

interface IconProps {
  className?: string;
}

const ChevronDownIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
};

export default ChevronDownIcon; 