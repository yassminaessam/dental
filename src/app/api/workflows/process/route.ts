import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Type definitions
interface AutomatedWorkflow {
  id: string;
  name: string;
  trigger: 'appointment_reminder' | 'appointment_confirmation' | 'appointment_followup' | 'new_patient_welcome' | 'birthday_greeting';
  templateId: string;
  enabled: boolean;
  timing?: string;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  type: 'Email' | 'SMS';
  subject?: string;
  body: string;
}

interface WorkflowLog {
  id: string;
  workflowId: string;
  workflowName: string;
  recipientEmail: string;
  recipientName: string;
  trigger: string;
  status: 'sent' | 'failed';
  error?: string;
  sentAt: string;
}

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Replace template variables with actual values
function replaceTemplateVariables(text: string, variables: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

// Send email using template
async function sendTemplateEmail(
  to: string,
  template: Template,
  variables: Record<string, string>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = replaceTemplateVariables(template.subject || template.name, variables);
    const body = replaceTemplateVariables(template.body, variables);

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: to,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Cairo Dental Clinic</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${body.replace(/\n/g, '<br>')}
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p><strong>Cairo Dental Clinic</strong></p>
              <p>📧 ${process.env.SMTP_FROM_EMAIL}</p>
              <p>This is an automated message from Cairo Dental Clinic.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: body,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Get workflows from database
async function getEnabledWorkflows(): Promise<AutomatedWorkflow[]> {
  const docs = await prisma.collectionDoc.findMany({
    where: { collection: 'workflows' },
  });
  
  return docs
    .map(doc => doc.data as unknown as AutomatedWorkflow)
    .filter(w => w.enabled);
}

// Get template by ID
async function getTemplate(templateId: string): Promise<Template | null> {
  const doc = await prisma.collectionDoc.findFirst({
    where: { collection: 'templates', id: templateId },
  });
  
  return doc ? (doc.data as unknown as Template) : null;
}

// Log workflow execution
async function logWorkflowExecution(log: WorkflowLog): Promise<void> {
  await prisma.collectionDoc.create({
    data: {
      collection: 'workflow_logs',
      id: log.id,
      data: log as any,
    },
  });
}

// Check if workflow was already sent for this recipient today
async function wasAlreadySentToday(workflowId: string, recipientEmail: string, trigger: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const logs = await prisma.collectionDoc.findMany({
    where: { collection: 'workflow_logs' },
  });
  
  return logs.some(log => {
    const data = log.data as unknown as WorkflowLog;
    const sentDate = new Date(data.sentAt);
    sentDate.setHours(0, 0, 0, 0);
    
    return data.workflowId === workflowId 
      && data.recipientEmail === recipientEmail 
      && data.trigger === trigger
      && data.status === 'sent'
      && sentDate.getTime() === today.getTime();
  });
}

// Process appointment reminder workflows
async function processAppointmentReminders(
  workflows: AutomatedWorkflow[],
  templates: Map<string, Template>
): Promise<number> {
  let sentCount = 0;
  const reminderWorkflows = workflows.filter(w => w.trigger === 'appointment_reminder');
  
  for (const workflow of reminderWorkflows) {
    const template = templates.get(workflow.templateId);
    if (!template) continue;
    
    // Calculate the time window based on timing
    const now = new Date();
    let targetTime: Date;
    
    switch (workflow.timing) {
      case '24h_before':
        targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case '1h_before':
        targetTime = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case 'on_day':
        targetTime = new Date(now);
        targetTime.setHours(23, 59, 59, 999);
        break;
      default:
        targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
    
    // Find appointments within the window
    const windowStart = new Date(targetTime.getTime() - 30 * 60 * 1000); // 30 min before
    const windowEnd = new Date(targetTime.getTime() + 30 * 60 * 1000); // 30 min after
    
    const appointments = await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: windowStart,
          lte: windowEnd,
        },
        status: 'Confirmed',
        patientEmail: { not: null },
      },
    });
    
    for (const appointment of appointments) {
      if (!appointment.patientEmail) continue;
      
      // Check if already sent today
      const alreadySent = await wasAlreadySentToday(workflow.id, appointment.patientEmail, 'appointment_reminder');
      if (alreadySent) continue;
      
      const variables = {
        patient_name: appointment.patient,
        appointment_date: appointment.dateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        appointment_time: appointment.dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        doctor_name: appointment.doctor,
        appointment_type: appointment.type,
        clinic_name: 'Cairo Dental Clinic',
      };
      
      const result = await sendTemplateEmail(appointment.patientEmail, template, variables);
      
      await logWorkflowExecution({
        id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflowId: workflow.id,
        workflowName: workflow.name,
        recipientEmail: appointment.patientEmail,
        recipientName: appointment.patient,
        trigger: 'appointment_reminder',
        status: result.success ? 'sent' : 'failed',
        error: result.error,
        sentAt: new Date().toISOString(),
      });
      
      if (result.success) sentCount++;
    }
  }
  
  return sentCount;
}

