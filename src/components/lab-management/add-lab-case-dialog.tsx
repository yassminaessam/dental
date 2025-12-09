'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Loader2, CalendarIcon, Check, ChevronsUpDown, Search } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import type { Lab } from '@/services/lab-management';

const labCaseSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  patientId: z.string().optional(),
  doctorName: z.string().min(1, 'Doctor name is required'),
  doctorId: z.string().optional(),
  treatmentId: z.string().optional(),
  caseType: z.string().min(1, 'Case type is required'),
  toothNumbers: z.string().optional(),
  shade: z.string().optional(),
  material: z.string().optional(),
  labId: z.string().optional(),
  labName: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']),
  dueDate: z.date().optional().nullable(),
  estimatedCost: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type LabCaseFormValues = z.infer<typeof labCaseSchema>;

interface AddLabCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: LabCaseFormValues) => void;
  labs: Lab[];
}

const caseTypes = [
  'Crown',
  'Bridge',
  'Denture',
  'Partial Denture',
  'Implant Crown',
  'Implant Bridge',
  'Veneer',
  'Inlay',
  'Onlay',
  'Night Guard',
  'Retainer',
  'Orthodontic Appliance',
  'Surgical Guide',
  'Other',
];

const materials = [
  'Zirconia',
  'E-Max',
  'PFM (Porcelain Fused to Metal)',
  'Full Metal',
  'Acrylic',
  'Composite',
  'Titanium',
  'Chrome Cobalt',
  'Gold',
  'PEEK',
  'Other',
];

