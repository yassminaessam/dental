
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrescriptionsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    router.replace('/pharmacy');
  }, [router]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <Card>
          <CardContent className="h-48 text-center text-muted-foreground flex flex-col items-center justify-center p-6 gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>{t('common.redirecting')} {t('pharmacy.title')}...</p>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