// Process appointment confirmation workflows (for newly created appointments)
async function processAppointmentConfirmations(
  workflows: AutomatedWorkflow[],
  templates: Map<string, Template>
): Promise<number> {
  let sentCount = 0;
  const confirmWorkflows = workflows.filter(w => w.trigger === 'appointment_confirmation');
  
  for (const workflow of confirmWorkflows) {
    const template = templates.get(workflow.templateId);
    if (!template) continue;
    
    // Find appointments created in the last hour that haven't been sent confirmation
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const appointments = await prisma.appointment.findMany({
      where: {
        createdAt: { gte: oneHourAgo },
        patientEmail: { not: null },
      },
    });
    
    for (const appointment of appointments) {
      if (!appointment.patientEmail) continue;
      
      // Check if already sent
      const alreadySent = await wasAlreadySentToday(workflow.id, appointment.patientEmail, `appointment_confirmation_${appointment.id}`);
      if (alreadySent) continue;
      
      const variables = {
        patient_name: appointment.patient,
        appointment_date: appointment.dateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        appointment_time: appointment.dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        doctor_name: appointment.doctor,
        appointment_type: appointment.type,
        clinic_name: 'Cairo Dental Clinic',
      };
      
      const result = await sendTemplateEmail(appointment.patientEmail, template, variables);
      
      await logWorkflowExecution({
        id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflowId: workflow.id,
        workflowName: workflow.name,
        recipientEmail: appointment.patientEmail,
        recipientName: appointment.patient,
        trigger: `appointment_confirmation_${appointment.id}`,
        status: result.success ? 'sent' : 'failed',
        error: result.error,
        sentAt: new Date().toISOString(),
      });
      
      if (result.success) sentCount++;
    }
  }
  
  return sentCount;
}

// Process appointment follow-up workflows
async function processAppointmentFollowups(
  workflows: AutomatedWorkflow[],
  templates: Map<string, Template>
): Promise<number> {
  let sentCount = 0;
  const followupWorkflows = workflows.filter(w => w.trigger === 'appointment_followup');
  
  for (const workflow of followupWorkflows) {
    const template = templates.get(workflow.templateId);
    if (!template) continue;
    
    // Calculate time based on timing
    const now = new Date();
    let targetTime: Date;
    
    switch (workflow.timing) {
      case '1h_after':
        targetTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h_after':
        targetTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      default:
        targetTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    const windowStart = new Date(targetTime.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(targetTime.getTime() + 30 * 60 * 1000);
    
    const appointments = await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: windowStart,
          lte: windowEnd,
        },
        status: 'Completed',
        patientEmail: { not: null },
      },
    });
    
    for (const appointment of appointments) {
      if (!appointment.patientEmail) continue;
      
      const alreadySent = await wasAlreadySentToday(workflow.id, appointment.patientEmail, `appointment_followup_${appointment.id}`);
      if (alreadySent) continue;
      
      const variables = {
        patient_name: appointment.patient,
        appointment_date: appointment.dateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        doctor_name: appointment.doctor,
        appointment_type: appointment.type,
        clinic_name: 'Cairo Dental Clinic',
      };
      
      const result = await sendTemplateEmail(appointment.patientEmail, template, variables);
      
      await logWorkflowExecution({
        id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflowId: workflow.id,
        workflowName: workflow.name,
        recipientEmail: appointment.patientEmail,
        recipientName: appointment.patient,
        trigger: `appointment_followup_${appointment.id}`,
        status: result.success ? 'sent' : 'failed',
        error: result.error,
        sentAt: new Date().toISOString(),
      });
      
      if (result.success) sentCount++;
    }
  }
  
  return sentCount;
}

