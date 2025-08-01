

export type MedicalRecordTemplate = {
  id: string;
  name: string;
  type: string;
  content: string;
};

// Mock data for the dashboard
export const overviewStats = [
  {
    title: "Total Patients",
    value: "156",
    change: "+12%",
    icon: "Users",
    changeType: "positive",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Today's Appointments",
    value: "8",
    change: "+5%",
    icon: "CalendarCheck",
    changeType: "positive",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Total Revenue",
    value: "EGP 750,000",
    change: "+8%",
    icon: "DollarSign",
    changeType: "positive",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
  },
  {
    title: "Active Staff",
    value: "12",
    change: "100%",
    icon: "UserCheck",
    changeType: "neutral",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Pending Appointments",
    value: "3",
    change: "-2%",
    icon: "Clock",
    changeType: "negative",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    title: "Completed Treatments",
    value: "67",
    change: "+15%",
    icon: "CheckCircle",
    changeType: "positive",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
];

export const revenueTrendsData = [
  { month: "Jan", revenue: 700000, expenses: 350000 },
  { month: "Feb", revenue: 680000, expenses: 320000 },
  { month: "Mar", revenue: 720000, expenses: 300000 },
  { month: "Apr", revenue: 710000, expenses: 380000 },
  { month: "May", revenue: 800000, expenses: 370000 },
  { month: "Jun", revenue: 850000, expenses: 400000 },
  { month: "Jul", revenue: 830000, expenses: 410000 },
  { month: "Aug", revenue: 880000, expenses: 420000 },
  { month: "Sep", revenue: 810000, expenses: 390000 },
  { month: "Oct", revenue: 900000, expenses: 400000 },
  { month: "Nov", revenue: 880000, expenses: 380000 },
  { month: "Dec", revenue: 750000, expenses: 370000 },
];

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

export const patientPageStats = [
  {
    title: "Total Patients",
    value: "156",
    description: "+12 this month",
  },
  {
    title: "New This Month",
    value: "12",
    description: "+15% from last month",
  },
  {
    title: "Active Treatments",
    value: "34",
    description: "8 completed this week",
  },
  {
    title: "Overdue Checkups",
    value: "7",
    description: "Needs follow-up",
    valueClassName: "text-destructive",
  },
];

export const appointmentPageStats = [
  {
    title: "Today's Appointments",
    value: "8",
    description: "3 confirmed, 2 pending",
  },
  {
    title: "This Week",
    value: "47",
    description: "89% show rate",
  },
  {
    title: "No Shows",
    value: "3",
    description: "This month",
    valueClassName: "text-destructive",
  },
  {
    title: "Available Slots",
    value: "12",
    description: "Next 7 days",
    valueClassName: "text-green-600",
  },
];

export const availableTimeSlots = [
  "09:00",
  "10:30",
  "11:00",
  "14:00",
  "15:30",
  "16:00",
];

export const treatmentPageStats = [
  {
    title: "Total Treatments",
    value: "89",
    description: "+15 this month",
  },
  {
    title: "In Progress",
    value: "12",
    description: "Active treatments",
  },
  {
    title: "Completed",
    value: "67",
    description: "75% success rate",
  },
  {
    title: "Revenue",
    value: "EGP 400,000",
    description: "This month",
  },
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

export const dentalChartStats = [
    { name: 'Healthy', count: 0, color: 'bg-green-500' },
    { name: 'Cavity', count: 0, color: 'bg-red-500' },
    { name: 'Filling', count: 2, color: 'bg-blue-500' },
    { name: 'Crown', count: 1, color: 'bg-purple-500' },
    { name: 'Missing', count: 1, color: 'bg-gray-500' },
    { name: 'Root Canal', count: 1, color: 'bg-yellow-500' },
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

export const staffPageStats = [
  {
    title: "Total Staff",
    value: "12",
    description: "All active",
  },
  {
    title: "Dentists",
    value: "3",
    description: "Licensed practitioners",
  },
  {
    title: "Support Staff",
    value: "9",
    description: "Assistants & hygienists",
  },
  {
    title: "Payroll",
    value: "EGP 650K",
    description: "Monthly total",
  },
];

export const staffRoles = [
  { name: "Dentist", count: 3, color: "bg-blue-100 text-blue-800" },
  { name: "Hygienist", count: 4, color: "bg-green-100 text-green-800" },
  { name: "Assistant", count: 3, color: "bg-purple-100 text-purple-800" },
  { name: "Receptionist", count: 1, color: "bg-yellow-100 text-yellow-800" },
  { name: "Manager", count: 1, color: "bg-red-100 text-red-800" },
];

export const medicalRecordsPageStats = [
  {
    title: "Total Records",
    value: "2",
    description: "Medical records",
  },
  {
    title: "This Month",
    value: "2",
    description: "New records created",
  },
  {
    title: "Clinical Images",
    value: "2",
    description: "X-rays & photos",
    valueClassName: "text-green-600",
  },
  {
    title: "Pending Review",
    value: "0",
    description: "Draft records",
  },
];

export const medicalRecordTypes = ['SOAP', 'Clinical Note', 'Treatment Plan', 'Consultation'];
export const clinicalImageTypes = ['X-Ray', 'Intraoral Photo', 'Scan', 'Other'];

export const financialPageStats = [
  {
    title: "Total Revenue",
    value: "EGP 750K",
    change: "+12% from last month",
    icon: "TrendingUp",
    changeType: "positive",
  },
  {
    title: "Total Expenses",
    value: "EGP 350K",
    change: "+5% from last month",
    icon: "TrendingDown",
    changeType: "negative",
  },
  {
    title: "Net Profit",
    value: "EGP 400K",
    change: "+15% from last month",
    icon: "DollarSign",
    changeType: "positive",
  },
  {
    title: "Pending Payments",
    value: "EGP 35,000",
    description: "5 invoices pending",
    icon: "Wallet",
    changeType: "neutral",
  },
];

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

export const inventoryPageStats = (totalItems: number, lowStock: number) => [
  {
    title: "Total Items",
    value: totalItems,
    description: "Active inventory",
  },
  {
    title: "Low Stock",
    value: lowStock,
    description: "Items need restocking",
    valueClassName: "text-destructive",
  },
  {
    title: "Total Value",
    value: "EGP 350,000",
    description: "Current inventory",
  },
  {
    title: "Categories",
    value: "8",
    description: "Item categories",
  },
];

export const pharmacyPageStats = (medications: number, prescriptions: number) => [
  {
    title: "Total Medications",
    value: medications,
    description: "Active inventory items",
    icon: "Pill",
  },
  {
    title: "Low Stock Alerts",
    value: "1",
    description: "Items below threshold",
    icon: "AlertTriangle",
    valueClassName: "text-destructive",
  },
  {
    title: "Expiring Soon",
    value: "2",
    description: "Within 30 days",
    icon: "CalendarClock",
    valueClassName: "text-destructive",
  },
  {
    title: "Pending Prescriptions",
    value: prescriptions,
    description: "Awaiting dispensing",
    icon: "ClipboardList",
  },
];

export const suppliersPageStats = (suppliers: number, pendingOrders: number) => [
  {
    title: "Active Suppliers",
    value: suppliers,
    description: "Verified and approved",
    icon: "Building2",
  },
  {
    title: "Pending Orders",
    value: pendingOrders,
    description: "Awaiting delivery",
    icon: "FileText",
    valueClassName: "text-destructive",
  },
  {
    title: "Monthly Spending",
    value: "EGP 300,000",
    description: "This month",
    icon: "DollarSign",
  },
  {
    title: "Avg Rating",
    value: "4.5",
    description: "Supplier rating",
    icon: "Star",
    valueClassName: "text-yellow-500",
  },
];

export const supplierPaymentTerms = ['Net 15', 'Net 30', 'Net 60', 'Due on receipt'];

export const communicationsPageStats = (messages: number, templates: number) => [
  {
    title: "Messages Sent",
    value: messages,
    description: "Total messages",
  },
  {
    title: "Sent Today",
    value: "0",
    description: "Messages today",
  },
  {
    title: "Delivery Rate",
    value: "66.7%",
    description: "Successfully delivered",
    valueClassName: "text-green-600",
  },
  {
    title: "Templates",
    value: templates,
    description: "Message templates",
  },
];

export const patientPortalPageStats = (pendingRequests: number) => [
  {
    title: "Active Portal Users",
    value: "2",
    description: "Registered patients",
  },
  {
    title: "Unread Messages",
    value: "1",
    description: "Requiring response",
    valueClassName: "text-destructive"
  },
  {
    title: "Pending Requests",
    value: `${pendingRequests}`,
    description: "Appointment requests",
  },
  {
    title: "Shared Documents",
    value: "2",
    description: "Available to patients",
    valueClassName: "text-green-600"
  },
];

export const referralPageStats = [
  {
    title: "Total Referrals",
    value: "2",
    description: "All time",
  },
  {
    title: "Pending Referrals",
    value: "0",
    description: "Awaiting response",
  },
  {
    title: "Completed",
    value: "1",
    description: "This month",
  },
  {
    title: "Incoming",
    value: "1",
    description: "Pending review",
    valueClassName: "text-destructive"
  },
];

export const specialistTypes = ['Oral Surgery', 'Periodontics', 'Orthodontics', 'Endodontics', 'Prosthodontics'];
export const referralUrgency = ['Routine', 'Urgent', 'Emergency'];

export const insurancePageStats = [
  {
    title: "Total Claims",
    value: "3",
    description: "All time",
  },
  {
    title: "Pending Claims",
    value: "1",
    description: "Processing",
    valueClassName: "text-yellow-600",
  },
  {
    title: "Approved Claims",
    value: "1",
    description: "Ready for payment",
    valueClassName: "text-green-600",
  },
  {
    title: "Approved Amount",
    value: "EGP 2,000",
    description: "Total approved",
    valueClassName: "text-green-600",
  },
];

export const insuranceProviders = [
    { id: 'prov1', name: 'Misr Insurance' },
    { id: 'prov2', name: 'Allianz Egypt' },
    { id: 'prov3', name: 'AXA Egypt' },
];

export const commonMedicationsData = [
    {
        name: 'Amoxicillin',
        genericName: 'Generic: Amoxicillin',
        description: 'Antibiotic'
    },
    {
        name: 'Ibuprofen',
        genericName: 'Generic: Ibuprofen',
        description: 'Pain Relief'
    },
    {
        name: 'Cataflam',
        genericName: 'Generic: Diclofenac potassium',
        description: 'Pain Relief'
    }
];

export const analyticsPageStats = [
    {
        title: "Total Revenue",
        value: "EGP 750,000",
        change: "+12.5% from last period",
        icon: "DollarSign",
        changeType: "positive"
    },
    {
        title: "Patient Acquisition",
        value: "12",
        change: "+8.3% from last period",
        icon: "Users",
        changeType: "positive"
    },
    {
        title: "Appointment Show Rate",
        value: "98.2%",
        change: "+2.1% from last period",
        icon: "TrendingUp",
        changeType: "positive"
    },
    {
        title: "Average Treatment Value",
        value: "EGP 6,250",
        change: "-1.2% from last period",
        icon: "Activity",
        changeType: "negative"
    }
];

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

export const reportsPageStats = [
    {
        title: "Total Revenue",
        value: "EGP 9.5M",
        change: "+12.5% from last period",
        icon: "DollarSign",
    },
    {
        title: "Total Patients",
        value: "216",
        change: "+13.2% growth rate",
        icon: "Users",
    },
    {
        title: "Appointments",
        value: "1,247",
        change: "88% show rate",
        icon: "Calendar",
    },
    {
        title: "Avg. Treatment Value",
        value: "EGP 7,500",
        change: "+8.3% increase",
        icon: "TrendingUp",
    }
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

export const billingPageStats = [
  {
    title: "Total Outstanding",
    value: "EGP 5,500",
    description: "Across 2 invoices",
    valueClassName: "text-destructive"
  },
  {
    title: "Paid This Month",
    value: "EGP 2,000",
    description: "From 1 invoice",
    valueClassName: "text-green-600"
  },
  {
    title: "Overdue Invoices",
    value: "0",
    description: "No invoices are overdue",
  },
  {
    title: "Avg. Invoice Value",
    value: "EGP 3,750",
    description: "Based on all invoices",
  },
];

export const allHealthyDentalChart = {
    18: { id: 18, condition: 'healthy', history: [] }, 17: { id: 17, condition: 'healthy', history: [] }, 16: { id: 16, condition: 'healthy', history: [] }, 15: { id: 15, condition: 'healthy', history: [] }, 14: { id: 14, condition: 'healthy', history: [] }, 13: { id: 13, condition: 'healthy', history: [] }, 12: { id: 12, condition: 'healthy', history: [] }, 11: { id: 11, condition: 'healthy', history: [] },
    21: { id: 21, condition: 'healthy', history: [] }, 22: { id: 22, condition: 'healthy', history: [] }, 23: { id: 23, condition: 'healthy', history: [] }, 24: { id: 24, condition: 'healthy', history: [] }, 25: { id: 25, condition: 'healthy', history: [] }, 26: { id: 26, condition: 'healthy', history: [] }, 27: { id: 27, condition: 'healthy', history: [] }, 28: { id: 28, condition: 'healthy', history: [] },
    48: { id: 48, condition: 'healthy', history: [] }, 47: { id: 47, condition: 'healthy', history: [] }, 46: { id: 46, condition: 'healthy', history: [] }, 45: { id: 45, condition: 'healthy', history: [] }, 44: { id: 44, condition: 'healthy', history: [] }, 43: { id: 43, condition: 'healthy', history: [] }, 42: { id: 42, condition: 'healthy', history: [] }, 41: { id: 41, condition: 'healthy', history: [] },
    31: { id: 31, condition: 'healthy', history: [] }, 32: { id: 32, condition: 'healthy', history: [] }, 33: { id: 33, condition: 'healthy', history: [] }, 34: { id: 34, condition: 'healthy', history: [] }, 35: { id: 35, condition: 'healthy', history: [] }, 36: { id: 36, condition: 'healthy', history: [] }, 37: { id: 37, condition: 'healthy', history: [] }, 38: { id: 38, condition: 'healthy', history: [] },
};
