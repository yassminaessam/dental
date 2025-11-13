-- CreateTable
CREATE TABLE "DentalChart" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "chartData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DentalChart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DentalChart_patientId_key" ON "DentalChart"("patientId");

-- CreateIndex
CREATE INDEX "DentalChart_patientId_idx" ON "DentalChart"("patientId");
