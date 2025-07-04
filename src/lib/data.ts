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
