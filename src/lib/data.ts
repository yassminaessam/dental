// Mock data for the dashboard
export const overviewStats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1% from last month",
    icon: "DollarSign",
  },
  {
    title: "Total Patients",
    value: "2,350",
    change: "+180 from last month",
    icon: "Users",
  },
  {
    title: "Appointments",
    value: "1,234",
    change: "+19% from last month",
    icon: "Calendar",
  },
  {
    title: "New Patients",
    value: "234",
    change: "+20 since last month",
    icon: "UserPlus",
  },
];

export const revenueTrendsData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 5500 },
  { month: "Jul", revenue: 7000 },
  { month: "Aug", revenue: 6500 },
  { month: "Sep", revenue: 7500 },
  { month: "Oct", revenue: 8000 },
  { month: "Nov", revenue: 9000 },
  { month: "Dec", revenue: 8500 },
];

export const appointmentTypesData = [
    { name: "Check-up", value: 400, color: "hsl(var(--chart-1))" },
    { name: "Cleaning", value: 300, color: "hsl(var(--chart-2))" },
    { name: "Filling", value: 200, color: "hsl(var(--chart-3))" },
    { name: "Crown", value: 150, color: "hsl(var(--chart-4))" },
    { name: "Root Canal", value: 100, color: "hsl(var(--chart-5))" },
    { name: "Other", value: 84, color: "hsl(var(--muted))" },
];

export const financialSummaryData = {
  currentRevenue: 45231.89,
  patientCount: 2350,
  newPatientAcquisitionCost: 150,
  marketingSpend: 5000,
};
