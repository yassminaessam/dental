
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import type { Appointment } from '@/app/appointments/page';
import { Badge } from '../ui/badge';
import { isSameDay, format } from 'date-fns';

interface AppointmentCalendarViewProps {
    appointments: Appointment[];
    onAppointmentClick: (appointment: Appointment) => void;
}

export default function AppointmentCalendarView({ appointments, onAppointmentClick }: AppointmentCalendarViewProps) {
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    const appointmentsOnSelectedDate = React.useMemo(() => {
        if (!date) return [];
        return appointments.filter(appt => isSameDay(appt.dateTime, date));
    }, [appointments, date]);

    const appointmentDates = React.useMemo(() => {
        return appointments.map(appt => appt.dateTime);
    }, [appointments]);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardContent className="p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="w-full"
                            modifiers={{ scheduled: appointmentDates }}
                            modifiersClassNames={{
                                scheduled: 'bg-primary/20 text-primary-foreground rounded-full',
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Appointments on {date ? format(date, 'PPP') : '...'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {appointmentsOnSelectedDate.length > 0 ? (
                            appointmentsOnSelectedDate.map(appt => (
                                <div key={appt.id} className="p-3 bg-secondary/50 rounded-lg border cursor-pointer hover:bg-secondary" onClick={() => onAppointmentClick(appt)}>
                                    <p className="font-semibold">{appt.patient}</p>
                                    <p className="text-sm text-muted-foreground">{appt.type} with {appt.doctor}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <Badge variant="outline">{format(appt.dateTime, 'p')}</Badge>
                                        <Badge variant={appt.status === 'Cancelled' ? 'destructive' : 'default'}>{appt.status}</Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No appointments on this day.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
