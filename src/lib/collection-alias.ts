// Central collection alias + normalization utilities
// Ensures client always uses a canonical form before hitting API routes.

export function normalizeCollectionName(name: string): string {
  return name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // camelCase -> kebab
    .replace(/_/g, '-')
    .toLowerCase();
}

// Optional explicit map for special cases where UI term differs from backend canonical model
const explicitAliases: Record<string, string> = {
  clinicsettings: 'clinic-settings',
  medicalrecords: 'medical-records',
  clinicalimages: 'clinical-images',
  toothimagelinks: 'tooth-image-links',
  insuranceclaims: 'insurance-claims',
  insuranceproviders: 'insurance-providers',
  purchaseorders: 'purchase-orders',
  shareddocuments: 'shared-documents',
  portalusers: 'portal-users'
};

export function resolveCollection(name: string): string {
  const normalized = normalizeCollectionName(name);
  if (explicitAliases[normalized]) return explicitAliases[normalized];
  return normalized;
}
