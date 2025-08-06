import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveTableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableWrapper({ children, className }: ResponsiveTableWrapperProps) {
  const isMobile = useIsMobile();

  return (
    <div 
      className={cn(
        "w-full overflow-auto",
        isMobile && "rounded-md border",
        className
      )}
    >
      <div className={cn(
        "relative w-full",
        isMobile && "min-w-[600px]" // Force minimum width on mobile for horizontal scroll
      )}>
        {children}
      </div>
    </div>
  );
}

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCard({ children, className }: MobileCardProps) {
  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-2",
      className
    )}>
      {children}
    </div>
  );
}

interface MobileCardFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function MobileCardField({ label, value, className }: MobileCardFieldProps) {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
