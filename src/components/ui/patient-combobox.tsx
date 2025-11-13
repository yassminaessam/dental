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
import type { Patient } from '@/lib/types';

interface PatientComboboxProps {
  patients: Patient[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function PatientCombobox({
  patients,
  value,
  onValueChange,
  placeholder = 'Select patient...',
  searchPlaceholder = 'Search by name or phone...',
  emptyMessage = 'No patient found.',
  disabled = false,
  className,
}: PatientComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedPatient = React.useMemo(
    () => patients.find((p) => p.id === value),
    [patients, value]
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
          {selectedPatient ? (
            <span className="truncate">
              {selectedPatient.name} - {selectedPatient.phone}
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
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={`${patient.name} ${patient.phone}`}
                  onSelect={() => {
                    onValueChange(patient.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === patient.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{patient.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {patient.phone}
                    </span>
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
