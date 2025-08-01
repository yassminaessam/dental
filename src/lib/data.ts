


export type MedicalRecordTemplate = {
  id: string;
  name: string;
  type: string;
  content: string;
};

export const appointmentTypesData = [
  { name: "Check-up", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Cleaning", value: 30, color: "hsl(var(--chart-2))" },
  { name: "Filling", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Crown", value: 10, color: "hsl(var(--chart-4))" },
  { name: "Root Canal", value: 5, color: "hsl(var(--chart-5))" },
];

export const financialSummaryData = {
  currentRevenue: 750000,
  patientCount: 2350,
  newPatientAcquisitionCost: 2500,
  marketingSpend: 80000,
};

export const availableTimeSlots = [
  "09:00",
  "10:30",
  "11:00",
  "14:00",
  "15:30",
  "16:00",
];

export const treatmentCategories = [
  {
    name: "Preventive",
    count: 23,
    status: "Active",
    color: "bg-green-100 text-green-700",
  },
  {
    name: "Restorative",
    count: 18,
    status: "Active",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Cosmetic",
    count: 12,
    status: "Active",
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "Orthodontic",
    count: 8,
    status: "Active",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    name: "Emergency",
    count: 4,
    status: "Active",
    color: "bg-red-100 text-red-700",
  },
];

export const toothNames: Record<number, string> = {
    11: 'Upper Right Central Incisor', 12: 'Upper Right Lateral Incisor', 13: 'Upper Right Canine', 14: 'Upper Right First Premolar', 15: 'Upper Right Second Premolar', 16: 'Upper Right First Molar', 17: 'Upper Right Second Molar', 18: 'Upper Right Third Molar',
    21: 'Upper Left Central Incisor', 22: 'Upper Left Lateral Incisor', 23: 'Upper Left Canine', 24: 'Upper Left First Premolar', 25: 'Upper Left Second Premolar', 26: 'Upper Left First Molar', 27: 'Upper Left Second Molar', 28: 'Upper Left Third Molar',
    31: 'Lower Left Central Incisor', 32: 'Lower Left Lateral Incisor', 33: 'Lower Left Canine', 34: 'Lower Left First Premolar', 35: 'Lower Left Second Premolar', 36: 'Lower Left First Molar', 37: 'Lower Left Second Molar', 38: 'Lower Left Third Molar',
    41: 'Lower Right Central Incisor', 42: 'Lower Right Lateral Incisor', 43: 'Lower Right Canine', 44: 'Lower Right First Premolar', 45: 'Lower Right Second Premolar', 46: 'Lower Right First Molar', 47: 'Lower Right Second Molar', 48: 'Lower Right Third Molar',
};

export const appointmentDurations = ['30 minutes', '1 hour', '1.5 hours', '2 hours'];

export const emergencyContactRelationships = [
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Other',
];

export const staffRoles = [
  { name: "Dentist", count: 3, color: "bg-blue-100 text-blue-800" },
  { name: "Hygienist", count: 4, color: "bg-green-100 text-green-800" },
  { name: "Assistant", count: 3, color: "bg-purple-100 text-purple-800" },
  { name: "Receptionist", count: 1, color: "bg-yellow-100 text-yellow-800" },
  { name: "Manager", count: 1, color: "bg-red-100 text-red-800" },
];

export const medicalRecordTypes = ['SOAP', 'Clinical Note', 'Treatment Plan', 'Consultation'];
export const clinicalImageTypes = ['X-Ray', 'Intraoral Photo', 'Scan', 'Other'];

export const revenueVsExpensesData = [
  { month: "Jan", revenue: 700000, expenses: 350000, profit: 350000 },
  { month: "Feb", revenue: 680000, expenses: 320000, profit: 360000 },
  { month: "Mar", revenue: 720000, expenses: 300000, profit: 420000 },
  { month: "Apr", revenue: 710000, expenses: 380000, profit: 330000 },
  { month: "May", revenue: 800000, expenses: 370000, profit: 430000 },
  { month: "Jun", revenue: 850000, expenses: 400000, profit: 450000 },
  { month: "Jul", revenue: 830000, expenses: 410000, profit: 420000 },
  { month: "Aug", revenue: 880000, expenses: 420000, profit: 460000 },
  { month: "Sep", revenue: 810000, expenses: 390000, profit: 420000 },
  { month: "Oct", revenue: 900000, expenses: 400000, profit: 500000 },
  { month: "Nov", revenue: 880000, expenses: 380000, profit: 500000 },
  { month: "Dec", revenue: 750000, expenses: 370000, profit: 380000 },
];

export const expensesByCategoryData = [
    { name: 'Salaries', value: 45, color: 'hsl(var(--chart-1))' },
    { name: 'Supplies', value: 25, color: 'hsl(var(--chart-2))' },
    { name: 'Rent', value: 15, color: 'hsl(var(--chart-3))' },
    { name: 'Marketing', value: 10, color: 'hsl(var(--chart-4))' },
    { name: 'Other', value: 5, color: 'hsl(var(--chart-5))' },
];

export const transactionCategories = ['Patient Payment', 'Insurance Payment', 'Supplies', 'Salary', 'Rent', 'Utilities', 'Marketing', 'Other'];
export const paymentMethods = ['Credit Card', 'Cash', 'Vodafone Cash', 'Fawry', 'Bank Transfer'];

export const supplierPaymentTerms = ['Net 15', 'Net 30', 'Net 60', 'Due on receipt'];

export const specialistTypes = ['Oral Surgery', 'Periodontics', 'Orthodontics', 'Endodontics', 'Prosthodontics'];
export const referralUrgency = ['Routine', 'Urgent', 'Emergency'];

export const appointmentAnalyticsData = [
  { time: '8:00', appointments: 3, noShows: 0, cancellations: 0 },
  { time: '9:00', appointments: 5, noShows: 1, cancellations: 0 },
  { time: '10:00', appointments: 6, noShows: 0, cancellations: 1 },
  { time: '11:00', appointments: 4, noShows: 0, cancellations: 0 },
  { time: '12:00', appointments: 2, noShows: 0, cancellations: 0 },
  { time: '13:00', appointments: 4, noShows: 1, cancellations: 0 },
  { time: '14:00', appointments: 6, noShows: 0, cancellations: 1 },
  { time: '15:00', appointments: 5, noShows: 1, cancellations: 0 },
  { time: '16:00', appointments: 4, noShows: 0, cancellations: 0 },
  { time: '17:00', appointments: 3, noShows: 0, cancellations: 0 },
];

export const reportsRevenueTrendData = [
  { month: "Jan", revenue: 650000, expenses: 450000 },
  { month: "Feb", revenue: 680000, expenses: 480000 },
  { month: "Mar", revenue: 620000, expenses: 400000 },
  { month: "Apr", revenue: 710000, expenses: 510000 },
  { month: "May", revenue: 780000, expenses: 580000 },
  { month: "Jun", revenue: 850000, expenses: 620000 },
  { month: "Jul", revenue: 880000, expenses: 650000 },
  { month: "Aug", revenue: 920000, expenses: 680000 },
  { month: "Sep", revenue: 850000, expenses: 630000 },
  { month: "Oct", revenue: 950000, expenses: 700000 },
  { month: "Nov", revenue: 980000, expenses: 720000 },
  { month: "Dec", revenue: 1000000, expenses: 750000 },
];

export const reportsPatientGrowthData = [
  { month: 'Jan', total: 110, new: 20 },
  { month: 'Feb', total: 120, new: 22 },
  { month: 'Mar', total: 140, new: 25 },
  { month: 'Apr', total: 160, new: 30 },
  { month: 'May', total: 190, new: 35 },
  { month: 'Jun', total: 216, new: 40 },
];

export const reportsTreatmentsByTypeData = [
  { type: 'Check-up', count: 45 },
  { type: 'Cleaning', count: 38 },
  { type: 'Filling', count: 25 },
  { type: 'Crown', count: 15 },
  { type: 'Canal', count: 8 },
  { type: 'Other', count: 12 },
];

export const reportsAppointmentDistributionData = [
  { type: 'Check-up', count: 350, color: 'hsl(var(--chart-1))' },
  { type: 'Cleaning', count: 250, color: 'hsl(var(--chart-2))' },
  { type: 'Filling', count: 150, color: 'hsl(var(--chart-3))' },
  { type: 'Crown', count: 100, color: 'hsl(var(--chart-4))' },
  { type: 'Other', count: 50, color: 'hsl(var(--muted))' },
];

export const patientDemographicsData = [
    { ageGroup: '0-18', count: 25 },
    { ageGroup: '19-35', count: 60 },
    { ageGroup: '36-50', count: 45 },
    { ageGroup: '51-65', count: 20 },
    { ageGroup: '66+', count: 15 },
];

export const treatmentVolumeData = [
    { month: 'Jan', count: 80 },
    { month: 'Feb', count: 85 },
    { month: 'Mar', count: 95 },
    { month: 'Apr', count: 90 },
    { month: 'May', count: 110 },
    { month: 'Jun', count: 120 },
];

export const staffPerformanceData = [
    { name: 'Dr. Nourhan', appointments: 120 },
    { name: 'Dr. Khaled', appointments: 110 },
    { name: 'Dr. Mariam', appointments: 100 },
    { name: 'Khaled Youssef', appointments: 80 },
];

export const patientSatisfactionData = [
    { month: 'Jan', score: 4.2 },
    { month: 'Feb', score: 4.3 },
    { month: 'Mar', score: 4.5 },
    { month: 'Apr', score: 4.4 },
    { month: 'May', score: 4.6 },
    { month: 'Jun', score: 4.7 },
];

export const allHealthyDentalChart = {
    18: { id: 18, condition: 'healthy', history: [] }, 17: { id: 17, condition: 'healthy', history: [] }, 16: { id: 16, condition: 'healthy', history: [] }, 15: { id: 15, condition: 'healthy', history: [] }, 14: { id: 14, condition: 'healthy', history: [] }, 13: { id: 13, condition: 'healthy', history: [] }, 12: { id: 12, condition: 'healthy', history: [] }, 11: { id: 11, condition: 'healthy', history: [] },
    21: { id: 21, condition: 'healthy', history: [] }, 22: { id: 22, condition: 'healthy', history: [] }, 23: { id: 23, condition: 'healthy', history: [] }, 24: { id: 24, condition: 'healthy', history: [] }, 25: { id: 25, condition: 'healthy', history: [] }, 26: { id: 26, condition: 'healthy', history: [] }, 27: { id: 27, condition: 'healthy', history: [] }, 28: { id: 28, condition: 'healthy', history: [] },
    48: { id: 48, condition: 'healthy', history: [] }, 47: { id: 47, condition: 'healthy', history: [] }, 46: { id: 46, condition: 'healthy', history: [] }, 45: { id: 45, condition: 'healthy', history: [] }, 44: { id: 44, condition: 'healthy', history: [] }, 43: { id: 43, condition: 'healthy', history: [] }, 42: { id: 42, condition: 'healthy', history: [] }, 41: { id: 41, condition: 'healthy', history: [] },
    31: { id: 31, condition: 'healthy', history: [] }, 32: { id: 32, condition: 'healthy', history: [] }, 33: { id: 33, condition: 'healthy', history: [] }, 34: { id: 34, condition: 'healthy', history: [] }, 35: { id: 35, condition: 'healthy', history: [] }, 36: { id: 36, condition: 'healthy', history: [] }, 37: { id: 37, condition: 'healthy', history: [] }, 38: { id: 38, condition: 'healthy', history: [] },
};
