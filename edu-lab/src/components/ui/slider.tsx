import React from 'react';

// A simple, unstyled Slider component to act as a placeholder
// This allows the app to compile and function while deferring UI library decisions.
export const Slider = ({
  className,
  value,
  onValueChange,
  ...props
}: {
  className?: string;
  value: number[];
  onValueChange: (value: number[]) => void;
  [key: string]: any;
}) => (
  <input
    type="range"
    value={value[0]}
    onChange={(e) => onValueChange([Number(e.target.value)])}
    className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${className}`}
    {...props}
  />
); 