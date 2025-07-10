
"use server";

import { suggestKPIImprovements } from "@/ai/flows/suggest-kpi-improvements";
import { z } from "zod";

const kpiSchema = z.object({
  currentRevenue: z.coerce.number().positive({ message: "Revenue must be a positive number." }),
  patientCount: z.coerce.number().int().positive({ message: "Patient count must be a positive number." }),
  newPatientAcquisitionCost: z.coerce.number().positive({ message: "Cost must be a positive number." }),
  marketingSpend: z.coerce.number().positive({ message: "Spend must be a positive number." }),
});

export type KpiSuggestionsState = {
  suggestions?: string[];
  error?: string;
  fieldErrors?: {
    currentRevenue?: string[];
    patientCount?: string[];
    newPatientAcquisitionCost?: string[];
    marketingSpend?: string[];
  }
};

export async function getKpiSuggestionsAction(
  prevState: KpiSuggestionsState,
  formData: FormData
): Promise<KpiSuggestionsState> {
  const validatedFields = kpiSchema.safeParse({
    currentRevenue: formData.get("currentRevenue"),
    patientCount: formData.get("patientCount"),
    newPatientAcquisitionCost: formData.get("newPatientAcquisitionCost"),
    marketingSpend: formData.get("marketingSpend"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid input. Please correct the errors below.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await suggestKPIImprovements(validatedFields.data);
    if (result.suggestions && result.suggestions.length > 0) {
      return { suggestions: result.suggestions };
    } else {
      return { suggestions: ["No specific suggestions at this time. All KPIs look healthy."] };
    }
  } catch (e) {
    console.error(e);
    return { error: "An unexpected error occurred while generating suggestions. Please try again." };
  }
}