// Process new patient welcome workflows
async function processNewPatientWelcome(
  workflows: AutomatedWorkflow[],
  templates: Map<string, Template>
): Promise<number> {
  let sentCount = 0;
  const welcomeWorkflows = workflows.filter(w => w.trigger === 'new_patient_welcome');
  
  for (const workflow of welcomeWorkflows) {
    const template = templates.get(workflow.templateId);
    if (!template) continue;
    
    // Find patients created in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const patients = await prisma.patient.findMany({
      where: {
        createdAt: { gte: oneHourAgo },
        email: { not: '' },
      },
    });
    
    for (const patient of patients) {
      if (!patient.email) continue;
      
      const alreadySent = await wasAlreadySentToday(workflow.id, patient.email, `new_patient_welcome_${patient.id}`);
      if (alreadySent) continue;
      
      const variables = {
        patient_name: `${patient.name} ${patient.lastName}`,
        clinic_name: 'Cairo Dental Clinic',
      };
      
      const result = await sendTemplateEmail(patient.email, template, variables);
      
      await logWorkflowExecution({
        id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflowId: workflow.id,
        workflowName: workflow.name,
        recipientEmail: patient.email,
        recipientName: `${patient.name} ${patient.lastName}`,
        trigger: `new_patient_welcome_${patient.id}`,
        status: result.success ? 'sent' : 'failed',
        error: result.error,
        sentAt: new Date().toISOString(),
      });
      
      if (result.success) sentCount++;
    }
  }
  
  return sentCount;
}

// Process birthday greeting workflows
async function processBirthdayGreetings(
  workflows: AutomatedWorkflow[],
  templates: Map<string, Template>
): Promise<number> {
  let sentCount = 0;
  const birthdayWorkflows = workflows.filter(w => w.trigger === 'birthday_greeting');
  
  for (const workflow of birthdayWorkflows) {
    const template = templates.get(workflow.templateId);
    if (!template) continue;
    
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // Find patients with birthday today
    const patients = await prisma.patient.findMany({
      where: {
        email: { not: '' },
        status: 'Active',
      },
    });
    
    const birthdayPatients = patients.filter(patient => {
      const dob = new Date(patient.dob);
      return dob.getMonth() + 1 === month && dob.getDate() === day;
    });
    
    for (const patient of birthdayPatients) {
      if (!patient.email) continue;
      
      const alreadySent = await wasAlreadySentToday(workflow.id, patient.email, 'birthday_greeting');
      if (alreadySent) continue;
      
      const age = today.getFullYear() - new Date(patient.dob).getFullYear();
      
      const variables = {
        patient_name: `${patient.name} ${patient.lastName}`,
        age: age.toString(),
        clinic_name: 'Cairo Dental Clinic',
      };
      
      const result = await sendTemplateEmail(patient.email, template, variables);
      
      await logWorkflowExecution({
        id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflowId: workflow.id,
        workflowName: workflow.name,
        recipientEmail: patient.email,
        recipientName: `${patient.name} ${patient.lastName}`,
        trigger: 'birthday_greeting',
        status: result.success ? 'sent' : 'failed',
        error: result.error,
        sentAt: new Date().toISOString(),
      });
      
      if (result.success) sentCount++;
    }
  }
  
  return sentCount;
}

// Main API handler - can be called by cron job
export async function GET(request: NextRequest) {
  // Optional: Add API key validation for security
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.WORKFLOW_API_KEY;
  
  if (expectedKey && apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('[Workflow Processor] Starting workflow processing...');
    
    // Get all enabled workflows
    const workflows = await getEnabledWorkflows();
    
    if (workflows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No enabled workflows found',
        processed: 0,
      });
    }
    
    // Get all templates needed by workflows
    const templateIds = [...new Set(workflows.map(w => w.templateId))];
    const templates = new Map<string, Template>();
    
    for (const templateId of templateIds) {
      const template = await getTemplate(templateId);
      if (template) {
        templates.set(templateId, template);
      }
    }
    
    // Process each type of workflow
    const results = {
      appointmentReminders: await processAppointmentReminders(workflows, templates),
      appointmentConfirmations: await processAppointmentConfirmations(workflows, templates),
      appointmentFollowups: await processAppointmentFollowups(workflows, templates),
      newPatientWelcome: await processNewPatientWelcome(workflows, templates),
      birthdayGreetings: await processBirthdayGreetings(workflows, templates),
    };
    
    const totalSent = Object.values(results).reduce((a, b) => a + b, 0);
    
    console.log('[Workflow Processor] Completed:', results);
    
    return NextResponse.json({
      success: true,
      message: `Processed ${workflows.length} workflows, sent ${totalSent} emails`,
      results,
      processedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Workflow Processor] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process workflows', details: error.message },
      { status: 500 }
    );
  }
}

// POST handler for manual trigger
export async function POST(request: NextRequest) {
  return GET(request);
}