export function AddLabCaseDialog({ open, onOpenChange, onSave, labs }: AddLabCaseDialogProps) {
  const { t, isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [patients, setPatients] = React.useState<Array<{ id: string; name: string; phone?: string }>>([]);
  const [doctors, setDoctors] = React.useState<Array<{ id: string; name: string; phone?: string }>>([]);
  
  // Smart search states
  const [patientSearchTerm, setPatientSearchTerm] = React.useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = React.useState('');
  const [labSearchTerm, setLabSearchTerm] = React.useState('');
  const [patientOpen, setPatientOpen] = React.useState(false);
  const [doctorOpen, setDoctorOpen] = React.useState(false);
  const [labOpen, setLabOpen] = React.useState(false);

  const form = useForm<LabCaseFormValues>({
    resolver: zodResolver(labCaseSchema),
    defaultValues: {
      patientName: '',
      patientId: '',
      doctorName: '',
      doctorId: '',
      treatmentId: '',
      caseType: '',
      toothNumbers: '',
      shade: '',
      material: '',
      labId: '',
      labName: '',
      description: '',
      instructions: '',
      priority: 'Normal',
      dueDate: null,
      estimatedCost: undefined,
      notes: '',
    },
  });

  // Fetch patients and doctors
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch('/api/patients?activeOnly=true'),
          fetch('/api/doctors'),
        ]);
        if (patientsRes.ok) {
          const data = await patientsRes.json();
          setPatients(Array.isArray(data.patients) ? data.patients.map((p: any) => ({ 
            id: p.id, 
            name: `${p.name}${p.lastName ? ' ' + p.lastName : ''}`,
            phone: p.phone || ''
          })) : []);
        }
        if (doctorsRes.ok) {
          const data = await doctorsRes.json();
          setDoctors(Array.isArray(data.doctors) ? data.doctors.map((d: any) => ({ 
            id: d.id, 
            name: d.name,
            phone: d.phone || ''
          })) : []);
        }
      } catch (error) {
        console.error('Error fetching patients/doctors:', error);
      }
    };
    if (open) {
      fetchData();
    }
  }, [open]);

  // Normalize phone numbers for search
  const normalizePhone = (phone?: string) => phone ? phone.replace(/\D/g, '') : '';

  // Filter patients by name or phone
  const filteredPatients = React.useMemo(() => {
    const lower = patientSearchTerm.toLowerCase().trim();
    const digits = patientSearchTerm.replace(/\D/g, '');
    if (!lower && !digits) return patients;
    return patients.filter((p) => {
      const matchesName = p.name.toLowerCase().includes(lower);
      const matchesPhone = digits ? normalizePhone(p.phone).includes(digits) : (p.phone || '').toLowerCase().includes(lower);
      return matchesName || matchesPhone;
    });
  }, [patients, patientSearchTerm]);

  // Filter doctors by name or phone
  const filteredDoctors = React.useMemo(() => {
    const lower = doctorSearchTerm.toLowerCase().trim();
    const digits = doctorSearchTerm.replace(/\D/g, '');
    if (!lower && !digits) return doctors;
    return doctors.filter((d) => {
      const matchesName = d.name.toLowerCase().includes(lower);
      const matchesPhone = digits ? normalizePhone(d.phone).includes(digits) : (d.phone || '').toLowerCase().includes(lower);
      return matchesName || matchesPhone;
    });
  }, [doctors, doctorSearchTerm]);

  // Filter labs by name, phone, or specialty
  const filteredLabs = React.useMemo(() => {
    const lower = labSearchTerm.toLowerCase().trim();
    const digits = labSearchTerm.replace(/\D/g, '');
    if (!lower && !digits) return labs.filter(l => l.isActive);
    return labs.filter(l => l.isActive).filter((lab) => {
      const matchesName = lab.name.toLowerCase().includes(lower);
      const matchesPhone = digits ? normalizePhone(lab.phone || '').includes(digits) : (lab.phone || '').toLowerCase().includes(lower);
      const matchesSpecialty = (lab.specialty || '').toLowerCase().includes(lower);
      const matchesContact = (lab.contactName || '').toLowerCase().includes(lower);
      return matchesName || matchesPhone || matchesSpecialty || matchesContact;
    });
  }, [labs, labSearchTerm]);

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      form.setValue('patientId', patient.id);
      form.setValue('patientName', patient.name);
      setPatientOpen(false);
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      form.setValue('doctorId', doctor.id);
      form.setValue('doctorName', doctor.name);
      setDoctorOpen(false);
    }
  };

  const handleLabChange = (labId: string) => {
    const lab = labs.find(l => l.id === labId);
    if (lab) {
      form.setValue('labId', lab.id);
      form.setValue('labName', lab.name);
      setLabOpen(false);
    }
  };

  const onSubmit = async (data: LabCaseFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('lab.new_case')}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Selection - Smart Search */}
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => {
                  const selectedPatient = patients.find(p => p.id === field.value);
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('lab.patient')}</FormLabel>
                      <Popover open={patientOpen} onOpenChange={setPatientOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={patientOpen}
                              className={cn(
                                "w-full justify-between h-10",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedPatient ? (
                                <span className="truncate flex items-center gap-2">
                                  <span>{selectedPatient.name}</span>
                                  {selectedPatient.phone && (
                                    <span dir="ltr" className={cn("text-xs text-muted-foreground", isRTL && "text-left")}>
                                      {selectedPatient.phone}
                                    </span>
                                  )}
                                </span>
                              ) : (
                                t('lab.select_patient')
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <div className="relative px-2 pt-2">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <CommandInput
                                placeholder={t('common.search_by_name_or_phone')}
                                className="h-9 pl-8"
                                value={patientSearchTerm}
                                onValueChange={setPatientSearchTerm}
                              />
                            </div>
                            <CommandList>
                              <CommandEmpty>{t('common.no_results')}</CommandEmpty>
                              <CommandGroup>
                                {filteredPatients.map((patient) => (
                                  <CommandItem
                                    key={patient.id}
                                    value={patient.id}
                                    onSelect={() => handlePatientChange(patient.id)}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === patient.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-medium">{patient.name}</span>
                                      {patient.phone && (
                                        <span dir="ltr" className="text-xs text-muted-foreground">
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
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Doctor Selection - Smart Search */}
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => {
                  const selectedDoctor = doctors.find(d => d.id === field.value);
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('lab.doctor')}</FormLabel>
                      <Popover open={doctorOpen} onOpenChange={setDoctorOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={doctorOpen}
                              className={cn(
                                "w-full justify-between h-10",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedDoctor ? (
                                <span className="truncate flex items-center gap-2">
                                  <span>{selectedDoctor.name}</span>
                                  {selectedDoctor.phone && (
                                    <span dir="ltr" className={cn("text-xs text-muted-foreground", isRTL && "text-left")}>
                                      {selectedDoctor.phone}
                                    </span>
                                  )}
                                </span>
                              ) : (
                                t('lab.select_doctor')
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <div className="relative px-2 pt-2">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <CommandInput
                                placeholder={t('common.search_by_name_or_phone')}
                                className="h-9 pl-8"
                                value={doctorSearchTerm}
                                onValueChange={setDoctorSearchTerm}
                              />
                            </div>
                            <CommandList>
                              <CommandEmpty>{t('common.no_results')}</CommandEmpty>
                              <CommandGroup>
                                {filteredDoctors.map((doctor) => (
                                  <CommandItem
                                    key={doctor.id}
                                    value={doctor.id}
                                    onSelect={() => handleDoctorChange(doctor.id)}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === doctor.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-medium">{doctor.name}</span>
                                      {doctor.phone && (
                                        <span dir="ltr" className="text-xs text-muted-foreground">
                                          {doctor.phone}
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
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Case Type */}
              <FormField
                control={form.control}
                name="caseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.case_type')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('lab.select_case_type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {caseTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Lab Selection - Smart Search */}
              <FormField
                control={form.control}
                name="labId"
                render={({ field }) => {
                  const selectedLab = labs.find(l => l.id === field.value);
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('lab.lab')}</FormLabel>
                      <Popover open={labOpen} onOpenChange={setLabOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={labOpen}
                              className={cn(
                                "w-full justify-between h-10",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedLab ? (
                                <span className="truncate flex items-center gap-2">
                                  <span>{selectedLab.name}</span>
                                  {selectedLab.phone && (
                                    <span dir="ltr" className={cn("text-xs text-muted-foreground", isRTL && "text-left")}>
                                      {selectedLab.phone}
                                    </span>
                                  )}
                                </span>
                              ) : (
                                t('lab.select_lab')
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <div className="relative px-2 pt-2">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <CommandInput
                                placeholder={t('lab.search_labs')}
                                className="h-9 pl-8"
                                value={labSearchTerm}
                                onValueChange={setLabSearchTerm}
                              />
                            </div>
                            <CommandList>
                              <CommandEmpty>{t('common.no_results')}</CommandEmpty>
                              <CommandGroup>
                                {filteredLabs.map((lab) => (
                                  <CommandItem
                                    key={lab.id}
                                    value={lab.id}
                                    onSelect={() => handleLabChange(lab.id)}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === lab.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-medium">{lab.name}</span>
                                      <div className="text-xs text-muted-foreground">
                                        {lab.specialty && <span>{lab.specialty}</span>}
                                        {lab.specialty && lab.phone && <span> • </span>}
                                        {lab.phone && <span dir="ltr">{lab.phone}</span>}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Tooth Numbers */}
              <FormField
                control={form.control}
                name="toothNumbers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.tooth_numbers')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('lab.tooth_numbers_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shade */}
              <FormField
                control={form.control}
                name="shade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.shade')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('lab.shade_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Material */}
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.material')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('lab.select_material')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materials.map((mat) => (
                          <SelectItem key={mat} value={mat}>
                            {mat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.priority')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">{t('lab.priority.low')}</SelectItem>
                        <SelectItem value="Normal">{t('lab.priority.normal')}</SelectItem>
                        <SelectItem value="High">{t('lab.priority.high')}</SelectItem>
                        <SelectItem value="Urgent">{t('lab.priority.urgent')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.due_date')}</FormLabel>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            <span>{format(field.value, "PPP")}</span>
                          ) : (
                            <span>{t('lab.select_due_date')}</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Cost */}
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.estimated_cost')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lab.description')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('lab.description_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lab.instructions')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('lab.instructions_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lab.notes')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('lab.notes_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? 'ml-2' : 'mr-2')} />}
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
