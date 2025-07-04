import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PatientsPage() {
  return (
    <DashboardLayout>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Patients</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              You have no patients yet
            </h3>
            <p className="text-sm text-muted-foreground">
              You can start by adding a new patient.
            </p>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
