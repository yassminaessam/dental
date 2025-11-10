"use client";
import React from 'react';
import { cn } from '@/lib/utils';

export type CardIconVariant = 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'red' | 'neutral';

interface CardIconProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardIconVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// Tailwind arbitrary value classes to guarantee compilation & rendering
const variantClassMap: Record<CardIconVariant, string> = {
  blue: 'bg-[rgba(173,216,230,0.20)] text-[#0D5E7A] dark:bg-[rgba(173,216,230,0.15)] dark:text-[#7fd3ec]',
  pink: 'bg-[rgba(255,182,193,0.20)] text-[#A81842] dark:bg-[rgba(255,182,193,0.15)] dark:text-[#f9b7c4]',
  green: 'bg-[rgba(144,238,144,0.20)] text-[#2E7D32] dark:bg-[rgba(144,238,144,0.15)] dark:text-[#6fe57a]',
  orange: 'bg-[rgba(255,200,150,0.20)] text-[#9a3412] dark:bg-[rgba(255,200,150,0.15)] dark:text-[#fdba74]',
  purple: 'bg-[rgba(216,191,216,0.20)] text-[#6b21a8] dark:bg-[rgba(216,191,216,0.15)] dark:text-[#d8b4fe]',
  red: 'bg-[rgba(255,153,153,0.20)] text-[#991b1b] dark:bg-[rgba(255,153,153,0.15)] dark:text-[#fecaca]',
  neutral: 'bg-[rgba(107,114,128,0.15)] text-[#374151] dark:bg-[rgba(107,114,128,0.12)] dark:text-[#d1d5db]'
};

const sizeClassMap: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-12 h-12'
};

export function CardIcon({
  variant = 'neutral',
  size = 'md',
  className,
  children,
  ...rest
}: CardIconProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-xl shadow-sm border border-border/40 backdrop-blur-sm transition-all duration-200',
        'hover:translate-y-[-2px] hover:shadow-md',
        variantClassMap[variant],
        sizeClassMap[size],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export default CardIcon;
