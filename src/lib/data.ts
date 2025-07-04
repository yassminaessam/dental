// Mock data for the dashboard
export const overviewStats = [
  {
    title: "Total Patients",
    value: "0",
    change: "+12%",
    icon: "Users",
    changeType: "positive",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Today's Appointments",
    value: "0",
    change: "+5%",
    icon: "CalendarCheck",
    changeType: "positive",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Total Revenue",
    value: "$0",
    change: "+8%",
    icon: "DollarSign",
    changeType: "positive",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
  },
  {
    title: "Active Staff",
    value: "0",
    change: "100%",
    icon: "UserCheck",
    changeType: "neutral",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Pending Appointments",
    value: "0",
    change: "-2%",
    icon: "Clock",
    changeType: "negative",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    title: "Completed Treatments",
    value: "0",
    change: "+15%",
    icon: "CheckCircle",
    changeType: "positive",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
];

export const revenueTrendsData = [
  { month: "Jan", revenue: 42000, expenses: 20000 },
  { month: "Feb", revenue: 40000, expenses: 18000 },
  { month: "Mar", revenue: 45000, expenses: 17000 },
  { month: "Apr", revenue: 43000, expenses: 22000 },
  { month: "May", revenue: 52000, expenses: 21000 },
  { month: "Jun", revenue: 55000, expenses: 24000 },
  { month: "Jul", revenue: 54000, expenses: 25000 },
  { month: "Aug", revenue: 57000, expenses: 26000 },
  { month: "Sep", revenue: 53000, expenses: 23000 },
  { month: "Oct", revenue: 58000, expenses: 24000 },
  { month: "Nov", revenue: 56000, expenses: 22000 },
  { month: "Dec", revenue: 45000, expenses: 21000 },
];

export const appointmentTypesData = [
  { name: "Check-up", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Cleaning", value: 30, color: "hsl(var(--chart-2))" },
  { name: "Filling", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Crown", value: 10, color: "hsl(var(--chart-4))" },
  { name: "Root Canal", value: 5, color: "hsl(var(--chart-5))" },
];

export const financialSummaryData = {
  currentRevenue: 45231.89,
  patientCount: 2350,
  newPatientAcquisitionCost: 150,
  marketingSpend: 5000,
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

export const patientsData = [];

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
    value: "$24,500",
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

export const treatmentStats = [
  { label: "Success Rate", value: "94%" },
  { label: "Average Cost", value: "$275" },
  { label: "Average Duration", value: "45 min" },
  { label: "Follow-up Rate", value: "88%" },
];

export const treatmentRecordsData = [];

export const dentalChartStats = [
    { name: 'Healthy', count: 0, color: 'bg-green-500' },
    { name: 'Cavities', count: 0, color: 'bg-red-500' },
    { name: 'Filled', count: 0, color: 'bg-blue-500' },
    { name: 'Crowned', count: 0, color: 'bg-purple-500' },
    { name: 'Missing', count: 0, color: 'bg-gray-500' },
    { name: 'Root Canal', count: 0, color: 'bg-yellow-500' },
];

export const dentalChartPatients = [
    { id: 'pat1', name: 'John Doe' },
    { id: 'pat2', name: 'Jane Smith' },
    { id: 'pat3', name: 'Peter Jones' },
    { id: 'pat4', name: 'Mary Williams' },
];

export const mockDoctors = [
  { id: 'doc1', name: 'Dr. Emily Wilson' },
  { id: 'doc2', name: 'Dr. James Davis' },
  { id: 'doc3', name: 'Dr. Sarah Miller' },
];

export const appointmentDurations = ['30 minutes', '1 hour', '1.5 hours', '2 hours'];

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
    value: "$42K",
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

export const staffPerformanceData = [
  { metric: "Attendance Rate", value: "97%" },
  { metric: "Patient Satisfaction", value: "95%" },
  { metric: "Productivity Score", value: "92%" },
  { metric: "Training Completed", value: "100%" },
];

export const medicalRecordsPageStats = [
  {
    title: "Total Records",
    value: "2",
    description: "Medical records",
  },
  {
    title: "This Month",
    value: "0",
    description: "New records",
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

export const medicalRecordsData = [
  {
    id: "MR-001",
    patient: "John Smith",
    type: "SOAP",
    complaint: "Tooth pain on upper right",
    provider: "Dr. Emily Wilson",
    date: "Dec 15, 2024",
    status: "Final",
  },
  {
    id: "MR-002",
    patient: "Sarah Johnson",
    type: "CLINICAL",
    complaint: "Routine cleaning and checkup",
    provider: "Dr. James Davis",
    date: "Dec 10, 2024",
    status: "Final",
  },
];


export const financialPageStats = [
  {
    title: "Total Revenue",
    value: "$0",
    change: "+12% from last month",
    icon: "TrendingUp",
    changeType: "positive",
  },
  {
    title: "Total Expenses",
    value: "$0",
    change: "+5% from last month",
    icon: "TrendingDown",
    changeType: "negative",
  },
  {
    title: "Net Profit",
    value: "$0",
    change: "+15% from last month",
    icon: "DollarSign",
    changeType: "positive",
  },
  {
    title: "Pending Payments",
    value: "$2,300",
    description: "5 invoices pending",
    icon: "Wallet",
    changeType: "neutral",
  },
];

export const revenueVsExpensesData = [
  { month: "Jan", revenue: 42000, expenses: 20000, profit: 22000 },
  { month: "Feb", revenue: 40000, expenses: 18000, profit: 22000 },
  { month: "Mar", revenue: 45000, expenses: 17000, profit: 28000 },
  { month: "Apr", revenue: 43000, expenses: 22000, profit: 21000 },
  { month: "May", revenue: 52000, expenses: 21000, profit: 31000 },
  { month: "Jun", revenue: 55000, expenses: 24000, profit: 31000 },
  { month: "Jul", revenue: 54000, expenses: 25000, profit: 29000 },
  { month: "Aug", revenue: 57000, expenses: 26000, profit: 31000 },
  { month: "Sep", revenue: 53000, expenses: 23000, profit: 30000 },
  { month: "Oct", revenue: 58000, expenses: 24000, profit: 34000 },
  { month: "Nov", revenue: 56000, expenses: 22000, profit: 34000 },
  { month: "Dec", revenue: 45000, expenses: 21000, profit: 24000 },
];

export const expensesByCategoryData = [
    { name: 'Salaries', value: 45, color: 'hsl(var(--chart-1))' },
    { name: 'Supplies', value: 25, color: 'hsl(var(--chart-2))' },
    { name: 'Rent', value: 15, color: 'hsl(var(--chart-3))' },
    { name: 'Marketing', value: 10, color: 'hsl(var(--chart-4))' },
    { name: 'Other', value: 5, color: 'hsl(var(--chart-5))' },
];

export const transactionHistoryData: any[] = [];

export const inventoryPageStats = [
  {
    title: "Total Items",
    value: "10",
    description: "Active inventory",
  },
  {
    title: "Low Stock",
    value: "2",
    description: "Items need restocking",
    valueClassName: "text-destructive",
  },
  {
    title: "Total Value",
    value: "$22,348.35",
    description: "Current inventory",
  },
  {
    title: "Categories",
    value: "8",
    description: "Item categories",
  },
];

export const lowStockItems = [
  {
    name: "Disposable Gloves (Box)",
    stock: 8,
    minStock: 20,
  },
  {
    name: "Anesthetic Cartridges",
    stock: 5,
    minStock: 12,
  },
];

export const inventoryItemsData = [
  {
    id: "INV-001",
    name: "Dental Composite Resin",
    expires: "2025-06-15",
    category: "Restorative Materials",
    stock: 15,
    min: 10,
    max: 50,
    status: "Normal",
    unitCost: "$45.99",
    supplier: "DentalSupplies Inc.",
    location: "Storage Room A",
  },
  {
    id: "INV-002",
    name: "Disposable Gloves (Box)",
    expires: "N/A",
    category: "Safety Equipment",
    stock: 8,
    min: 20,
    max: 100,
    status: "Low Stock",
    unitCost: "$12.50",
    supplier: "MedSafe Corp",
    location: "Supply Closet",
  },
  {
    id: "INV-003",
    name: "Dental Impression Material",
    expires: "2025-03-20",
    category: "Impression Materials",
    stock: 25,
    min: 15,
    max: 60,
    status: "Normal",
    unitCost: "$89.99",
    supplier: "ProDental Materials",
    location: "Storage Room A",
  },
  {
    id: "INV-004",
    name: "Anesthetic Cartridges",
    expires: "2025-08-30",
    category: "Anesthetics",
    stock: 5,
    min: 12,
    max: 40,
    status: "Low Stock",
    unitCost: "$3.75",
    supplier: "PharmaSupply Ltd",
    location: "Refrigerated Storage",
  },
];

export const pharmacyPageStats = [
  {
    title: "Total Medications",
    value: "3",
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
    value: "1",
    description: "Awaiting dispensing",
    icon: "ClipboardList",
  },
];

export const medicationInventoryData = [
  {
    id: "MED-001",
    name: "Amoxicillin",
    fullName: "Amoxicillin",
    strength: "500mg",
    form: "tablet",
    category: "Antibiotic",
    stock: 150,
    unitPrice: "$0.75",
    expiryDate: "2025-12-31",
    status: "In Stock",
  },
  {
    id: "MED-002",
    name: "Ibuprofen",
    fullName: "Ibuprofen",
    strength: "400mg",
    form: "tablet",
    category: "Analgesic",
    stock: 200,
    unitPrice: "$0.25",
    expiryDate: "2025-06-30",
    status: "In Stock",
  },
  {
    id: "MED-003",
    name: "Lidocaine",
    fullName: "Lidocaine HCl",
    strength: "2%",
    form: "injection",
    category: "Anesthetic",
    stock: 25,
    unitPrice: "$3.50",
    expiryDate: "2024-08-15",
    status: "Low Stock",
  },
];

export const suppliersPageStats = [
  {
    title: "Active Suppliers",
    value: "3",
    description: "Verified and approved",
    icon: "Building2",
  },
  {
    title: "Pending Orders",
    value: "1",
    description: "Awaiting delivery",
    icon: "FileText",
    valueClassName: "text-destructive",
  },
  {
    title: "Monthly Spending",
    value: "$19,220.75",
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

export const suppliersData = [
  {
    id: "SUP-001",
    name: "MedPharma Supplies",
    address: "123 Medical District",
    phone: "+1-555-0123",
    email: "orders@medpharma.com",
    category: "Medication",
    paymentTerms: "Net 30",
    rating: 4.8,
    status: "active",
  },
  {
    id: "SUP-002",
    name: "Dental Equipment Co.",
    address: "456 Equipment Way",
    phone: "+1-555-0124",
    email: "sales@dentalequip.com",
    category: "Equipment",
    paymentTerms: "Net 15",
    rating: 4.6,
    status: "active",
  },
  {
    id: "SUP-003",
    name: "Medical Supplies Plus",
    address: "789 Supply Lane",
    phone: "+1-555-0125",
    email: "contact@medsupplies.com",
    category: "Supplies",
    paymentTerms: "Net 30",
    rating: 4.2,
    status: "active",
  },
];

export const communicationsPageStats = [
  {
    title: "Messages Sent",
    value: "3",
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
    value: "3",
    description: "Message templates",
  },
];

export const recentMessagesData = [
  {
    id: "MSG-001",
    patient: "John Smith",
    type: "SMS",
    content: "Reminder: Your appointment is tomorrow at 9:00 ...",
    subContent: null,
    status: "Delivered",
    sent: "Dec 19, 12:00 PM",
  },
  {
    id: "MSG-002",
    patient: "Sarah Johnson",
    type: "EMAIL",
    content: "Post-Treatment Care Instructions",
    subContent: "Thank you for visiting our clinic today. Please follo...",
    status: "Read",
    sent: "Dec 18, 5:30 PM",
  },
  {
    id: "MSG-003",
    patient: "Michael Brown",
    type: "SMS",
    content: "Your dental cleaning is scheduled for next week. R...",
    subContent: null,
    status: "Sent",
    sent: "Dec 17, 2:00 PM",
  },
];

export const patientPortalPageStats = [
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
    value: "1",
    description: "Appointment requests",
  },
  {
    title: "Shared Documents",
    value: "2",
    description: "Available to patients",
    valueClassName: "text-green-600"
  },
];

export const patientMessagesData = [
    {
        id: 'MSG-001',
        patient: 'John Smith',
        subject: 'Question about post-treatment care',
        snippet: "Hi, I had my root canal yesterday and I'm experien...",
        category: 'treatment',
        priority: 'high',
        date: 'Dec 18, 11:15 AM',
        status: 'Unread',
    },
    {
        id: 'MSG-002',
        patient: 'Sarah Johnson',
        subject: 'Your appointment reminder',
        snippet: 'This is a reminder that you have an appointment s...',
        category: 'appointment',
        priority: 'normal',
        date: 'Dec 17, 6:00 PM',
        status: 'Read',
    }
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

export const outgoingReferralsData = [
  {
    id: "REF-001",
    patient: "John Smith",
    specialist: "Dr. Robert Chen",
    specialty: "Oral Surgery",
    reason: "Wisdom tooth extraction - impacted #32",
    urgency: "routine",
    status: "scheduled",
    date: "Dec 15, 2024",
    apptDate: "Appt: Dec 22"
  },
  {
    id: "REF-002",
    patient: "Sarah Johnson",
    specialist: "Dr. Maria Rodriguez",
    specialty: "Periodontics",
    reason: "Advanced periodontal disease - requires specialist...",
    urgency: "urgent",
    status: "completed",
    date: "Dec 5, 2024",
    apptDate: "Appt: Dec 12"
  }
];

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
    value: "$120",
    description: "Total approved",
    valueClassName: "text-green-600",
  },
];

export const insuranceClaimsData = [
  {
    id: "CLM-001",
    patient: "John Smith",
    patientId: "DC123456789",
    insurance: "DentalCare Plus",
    procedure: "Routine Cleaning",
    procedureCode: "D1110",
    amount: "$150",
    approvedAmount: "$120",
    status: "Approved",
    submitDate: "Dec 16, 2024",
  },
  {
    id: "CLM-002",
    patient: "Sarah Johnson",
    patientId: "HF987654321",
    insurance: "HealthFirst Dental",
    procedure: "Composite Filling",
    procedureCode: "D2391",
    amount: "$275",
    status: "Processing",
    submitDate: "Dec 11, 2024",
  },
  {
    id: "CLM-003",
    patient: "Michael Brown",
    patientId: "SC456789123",
    insurance: "SmileCare Insurance",
    procedure: "Crown Placement",
    procedureCode: "D2750",
    amount: "$1200",
    status: "Denied",
    statusReason: "Pre-authorization required",
    submitDate: "Dec 9, 2024",
  },
];

export const prescriptionPageStats = [
  {
    title: "Total Prescriptions",
    value: "3",
    description: "All time",
  },
  {
    title: "Active Prescriptions",
    value: "2",
    description: "Currently active",
  },
  {
    title: "Completed This Month",
    value: "1",
    description: "Successfully filled",
  },
  {
    title: "Common Medications",
    value: "3",
    description: "In database",
  },
];

export const prescriptionRecordsData = [
  {
    id: "RX-001",
    patient: "John Smith",
    medication: "Amoxicillin",
    strength: "500mg",
    dosage: "3 times daily",
    duration: "7 days",
    refills: 0,
    doctor: "Dr. Emily Wilson",
    date: "Dec 15, 2024",
    status: "Active",
  },
  {
    id: "RX-002",
    patient: "Sarah Johnson",
    medication: "Ibuprofen",
    strength: "600mg",
    dosage: "Every 6 hours as needed",
    duration: "5 days",
    refills: 1,
    doctor: "Dr. Emily Wilson",
    date: "Dec 10, 2024",
    status: "Completed",
  },
  {
    id: "RX-003",
    patient: "Michael Brown",
    medication: "Chlorhexidine Rinse",
    strength: "0.12%",
    dosage: "Twice daily",
    duration: "14 days",
    refills: 0,
    doctor: "Dr. James Davis",
    date: "Dec 8, 2024",
    status: "Active",
  },
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
        name: 'Vicodin',
        genericName: 'Generic: Hydrocodone/Acetaminophen',
        description: 'Pain Relief'
    }
];

export const analyticsPageStats = [
    {
        title: "Total Revenue",
        value: "$0",
        change: "+12.5% from last period",
        icon: "DollarSign",
        changeType: "positive"
    },
    {
        title: "Patient Acquisition",
        value: "0",
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
        value: "$385",
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
        value: "$578K",
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
        value: "$463",
        change: "+8.3% increase",
        icon: "TrendingUp",
    }
];

export const reportsRevenueTrendData = [
  { month: "Jan", revenue: 38000, expenses: 28000 },
  { month: "Feb", revenue: 40000, expenses: 30000 },
  { month: "Mar", revenue: 37000, expenses: 25000 },
  { month: "Apr", revenue: 43000, expenses: 33000 },
  { month: "May", revenue: 48000, expenses: 38000 },
  { month: "Jun", revenue: 52000, expenses: 42000 },
  { month: "Jul", revenue: 55000, expenses: 45000 },
  { month: "Aug", revenue: 58000, expenses: 48000 },
  { month: "Sep", revenue: 53000, expenses: 43000 },
  { month: "Oct", revenue: 59000, expenses: 49000 },
  { month: "Nov", revenue: 61000, expenses: 51000 },
  { month: "Dec", revenue: 63000, expenses: 53000 },
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
