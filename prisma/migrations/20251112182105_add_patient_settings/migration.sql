-- CreateTable
CREATE TABLE "PatientSettings" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "userId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT true,
    "appointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "promotionalEmails" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientSettings_patientId_key" ON "PatientSettings"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientSettings_userId_key" ON "PatientSettings"("userId");

-- CreateIndex
CREATE INDEX "PatientSettings_userId_idx" ON "PatientSettings"("userId");

-- CreateIndex
CREATE INDEX "PatientSettings_patientId_idx" ON "PatientSettings"("patientId");

-- AddForeignKey
ALTER TABLE "PatientSettings" ADD CONSTRAINT "PatientSettings_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
