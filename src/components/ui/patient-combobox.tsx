'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
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
import { useLanguage } from '@/contexts/LanguageContext';

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
  const [searchTerm, setSearchTerm] = React.useState('');
  const { isRTL } = useLanguage();

  const normalizePhoneNumber = React.useCallback((phone?: string | null) => (
    phone ? phone.replace(/\D/g, '') : ''
  ), []);

  const selectedPatient = React.useMemo(
    () => patients.find((p) => p.id === value),
    [patients, value]
  );

  const filteredPatients = React.useMemo(() => {
    const lower = searchTerm.toLowerCase().trim();
    const digits = searchTerm.replace(/\D/g, '');

    if (!lower && !digits) return patients;

    return patients.filter((patient) => {
      const fullName = `${patient.name} ${patient.lastName ?? ''}`.toLowerCase();
      const email = (patient.email ?? '').toLowerCase();
      const patientId = (patient.id ?? '').toLowerCase();
      const phone = patient.phone ?? '';
      const normalizedPhone = normalizePhoneNumber(phone);

      const matchesText =
        fullName.includes(lower) ||
        email.includes(lower) ||
        patientId.includes(lower);

      const matchesPhone = digits
        ? normalizedPhone.includes(digits)
        : phone.toLowerCase().includes(lower);

      return matchesText || matchesPhone;
    });
  }, [patients, searchTerm, normalizePhoneNumber]);

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
            <span className="truncate flex items-center gap-2">
              <span>{selectedPatient.name}</span>
              {selectedPatient.phone && (
                <span
                  dir="ltr"
                  className={cn('inline-flex min-w-[80px]', isRTL && 'text-left')}
                >
                  {selectedPatient.phone}
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
          <div className="relative px-2 pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-9 pl-10"
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
          </div>
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredPatients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={`${patient.name} ${patient.lastName ?? ''} ${patient.phone ?? ''} ${patient.email ?? ''}`}
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
                    {patient.phone && (
                      <span
                        className="text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {patient.phone}
                      </span>
                    )}
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
