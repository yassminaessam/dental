'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
interface Doctor {
  id: string;
  name: string;
  phone?: string;
  specialization?: string;
  email?: string;
}

interface DoctorComboboxProps {
  doctors: Doctor[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function DoctorCombobox({
  doctors,
  value,
  onValueChange,
  placeholder = 'Select doctor...',
  searchPlaceholder = 'Search by name or phone...',
  emptyMessage = 'No doctor found.',
  disabled = false,
  className,
}: DoctorComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const { isRTL } = useLanguage();

  const selectedDoctor = React.useMemo(
    () => doctors.find((d) => d.id === value),
    [doctors, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-9 sm:h-10 w-full justify-between',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {selectedDoctor ? (
            <span className="truncate flex items-center gap-2">
              <span>
                {selectedDoctor.name}
                {selectedDoctor.specialization && ` - ${selectedDoctor.specialization}`}
              </span>
              {selectedDoctor.phone && (
                <span
                  dir="ltr"
                  className={cn('inline-flex min-w-[80px]', isRTL && 'text-left')}
                >
                  {selectedDoctor.phone}
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {doctors.map((doctor) => (
                <CommandItem
                  key={doctor.id}
                  value={`${doctor.name} ${doctor.specialization || ''} ${doctor.phone || ''}`}
                  onSelect={() => {
                    onValueChange(doctor.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === doctor.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{doctor.name}</span>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {doctor.specialization && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">تخصص:</span>
                          <span>{doctor.specialization}</span>
                        </div>
                      )}
                      {doctor.phone && (
                        <div dir="ltr" className="inline-flex">
                          {doctor.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
