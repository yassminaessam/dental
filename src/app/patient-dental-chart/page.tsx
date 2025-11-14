'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Loader2, Sparkles, Calendar } from 'lucide-react';
import InteractiveDentalChart from '@/components/dental-chart/interactive-dental-chart';
import { ToothDetailCard } from '@/components/dental-chart/tooth-detail-card';
import { ToothHistoryDialog } from '@/components/dental-chart/tooth-history-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { allHealthyDentalChart } from '@/lib/data/dental-chart-data';
import type { Tooth, ToothCondition } from '@/app/dental-chart/page';

const dentalChartStats: { condition: ToothCondition; labelKey: string; color: string }[] = [
  { condition: 'healthy', labelKey: 'dental_chart.healthy', color: 'bg-green-200' },
  { condition: 'cavity', labelKey: 'dental_chart.cavity', color: 'bg-red-500' },
  { condition: 'filling', labelKey: 'dental_chart.filling', color: 'bg-blue-500' },
  { condition: 'crown', labelKey: 'dental_chart.crown', color: 'bg-purple-500' },
  { condition: 'missing', labelKey: 'dental_chart.missing', color: 'bg-gray-400' },
  { condition: 'root-canal', labelKey: 'dental_chart.root_canal', color: 'bg-yellow-500' },
];

function PatientDentalChartContent() {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [chartData, setChartData] = React.useState<Record<number, Tooth>>({ ...allHealthyDentalChart });
  const [selectedTooth, setSelectedTooth] = React.useState<Tooth | null>(null);
  const [historyTooth, setHistoryTooth] = React.useState<Tooth | null>(null);
  const [highlightedCondition, setHighlightedCondition] = React.useState<ToothCondition | 'all'>('all');
  const [patientId, setPatientId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user?.email) {
      fetchPatientData();
    }
  }, [user]);

  const fetchPatientData = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      // First, get the patient ID from the email
      const patientResponse = await fetch(`/api/patient/profile?email=${encodeURIComponent(user.email)}`);
      if (patientResponse.ok) {
        const patientData = await patientResponse.json();
        if (patientData.patient?.id) {
          setPatientId(patientData.patient.id);
          // Fetch the dental chart
          await fetchChartData(patientData.patient.id);
        } else {
          toast({
            title: t('dental_chart.error_loading_data'),
            description: 'Patient profile not found',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        title: t('dental_chart.error_loading_data'),
        description: 'Failed to load dental chart',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (patientId: string) => {
    try {
      const response = await fetch(`/api/dental-charts?patientId=${patientId}`);
      if (response.ok) {
        const { chart } = await response.json();
        setChartData(chart || { ...allHealthyDentalChart });
      } else {
        setChartData({ ...allHealthyDentalChart });
      }
    } catch (error) {
      console.error('Error fetching chart:', error);
      setChartData({ ...allHealthyDentalChart });
    }
  };

  const handleToothSelect = (toothId: number) => {
    setSelectedTooth(chartData[toothId] || null);
  };

  const teethCountByCondition = React.useMemo(() => {
    return Object.values(chartData).reduce((acc, tooth) => {
      acc[tooth.condition] = (acc[tooth.condition] || 0) + 1;
      return acc;
    }, {} as Record<ToothCondition, number>);
  }, [chartData]);

  return (
    <div className="p-4 sm:p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Enhanced Header Section */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-2xl"></div>
        <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-xl">
                <Activity className="h-8 w-8" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                {t('dental_chart.title')}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {t('patient_pages.dental_chart.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-6 mb-6">
            {dentalChartStats.map((stat) => {
              const gradientClasses = {
                'healthy': 'metric-card-green',
                'cavity': 'metric-card-red',
                'filling': 'metric-card-blue',
                'crown': 'metric-card-purple',
                'missing': 'metric-card-gray',
                'root-canal': 'metric-card-orange'
              };
              
              return (
                <Card 
                  key={stat.condition}
                  className={`relative overflow-hidden border-0 shadow-xl transition-all duration-500 cursor-pointer hover:scale-105 ${gradientClasses[stat.condition]}`}
                  onClick={() => setHighlightedCondition(stat.condition)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="flex flex-col gap-2 p-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${stat.color} flex-shrink-0 shadow-lg`}></span>
                      <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t(stat.labelKey)}</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {teethCountByCondition[stat.condition] || 0}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Dental Chart and Details */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="group relative border-2 border-muted hover:border-indigo-200 dark:hover:border-indigo-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <CardContent className="relative z-10 p-4 sm:p-6">
                  <InteractiveDentalChart
                    chartData={chartData}
                    selectedToothId={selectedTooth?.id || null}
                    highlightedCondition={highlightedCondition}
                    onToothSelect={handleToothSelect}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              {selectedTooth ? (
                <Card className="sticky top-6 group relative border-2 border-muted hover:border-purple-200 dark:hover:border-purple-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                          <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        {t('dental_chart.tooth_number_display', { id: selectedTooth.id })}
                      </CardTitle>
                      <Badge variant={selectedTooth.condition === 'healthy' ? 'default' : 'secondary'} className="shadow-sm">
                        {t(`dental_chart.${selectedTooth.condition}`)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-gray-600">{t('dental_chart.current_condition')}</h4>
                      <Badge className="text-sm" variant={selectedTooth.condition === 'healthy' ? 'default' : 'secondary'}>
                        {t(`dental_chart.${selectedTooth.condition}`)}
                      </Badge>
                    </div>

                    {selectedTooth.history && selectedTooth.history.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t('dental_chart.treatment_history')}
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {selectedTooth.history.slice(0, 3).map((entry, idx) => (
                            <div key={idx} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {t(`dental_chart.${entry.condition}`)}
                                </Badge>
                                <span className="text-xs text-gray-500">{entry.date}</span>
                              </div>
                              {entry.notes && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{entry.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        {selectedTooth.history.length > 3 && (
                          <button
                            onClick={() => setHistoryTooth(selectedTooth)}
                            className="mt-2 text-sm text-primary hover:underline"
                          >
                            {t('dental_chart.view_full_history')}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="pt-4 border-t bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 -mx-6 px-6 pb-0 rounded-b-xl">
                      <div className="flex items-start gap-2 py-3">
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {t('patient_pages.dental_chart.read_only_note')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-6 group relative border-2 border-dashed border-muted hover:border-indigo-300 dark:hover:border-indigo-700 shadow-lg transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="py-12 text-center text-muted-foreground relative z-10">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                      <Activity className="h-12 w-12 mx-auto relative opacity-50 group-hover:opacity-70 transition-opacity" />
                    </div>
                    <p className="font-medium">{t('dental_chart.select_tooth_description')}</p>
                    <p className="text-xs mt-2 opacity-70">انقر على أي سن لعرض التفاصيل</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* History Dialog */}
      <ToothHistoryDialog
        tooth={historyTooth}
        open={!!historyTooth}
        onOpenChange={(isOpen) => !isOpen && setHistoryTooth(null)}
      />
    </div>
  );
}

export default function PatientDentalChartPage() {
  return (
    <PatientOnly>
      <PatientLayout>
        <PatientDentalChartContent />
      </PatientLayout>
    </PatientOnly>
  );
}
