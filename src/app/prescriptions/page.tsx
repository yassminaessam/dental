
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function PrescriptionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/pharmacy');
  }, [router]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <Card>
          <CardContent className="h-48 text-center text-muted-foreground flex flex-col items-center justify-center p-6 gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Redirecting to Pharmacy...</p>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
