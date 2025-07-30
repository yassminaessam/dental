

export type PatientMessage = {
    id: string;
    patient: string;
    subject: string;
    snippet: string;
    fullMessage: string;
    category: 'treatment' | 'appointment' | 'billing' | 'other';
    priority: 'high' | 'normal' | 'low';
    date: string;
    status: 'Unread' | 'Read';
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

export const initialPatientsData = [
    { id: 'PAT-123', name: 'Ahmed Ali', email: 'ahmed.ali@example.com', phone: '+20 100 123 4567', dob: new Date('1979-01-15'), age: 45, lastVisit: '12/01/2023', status: 'Active' },
    { id: 'PAT-124', name: 'Fatima Mahmoud', email: 'fatima.mahmoud@example.com', phone: '+20 122 987 6543', dob: new Date('1992-05-22'), age: 32, lastVisit: '11/15/2023', status: 'Active' },
];

export const initialAppointmentsData = [
    {
      id: 'APT-001',
      dateTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      patient: 'Ahmed Ali',
      doctor: 'Dr. Nourhan Adel',
      type: 'Check-up',
      duration: '30 minutes',
      status: 'Confirmed'
    },
    {
      id: 'APT-002',
      dateTime: new Date(new Date().setDate(new Date().getDate() + 2)),
      patient: 'Fatima Mahmoud',
      doctor: 'Dr. Khaled Youssef',
      type: 'Cleaning',
      duration: '1 hour',
      status: 'Pending'
    },
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

export const treatmentStats = [
  { label: "Success Rate", value: "94%" },
  { label: "Average Cost", value: "EGP 4500" },
  { label: "Average Duration", value: "45 min" },
  { label: "Follow-up Rate", value: "88%" },
];

export const initialTreatmentsData = [
  {
    id: "TRT-001",
    date: "2024-07-25",
    patient: "Ahmed Ali",
    procedure: "Root Canal",
    doctor: "Dr. Nourhan Adel",
    tooth: "14",
    cost: "EGP 20,000",
    status: "Completed",
    followUp: "2024-08-01",
  },
  {
    id: "TRT-002",
    date: "2024-07-28",
    patient: "Fatima Mahmoud",
    procedure: "Crown Placement",
    doctor: "Dr. Khaled Youssef",
    tooth: "25",
    cost: "EGP 25,000",
    status: "In Progress",
    followUp: "2024-08-10",
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

export const dentalChartPatients = [
    { id: 'pat1', name: 'Ahmed Ali' },
    { id: 'pat2', name: 'Fatima Mahmoud' },
    { id: 'pat3', name: 'Youssef Hassan' },
    { id: 'pat4', name: 'Hana Ibrahim' },
];

export const toothNames: Record<number, string> = {
    11: 'Upper Right Central Incisor', 12: 'Upper Right Lateral Incisor', 13: 'Upper Right Canine', 14: 'Upper Right First Premolar', 15: 'Upper Right Second Premolar', 16: 'Upper Right First Molar', 17: 'Upper Right Second Molar', 18: 'Upper Right Third Molar',
    21: 'Upper Left Central Incisor', 22: 'Upper Left Lateral Incisor', 23: 'Upper Left Canine', 24: 'Upper Left First Premolar', 25: 'Upper Left Second Premolar', 26: 'Upper Left First Molar', 27: 'Upper Left Second Molar', 28: 'Upper Left Third Molar',
    31: 'Lower Left Central Incisor', 32: 'Lower Left Lateral Incisor', 33: 'Lower Left Canine', 34: 'Lower Left First Premolar', 35: 'Lower Left Second Premolar', 36: 'Lower Left First Molar', 37: 'Lower Left Second Molar', 38: 'Lower Left Third Molar',
    41: 'Lower Right Central Incisor', 42: 'Lower Right Lateral Incisor', 43: 'Lower Right Canine', 44: 'Lower Right First Premolar', 45: 'Lower Right Second Premolar', 46: 'Lower Right First Molar', 47: 'Lower Right Second Molar', 48: 'Lower Right Third Molar',
};

const allTeethIds = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];

export const initialDentalChartData = allTeethIds.reduce((acc, id) => {
    acc[id] = {
        id,
        condition: 'healthy',
        history: [],
    };
    return acc;
}, {} as Record<number, { id: number; condition: 'healthy'; history: any[] }>);

// Add some sample history
initialDentalChartData[14].condition = 'root-canal';
initialDentalChartData[14].history = [
    { date: '01/15/2023', condition: 'cavity', notes: 'Initial small cavity detected on buccal surface.' },
    { date: '07/20/2023', condition: 'filling', notes: 'Placed composite filling (A2 shade).' },
    { date: '06/10/2024', condition: 'root-canal', notes: 'Patient reported severe pain. Endodontic treatment performed.' }
];

initialDentalChartData[25].condition = 'crown';
initialDentalChartData[25].history = [
    { date: '03/01/2022', condition: 'filling', notes: 'Large amalgam filling placed.' },
    { date: '09/12/2023', condition: 'crown', notes: 'Fractured cusp. Prepared for and placed porcelain crown.' }
];

initialDentalChartData[36].condition = 'cavity';
initialDentalChartData[36].history = [
    { date: '11/05/2024', condition: 'cavity', notes: 'Occlusal cavity noted during checkup.' }
];

initialDentalChartData[48].condition = 'missing';

export const allHealthyDentalChart = allTeethIds.reduce((acc, id) => {
    acc[id] = { id, condition: 'healthy', history: [] };
    return acc;
}, {} as Record<number, any>);

export const johnDoeDentalChart = (() => {
    const chart = JSON.parse(JSON.stringify(allHealthyDentalChart)); // Deep copy
    chart[14] = { id: 14, condition: 'root-canal', history: [{ date: '01/15/2023', condition: 'cavity', notes: 'Initial small cavity detected on buccal surface.' }, { date: '07/20/2023', condition: 'filling', notes: 'Placed composite filling (A2 shade).' }, { date: '06/10/2024', condition: 'root-canal', notes: 'Patient reported severe pain. Endodontic treatment performed.' }] };
    chart[25] = { id: 25, condition: 'crown', history: [{ date: '03/01/2022', condition: 'filling', notes: 'Large amalgam filling placed.' }, { date: '09/12/2023', condition: 'crown', notes: 'Fractured cusp. Prepared for and placed porcelain crown.' }] };
    chart[36] = { id: 36, condition: 'cavity', history: [{ date: '11/05/2024', condition: 'cavity', notes: 'Occlusal cavity noted during checkup.' }] };
    chart[48] = { id: 48, condition: 'missing', history: [{ date: '01/01/2020', condition: 'missing', notes: 'Extracted due to impaction.' }] };
    return chart;
})();

export const janeSmithDentalChart = (() => {
    const chart = JSON.parse(JSON.stringify(allHealthyDentalChart)); // Deep copy
    chart[11] = { id: 11, condition: 'filling', history: [{ date: '05/10/2023', condition: 'filling', notes: 'Mesial composite filling.' }] };
    chart[12] = { id: 12, condition: 'filling', history: [{ date: '05/10/2023', condition: 'filling', notes: 'Distal composite filling.' }] };
    chart[38] = { id: 38, condition: 'cavity', history: [{ date: '11/15/2023', condition: 'cavity', notes: 'Buccal pit cavity observed.' }] };
    return chart;
})();

export const mockDoctors = [
  { id: 'doc1', name: 'Dr. Nourhan Adel' },
  { id: 'doc2', name: 'Dr. Khaled Youssef' },
  { id: 'doc3', name: 'Dr. Mariam El-Masry' },
];

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

export const staffPerformanceData = [
  { metric: "Attendance Rate", value: "97%" },
  { metric: "Patient Satisfaction", value: "95%" },
  { metric: "Productivity Score", value: "92%" },
  { metric: "Training Completed", value: "100%" },
];

export const initialStaffData = [
  {
    id: 'EMP-001',
    name: 'Dr. Nourhan Adel',
    role: 'Dentist',
    email: 'nourhan.adel@cairodental.com',
    phone: '+20 100 111 2222',
    schedule: 'Sun-Thu, 9am-5pm',
    salary: 'EGP 500,000',
    hireDate: '2022-08-15',
    status: 'Active'
  },
  {
    id: 'EMP-002',
    name: 'Khaled Youssef',
    role: 'Hygienist',
    email: 'khaled.youssef@cairodental.com',
    phone: '+20 122 333 4444',
    schedule: 'Mon-Fri, 10am-6pm',
    salary: 'EGP 250,000',
    hireDate: '2023-01-20',
    status: 'Active'
  },
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

export const initialMedicalRecordsData = [
  {
    id: "MR-001",
    patient: "Ahmed Ali",
    type: "SOAP",
    complaint: "Tooth pain on upper right",
    provider: "Dr. Nourhan Adel",
    date: "Dec 15, 2024",
    status: "Final",
  },
  {
    id: "MR-002",
    patient: "Fatima Mahmoud",
    type: "CLINICAL",
    complaint: "Routine cleaning and checkup",
    provider: "Dr. Khaled Youssef",
    date: "Dec 10, 2024",
    status: "Final",
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

export const initialTransactionHistoryData: any[] = [];

export const transactionCategories = ['Patient Payment', 'Insurance Payment', 'Supplies', 'Salary', 'Rent', 'Utilities', 'Marketing', 'Other'];
export const paymentMethods = ['Credit Card', 'Cash', 'Vodafone Cash', 'Fawry', 'Bank Transfer'];

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
    value: "EGP 350,000",
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

export const initialInventoryItemsData = [
  {
    id: "INV-001",
    name: "Dental Composite Resin",
    expires: "2025-06-15",
    category: "Restorative Materials",
    stock: 15,
    min: 10,
    max: 50,
    status: "Normal",
    unitCost: "EGP 750",
    supplier: "Nile Medical Supplies",
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
    unitCost: "EGP 200",
    supplier: "Egypt Safe Med",
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
    unitCost: "EGP 1500",
    supplier: "Nile Medical Supplies",
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
    unitCost: "EGP 60",
    supplier: "Pharma Misr",
    location: "Refrigerated Storage",
  },
];
export const inventoryCategories = [...new Set(initialInventoryItemsData.map(i => i.category))];

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

export const initialMedicationInventoryData = [
  {
    id: "MED-001",
    name: "Amoxicillin",
    fullName: "Amoxicillin",
    strength: "500mg",
    form: "tablet",
    category: "Antibiotic",
    stock: 150,
    unitPrice: "EGP 12",
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
    unitPrice: "EGP 4",
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
    unitPrice: "EGP 55",
    expiryDate: "2024-08-15",
    status: "Low Stock",
  },
];
export const medicationCategories = [...new Set(initialMedicationInventoryData.map(i => i.category))];


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

export const initialSuppliersData = [
  {
    id: "SUP-001",
    name: "Nile Medical Supplies",
    address: "45 Industrial Zone, 6th of October City",
    phone: "+20 2 3820 0000",
    email: "sales@nilemedical.com",
    category: "Medication",
    paymentTerms: "Net 30",
    rating: 4.8,
    status: "active",
  },
  {
    id: "SUP-002",
    name: "Egypt Dental Equipment",
    address: "12 Ramses St, Cairo",
    phone: "+20 2 2575 1111",
    email: "sales@egyptdental.com",
    category: "Equipment",
    paymentTerms: "Net 15",
    rating: 4.6,
    status: "active",
  },
  {
    id: "SUP-003",
    name: "Pharma Misr",
    address: "7 Obour Buildings, Salah Salem",
    phone: "+20 2 2404 4444",
    email: "contact@pharmamisr.com",
    category: "Supplies",
    paymentTerms: "Net 30",
    rating: 4.2,
    status: "active",
  },
];
export const suppliersData = initialSuppliersData; // for dialogs
export const supplierCategories = [...new Set(initialSuppliersData.map(s => s.category))];
export const supplierPaymentTerms = ['Net 15', 'Net 30', 'Net 60', 'Due on receipt'];

export const initialPurchaseOrdersData = [
  {
    id: "PO-1234",
    supplier: "Nile Medical Supplies",
    orderDate: "2024-12-15",
    deliveryDate: "2024-12-22",
    total: "EGP 20,000",
    status: "Shipped",
  },
  {
    id: "PO-1235",
    supplier: "Egypt Dental Equipment",
    orderDate: "2024-12-10",
    deliveryDate: null,
    total: "EGP 85,000",
    status: "Pending",
  },
  {
    id: "PO-1236",
    supplier: "Pharma Misr",
    orderDate: "2024-11-28",
    deliveryDate: "2024-12-05",
    total: "EGP 5,500",
    status: "Delivered",
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

export const initialRecentMessagesData = [
  {
    id: "MSG-001",
    patient: "Ahmed Ali",
    type: "SMS",
    content: "Reminder: Your appointment is tomorrow at 9:00 ...",
    subContent: null,
    status: "Delivered",
    sent: "Dec 19, 12:00 PM",
  },
  {
    id: "MSG-002",
    patient: "Fatima Mahmoud",
    type: "EMAIL",
    content: "Post-Treatment Care Instructions",
    subContent: "Thank you for visiting our clinic today. Please follo...",
    status: "Read",
    sent: "Dec 18, 5:30 PM",
  },
  {
    id: "MSG-003",
    patient: "Youssef Hassan",
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

export const patientMessagesData: PatientMessage[] = [
    {
        id: 'MSG-001',
        patient: 'Ahmed Ali',
        subject: 'Question about post-treatment care',
        snippet: "Hi, I had my root canal yesterday and I'm experien...",
        fullMessage: "Hi, I had my root canal yesterday and I'm experiencing some discomfort. Is this normal? The pain is manageable with ibuprofen, but I wanted to check if there's anything else I should be doing. Thanks, Ahmed",
        category: 'treatment',
        priority: 'high',
        date: 'Dec 18, 11:15 AM',
        status: 'Unread',
    },
    {
        id: 'MSG-002',
        patient: 'Fatima Mahmoud',
        subject: 'Your appointment reminder',
        snippet: 'This is a reminder that you have an appointment s...',
        fullMessage: 'This is a reminder that you have an appointment scheduled for December 20th at 10:30 AM for a routine cleaning. Please confirm by replying YES to this message. Thank you!',
        category: 'appointment',
        priority: 'normal',
        date: 'Dec 17, 6:00 PM',
        status: 'Read',
    }
];

export const appointmentRequestsData = [
    {
        id: 'REQ-001',
        patient: 'Youssef Hassan',
        requestedDate: 'Next Tuesday afternoon',
        reason: 'Check-up',
    },
    {
        id: 'REQ-002',
        patient: 'Hana Ibrahim',
        requestedDate: 'Thursday, 10:00 AM',
        reason: 'Toothache, need urgent look',
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

export const initialOutgoingReferralsData = [
  {
    id: "REF-001",
    patient: "Ahmed Ali",
    specialist: "Dr. Mostafa Ghoneim",
    specialty: "Oral Surgery",
    reason: "Wisdom tooth extraction - impacted #32",
    urgency: "routine",
    status: "scheduled",
    date: "Dec 15, 2024",
    apptDate: "Appt: Dec 22"
  },
  {
    id: "REF-002",
    patient: "Fatima Mahmoud",
    specialist: "Dr. Reem El-Sherif",
    specialty: "Periodontics",
    reason: "Advanced periodontal disease - requires specialist...",
    urgency: "urgent",
    status: "completed",
    date: "Dec 5, 2024",
    apptDate: "Appt: Dec 12"
  }
];

export const specialistTypes = ['Oral Surgery', 'Periodontics', 'Orthodontics', 'Endodontics', 'Prosthodontics'];
export const referralUrgency = ['Routine', 'Urgent', 'Emergency'];
export const initialSpecialistNetwork = [
    { id: 'spec1', name: 'Dr. Mostafa Ghoneim', specialty: 'Oral Surgery' },
    { id: 'spec2', name: 'Dr. Reem El-Sherif', specialty: 'Periodontics' },
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
    value: "EGP 2,000",
    description: "Total approved",
    valueClassName: "text-green-600",
  },
];

export const initialInsuranceClaimsData = [
  {
    id: "CLM-001",
    patient: "Ahmed Ali",
    patientId: "DC123456789",
    insurance: "Misr Insurance",
    procedure: "Routine Cleaning",
    procedureCode: "D1110",
    amount: "EGP 2,500",
    approvedAmount: "EGP 2,000",
    status: "Approved",
    submitDate: "Dec 16, 2024",
  },
  {
    id: "CLM-002",
    patient: "Fatima Mahmoud",
    patientId: "HF987654321",
    insurance: "Allianz Egypt",
    procedure: "Composite Filling",
    procedureCode: "D2391",
    amount: "EGP 4,500",
    approvedAmount: null,
    status: "Processing",
    submitDate: "Dec 11, 2024",
  },
  {
    id: "CLM-003",
    patient: "Youssef Hassan",
    patientId: "SC456789123",
    insurance: "AXA Egypt",
    procedure: "Crown Placement",
    procedureCode: "D2750",
    amount: "EGP 20,000",
    approvedAmount: null,
    status: "Denied",
    statusReason: "Pre-authorization required",
    submitDate: "Dec 9, 2024",
  },
];

export const insuranceProviders = [
    { id: 'prov1', name: 'Misr Insurance' },
    { id: 'prov2', name: 'Allianz Egypt' },
    { id: 'prov3', name: 'AXA Egypt' },
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

export const initialPrescriptionRecordsData = [
  {
    id: "RX-001",
    patient: "Ahmed Ali",
    medication: "Amoxicillin",
    strength: "500mg",
    dosage: "3 times daily",
    duration: "7 days",
    refills: 0,
    doctor: "Dr. Nourhan Adel",
    date: "Dec 15, 2024",
    status: "Active",
  },
  {
    id: "RX-002",
    patient: "Fatima Mahmoud",
    medication: "Ibuprofen",
    strength: "600mg",
    dosage: "Every 6 hours as needed",
    duration: "5 days",
    refills: 1,
    doctor: "Dr. Nourhan Adel",
    date: "Dec 10, 2024",
    status: "Completed",
  },
  {
    id: "RX-003",
    patient: "Youssef Hassan",
    medication: "Chlorhexidine Rinse",
    strength: "0.12%",
    dosage: "Twice daily",
    duration: "14 days",
    refills: 0,
    doctor: "Dr. Khaled Youssef",
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
