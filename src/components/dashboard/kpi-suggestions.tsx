
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getKpiSuggestionsAction, type KpiSuggestionsState } from "@/lib/actions";
import { Lightbulb, ListChecks, Loader2 } from "lucide-react";
// Migrated from server getCollection to client listDocuments
import { listDocuments } from "@/lib/data-client";
import type { Invoice } from "@/app/billing/page";
import type { Patient } from "@/app/patients/page";
import { useLanguage } from "@/contexts/LanguageContext";

const initialState: KpiSuggestionsState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('dashboard.kpi.generating')}
        </>
      ) : (
        <>
          <Lightbulb className="mr-2 h-4 w-4" />
          {t('dashboard.kpi.get_suggestions')}
        </>
      )}
    </Button>
  );
}

export default function KpiSuggestions() {
  const { t } = useLanguage();
  const [state, formAction] = useActionState(getKpiSuggestionsAction, initialState);
  const [kpiData, setKpiData] = useState({
    currentRevenue: 0,
    patientCount: 0,
    newPatientAcquisitionCost: 150, // Mock value, as this is hard to calculate
    marketingSpend: 5000, // Mock value
  });

  useEffect(() => {
    async function fetchData() {
      const [invoices, patients] = await Promise.all([
        listDocuments<Invoice>('invoices'),
        listDocuments<Patient>('patients'),
      ]);
      const totalRevenue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
      const patientCount = patients.length;
      setKpiData(prev => ({...prev, currentRevenue: totalRevenue, patientCount }));
    }
    fetchData();
  }, [])

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>{t('dashboard.kpi.title')}</CardTitle>
          <CardDescription>
            {t('dashboard.kpi.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-3">
            <Label htmlFor="currentRevenue">{t('dashboard.kpi.current_monthly_revenue')}</Label>
            <Input
              id="currentRevenue"
              name="currentRevenue"
              type="number"
              placeholder={t('dashboard.kpi.revenue_placeholder')}
              defaultValue={kpiData.currentRevenue}
              key={kpiData.currentRevenue} // Re-render when value changes
              aria-invalid={!!state?.fieldErrors?.currentRevenue}
              aria-describedby="currentRevenue-error"
            />
             {state?.fieldErrors?.currentRevenue && <p id="currentRevenue-error" className="text-sm font-medium text-destructive">{state.fieldErrors.currentRevenue}</p>}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="patientCount">{t('dashboard.kpi.total_monthly_patients')}</Label>
            <Input
              id="patientCount"
              name="patientCount"
              type="number"
              placeholder={t('dashboard.kpi.patients_placeholder')}
              defaultValue={kpiData.patientCount}
              key={kpiData.patientCount} // Re-render when value changes
              aria-invalid={!!state?.fieldErrors?.patientCount}
              aria-describedby="patientCount-error"
            />
            {state?.fieldErrors?.patientCount && <p id="patientCount-error" className="text-sm font-medium text-destructive">{state.fieldErrors.patientCount}</p>}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="newPatientAcquisitionCost">
              {t('dashboard.kpi.new_patient_acquisition_cost')}
            </Label>
            <Input
              id="newPatientAcquisitionCost"
              name="newPatientAcquisitionCost"
              type="number"
              placeholder={t('dashboard.kpi.acquisition_placeholder')}
              defaultValue={kpiData.newPatientAcquisitionCost}
              aria-invalid={!!state?.fieldErrors?.newPatientAcquisitionCost}
              aria-describedby="newPatientAcquisitionCost-error"
            />
            {state?.fieldErrors?.newPatientAcquisitionCost && <p id="newPatientAcquisitionCost-error" className="text-sm font-medium text-destructive">{state.fieldErrors.newPatientAcquisitionCost}</p>}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="marketingSpend">{t('dashboard.kpi.total_marketing_spend')}</Label>
            <Input
              id="marketingSpend"
              name="marketingSpend"
              type="number"
              placeholder={t('dashboard.kpi.marketing_placeholder')}
              defaultValue={kpiData.marketingSpend}
              aria-invalid={!!state?.fieldErrors?.marketingSpend}
              aria-describedby="marketingSpend-error"
            />
            {state?.fieldErrors?.marketingSpend && <p id="marketingSpend-error" className="text-sm font-medium text-destructive">{state.fieldErrors.marketingSpend}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <SubmitButton />
          {state?.error && !state.fieldErrors && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}
          {state?.suggestions && (
            <div className="mt-4 w-full rounded-lg border bg-secondary/50 p-4" role="alert">
              <h4 className="mb-2 flex items-center font-semibold">
                <ListChecks className="mr-2 size-5" />
                {t('dashboard.kpi.recommendations')}
              </h4>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {state.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
