import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { 
  Appointment, 
  Treatment, 
  MedicalRecord, 
  ClinicalImage, 
  Invoice, 
  InvoiceItem,
  Prescription,
  DentalChart
} from '@prisma/client';

// Type definitions for new models (until TS server reloads)
interface InsuranceClaimData {
  id: string;
  patientId: string;
  patientName: string;
  insuranceProvider: string;
  policyNumber: string | null;
  procedure: string;
  amount: number | string;
  approvedAmount: number | string | null;
  status: string;
  submitDate: Date;
  responseDate: Date | null;
}

interface ReferralData {
  id: string;
  patientId: string;
  patientName: string;
  specialty: string;
  specialist: string;
  reason: string;
  urgency: string;
  status: string;
  referralDate: Date;
  appointmentDate: Date | null;
  referringDoctor: string;
}

interface PatientMessageData {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  subject: string;
  content: string | null;
  snippet: string | null;
  status: string;
  priority: string;
  createdAt: Date;
}

interface ToothImageLinkData {
  id: string;
  patientId: string;
  patientName: string;
  imageId: string;
  toothNumber: number;
  condition: string | null;
  notes: string | null;
}

interface LabCaseData {
  id: string;
  caseNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string | null;
  doctorName: string | null;
  labId: string | null;
  labName: string | null;
  caseType: string;
  toothNumbers: string | null;
  shade: string | null;
  material: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  estimatedCost: number | string | null;
  actualCost: number | string | null;
  requestDate: Date;
  sentToLabDate: Date | null;
  receivedDate: Date | null;
  deliveredDate: Date | null;
  description: string | null;
  instructions: string | null;
  notes: string | null;
  lab?: { id: string; name: string } | null;
}

type AppointmentWithTreatment = Appointment & {
  treatment?: { id: string; procedure: string } | null;
};

type InvoiceWithItems = Invoice & {
  items: InvoiceItem[];
  treatment?: { id: string; procedure: string } | null;
};

