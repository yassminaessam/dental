
"use client";

import { useActionState } from "react";
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
import { financialSummaryData } from "@/lib/data";
import { Lightbulb, ListChecks, Loader2 } from "lucide-react";

const initialState: KpiSuggestionsState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Lightbulb className="mr-2 h-4 w-4" />
          Get Suggestions
        </>
      )}
    </Button>
  );
}

export default function KpiSuggestions() {
  const [state, formAction] = useActionState(getKpiSuggestionsAction, initialState);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>AI-Powered KPI Suggestions</CardTitle>
          <CardDescription>
            Enter your key performance indicators to get AI-powered suggestions
            for improvement.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-3">
            <Label htmlFor="currentRevenue">Current Monthly Revenue</Label>
            <Input
              id="currentRevenue"
              name="currentRevenue"
              type="number"
              placeholder="e.g., 45000"
              defaultValue={financialSummaryData.currentRevenue}
              aria-invalid={!!state?.fieldErrors?.currentRevenue}
              aria-describedby="currentRevenue-error"
            />
             {state?.fieldErrors?.currentRevenue && <p id="currentRevenue-error" className="text-sm font-medium text-destructive">{state.fieldErrors.currentRevenue}</p>}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="patientCount">Total Monthly Patients</Label>
            <Input
              id="patientCount"
              name="patientCount"
              type="number"
              placeholder="e.g., 2350"
              defaultValue={financialSummaryData.patientCount}
              aria-invalid={!!state?.fieldErrors?.patientCount}
              aria-describedby="patientCount-error"
            />
            {state?.fieldErrors?.patientCount && <p id="patientCount-error" className="text-sm font-medium text-destructive">{state.fieldErrors.patientCount}</p>}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="newPatientAcquisitionCost">
              New Patient Acquisition Cost
            </Label>
            <Input
              id="newPatientAcquisitionCost"
              name="newPatientAcquisitionCost"
              type="number"
              placeholder="e.g., 150"
              defaultValue={financialSummaryData.newPatientAcquisitionCost}
              aria-invalid={!!state?.fieldErrors?.newPatientAcquisitionCost}
              aria-describedby="newPatientAcquisitionCost-error"
            />
            {state?.fieldErrors?.newPatientAcquisitionCost && <p id="newPatientAcquisitionCost-error" className="text-sm font-medium text-destructive">{state.fieldErrors.newPatientAcquisitionCost}</p>}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="marketingSpend">Total Marketing Spend</Label>
            <Input
              id="marketingSpend"
              name="marketingSpend"
              type="number"
              placeholder="e.g., 5000"
              defaultValue={financialSummaryData.marketingSpend}
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
                Recommendations
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
