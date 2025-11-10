-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('Confirmed', 'Pending', 'Cancelled', 'Completed');

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "patient" TEXT NOT NULL,
    "patientId" TEXT,
    "patientEmail" TEXT,
    "patientPhone" TEXT,
    "doctor" TEXT NOT NULL,
    "doctorId" TEXT,
    "type" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'Confirmed',
    "treatmentId" TEXT,
    "notes" TEXT,
    "bookedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "urgency" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "rejectedBy" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Appointment_dateTime_idx" ON "Appointment"("dateTime");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");