type PrescriptionWithMedication = Prescription & {
  medication?: { id: string; name: string; form: string | null } | null;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await context.params;

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // Fetch the patient first to verify they exist and get their name
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, name: true, lastName: true }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const patientName = `${patient.name} ${patient.lastName}`.trim();

    // Fetch all patient-related data in parallel from proper Prisma models
    const [
      appointments,
      treatments,
      medicalRecords,
      clinicalImages,
      invoices,
      prescriptions,
      insuranceClaims,
      referrals,
      messages,
      toothImageLinks,
      dentalChart,
      labCases
    ] = await Promise.all([
      // Appointments - using proper model with patientId
      prisma.appointment.findMany({
        where: { 
          OR: [
            { patientId },
            { patient: patientName },
            { patient: patient.name }
          ]
        },
        orderBy: { dateTime: 'desc' },
        include: {
          treatment: {
            select: { id: true, procedure: true }
          }
        }
      }),

      // Treatments - using proper model with patientId
      prisma.treatment.findMany({
        where: { 
          OR: [
            { patientId },
            { patient: patientName },
            { patient: patient.name }
          ]
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Medical Records - using proper model with patientId
      prisma.medicalRecord.findMany({
        where: { 
          OR: [
            { patientId },
            { patient: patientName },
            { patient: patient.name }
          ]
        },
        orderBy: { date: 'desc' }
      }),

      // Clinical Images - using proper model with patientId
      prisma.clinicalImage.findMany({
        where: { patientId },
        orderBy: { date: 'desc' }
      }),

      // Invoices - using proper model with patientId
      prisma.invoice.findMany({
        where: { patientId },
        orderBy: { date: 'desc' },
        include: {
          items: true,
          treatment: {
            select: { id: true, procedure: true }
          }
        }
      }),

      // Prescriptions - using proper model with patientId
      prisma.prescription.findMany({
        where: { 
          OR: [
            { patientId },
            { patientName: { contains: patient.name, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          medication: {
            select: { id: true, name: true, form: true }
          }
        }
      }),

      // Insurance Claims - from new proper model
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).insuranceClaim.findMany({
        where: { patientId },
        orderBy: { submitDate: 'desc' }
      }).catch(() => []),

      // Referrals - from new proper model
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).referral.findMany({
        where: { patientId },
        orderBy: { referralDate: 'desc' }
      }).catch(() => []),

      // Patient Messages - from new proper model
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).patientMessage.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' }
      }).catch(() => []),

      // Tooth Image Links - from new proper model
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).toothImageLink.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' }
      }).catch(() => []),

      // Dental Chart
      prisma.dentalChart.findUnique({
        where: { patientId }
      }),

      // Lab Cases - using proper model with patientId
      prisma.labCase.findMany({
        where: { patientId },
        orderBy: { requestDate: 'desc' },
        include: {
          lab: {
            select: { id: true, name: true }
          }
        }
      }).catch(() => [])
    ]);

    // Transform data to match expected format
    const history = {
      appointments: appointments.map((apt: AppointmentWithTreatment) => ({
        id: apt.id,
        dateTime: apt.dateTime.toISOString(),
        date: apt.dateTime.toISOString(),
        patient: apt.patient,
        patientId: apt.patientId,
        doctor: apt.doctor,
        type: apt.type,
        duration: apt.duration,
        status: apt.status,
        notes: apt.notes,
        reason: apt.reason,
        treatment: apt.treatment
      })),
      treatments: treatments.map((t: Treatment) => ({
        id: t.id,
        patient: t.patient,
        patientId: t.patientId,
        doctor: t.doctor,
        procedure: t.procedure,
        cost: t.cost,
        status: t.status,
        notes: t.notes,
        date: t.createdAt.toISOString()
      })),
      medicalRecords: medicalRecords.map((r: MedicalRecord) => ({
        id: r.id,
        patient: r.patient,
        patientId: r.patientId,
        type: r.type,
        complaint: r.complaint,
        provider: r.provider,
        date: r.date.toISOString(),
        status: r.status,
        notes: r.notes
      })),
      clinicalImages: clinicalImages.map((img: ClinicalImage) => ({
        id: img.id,
        patient: img.patient,
        patientId: img.patientId,
        type: img.type,
        imageUrl: img.imageUrl,
        caption: img.caption,
        toothNumber: img.toothNumber,
        date: img.date.toISOString()
      })),
      invoices: invoices.map((inv: InvoiceWithItems) => ({
        id: inv.number || inv.id,
        patientId: inv.patientId,
        totalAmount: Number(inv.amount),
        amountPaid: Number(inv.amountPaid),
        status: inv.status,
        issueDate: inv.date.toISOString(),
        dueDate: inv.dueDate?.toISOString(),
        items: inv.items,
        treatment: inv.treatment
      })),
      prescriptions: prescriptions.map((rx: PrescriptionWithMedication) => ({
        id: rx.id,
        patient: rx.patientName,
        patientId: rx.patientId,
        medication: rx.medicationName,
        strength: rx.strength,
        dosage: rx.dosage,
        instructions: rx.instructions,
        duration: rx.duration,
        refills: rx.refills,
        status: rx.status,
        doctor: rx.doctorName,
        date: rx.createdAt.toISOString()
      })),
      insuranceClaims: insuranceClaims.map((claim: InsuranceClaimData) => ({
        id: claim.id,
        patientId: claim.patientId,
        patient: claim.patientName,
        insurance: claim.insuranceProvider,
        policyNumber: claim.policyNumber,
        procedure: claim.procedure,
        amount: Number(claim.amount),
        approvedAmount: claim.approvedAmount ? Number(claim.approvedAmount) : null,
        status: claim.status,
        submitDate: claim.submitDate.toISOString(),
        responseDate: claim.responseDate?.toISOString()
      })),
      referrals: referrals.map((ref: ReferralData) => ({
        id: ref.id,
        patientId: ref.patientId,
        patient: ref.patientName,
        specialty: ref.specialty,
        specialist: ref.specialist,
        reason: ref.reason,
        urgency: ref.urgency,
        status: ref.status,
        date: ref.referralDate.toISOString(),
        apptDate: ref.appointmentDate?.toISOString(),
        referringDoctor: ref.referringDoctor
      })),
      messages: messages.map((msg: PatientMessageData) => ({
        id: msg.id,
        patientId: msg.patientId,
        patient: msg.patientName,
        type: msg.type,
        subject: msg.subject,
        content: msg.content,
        snippet: msg.snippet || msg.content?.substring(0, 100),
        status: msg.status,
        priority: msg.priority,
        date: msg.createdAt.toISOString()
      })),
      toothImageLinks: toothImageLinks.map((link: ToothImageLinkData) => ({
        id: link.id,
        patientId: link.patientId,
        patient: link.patientName,
        imageId: link.imageId,
        toothNumber: link.toothNumber,
        condition: link.condition,
        notes: link.notes
      })),
      dentalChart: dentalChart ? {
        id: dentalChart.id,
        patientId: dentalChart.patientId,
        chartData: dentalChart.chartData
      } : null,
      labCases: labCases.map((lc: any) => ({
        id: lc.id,
        caseNumber: lc.caseNumber,
        patientId: lc.patientId,
        patientName: lc.patientName,
        doctorId: lc.doctorId,
        doctorName: lc.doctorName,
        labId: lc.labId,
        labName: lc.labName || lc.lab?.name,
        caseType: lc.caseType,
        toothNumbers: lc.toothNumbers,
        shade: lc.shade,
        material: lc.material,
        status: lc.status,
        priority: lc.priority,
        dueDate: lc.dueDate?.toISOString() || null,
        estimatedCost: lc.estimatedCost ? Number(lc.estimatedCost) : null,
        actualCost: lc.actualCost ? Number(lc.actualCost) : null,
        requestDate: lc.requestDate.toISOString(),
        sentToLabDate: lc.sentToLabDate?.toISOString() || null,
        receivedDate: lc.receivedDate?.toISOString() || null,
        deliveredDate: lc.deliveredDate?.toISOString() || null,
        description: lc.description,
        instructions: lc.instructions,
        notes: lc.notes
      }))
    };

    return NextResponse.json({ 
      success: true, 
      patientId,
      patientName,
      history 
    });
  } catch (error) {
    console.error('[api/patients/[id]/history] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient history' },
      { status: 500 }
    );
  }
}
