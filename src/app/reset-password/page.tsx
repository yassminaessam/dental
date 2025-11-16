import React, { Suspense } from 'react';
import ResetPasswordClient from './reset-password-client';

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
