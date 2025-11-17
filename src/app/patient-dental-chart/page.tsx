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
import { cn } from '@/lib/utils';

// Import category definitions from admin page for consistency
const dentalChartCategories = [
  'basic', 'bleaching', 'bridges', 'crowns', 'fillings', 'inlays', 'onlays', 
  'extractions', 'root_canal', 'pulpotomy', 'posts_cores', 'implants', 
  'veneers', 'scaling', 'gingivectomy', 'imaging', 'other'
];

const dentalChartStats: { condition: ToothCondition; labelKey: string; color: string; category: string }[] = [
  // Basic
  { condition: 'healthy', labelKey: 'dental_chart.healthy', color: 'bg-green-500', category: 'basic' },
  { condition: 'cavity', labelKey: 'dental_chart.cavity', color: 'bg-red-500', category: 'basic' },
  { condition: 'missing', labelKey: 'dental_chart.missing', color: 'bg-gray-500', category: 'basic' },
  
  // Other categories (abbreviated for brevity but include all conditions)
  { condition: 'filling', labelKey: 'dental_chart.filling', color: 'bg-blue-500', category: 'fillings' },
  { condition: 'crown', labelKey: 'dental_chart.crown', color: 'bg-purple-500', category: 'crowns' },
  { condition: 'root-canal', labelKey: 'dental_chart.root_canal', color: 'bg-yellow-500', category: 'root_canal' },
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
    const tooth = chartData[toothId] || null;
    setSelectedTooth(tooth);
    
    // Sync with category cards - highlight the category of the selected tooth
    // But don't highlight healthy teeth (سليم) to avoid highlighting all healthy teeth
    if (tooth && tooth.condition && tooth.condition !== 'healthy') {
      setHighlightedCondition(tooth.condition);
    } else {
      setHighlightedCondition('all');
    }
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
          {/* Category Cards Overview */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 mb-6">
            {dentalChartCategories.map((categoryKey) => {
              const categoryStats = dentalChartStats.filter(stat => stat.category === categoryKey);
              
              // Calculate category totals
              const categoryTotal = categoryStats.reduce((sum, stat) => sum + (teethCountByCondition[stat.condition] || 0), 0);
              const hasData = categoryTotal > 0;
              
              // Get the first condition from this category
              const firstCondition = categoryStats.length > 0 ? categoryStats[0].condition : null;
              const isHighlighted = firstCondition && highlightedCondition !== 'all' && categoryStats.some(s => s.condition === highlightedCondition);
              
              // Check if this category contains the selected tooth's condition
              const isSelectedToothCategory = selectedTooth && categoryStats.some(s => s.condition === selectedTooth.condition);
              
              // Category color schemes
              const categoryColors: Record<string, {bg: string, text: string, badge: string, glow: string, dot: string}> = {
                'basic': {bg: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30', text: 'text-green-700 dark:text-green-300', badge: 'bg-gradient-to-r from-green-600 to-emerald-600', glow: 'from-green-500/20 to-emerald-500/20', dot: 'bg-green-500'},
                'bleaching': {bg: 'from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30', text: 'text-sky-700 dark:text-sky-300', badge: 'bg-gradient-to-r from-sky-500 to-blue-600', glow: 'from-sky-500/20 to-blue-500/20', dot: 'bg-sky-400'},
                'bridges': {bg: 'from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-gradient-to-r from-indigo-600 to-violet-600', glow: 'from-indigo-500/20 to-violet-500/20', dot: 'bg-indigo-500'},
                'crowns': {bg: 'from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-gradient-to-r from-purple-600 to-fuchsia-600', glow: 'from-purple-500/20 to-fuchsia-500/20', dot: 'bg-purple-500'},
                'fillings': {bg: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-gradient-to-r from-blue-600 to-cyan-600', glow: 'from-blue-500/20 to-cyan-500/20', dot: 'bg-blue-500'},
                'inlays': {bg: 'from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30', text: 'text-teal-700 dark:text-teal-300', badge: 'bg-gradient-to-r from-teal-600 to-emerald-600', glow: 'from-teal-500/20 to-emerald-500/20', dot: 'bg-teal-500'},
                'onlays': {bg: 'from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/30', text: 'text-lime-700 dark:text-lime-300', badge: 'bg-gradient-to-r from-lime-600 to-green-600', glow: 'from-lime-500/20 to-green-500/20', dot: 'bg-lime-500'},
                'extractions': {bg: 'from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-gradient-to-r from-orange-600 to-red-600', glow: 'from-orange-500/20 to-red-500/20', dot: 'bg-orange-500'},
                'root_canal': {bg: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30', text: 'text-yellow-700 dark:text-yellow-300', badge: 'bg-gradient-to-r from-yellow-600 to-amber-600', glow: 'from-yellow-500/20 to-amber-500/20', dot: 'bg-yellow-500'},
                'pulpotomy': {bg: 'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-gradient-to-r from-rose-600 to-pink-600', glow: 'from-rose-500/20 to-pink-500/20', dot: 'bg-rose-500'},
                'posts_cores': {bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-gradient-to-r from-amber-600 to-orange-600', glow: 'from-amber-500/20 to-orange-500/20', dot: 'bg-amber-500'},
                'implants': {bg: 'from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30', text: 'text-cyan-700 dark:text-cyan-300', badge: 'bg-gradient-to-r from-cyan-600 to-teal-600', glow: 'from-cyan-500/20 to-teal-500/20', dot: 'bg-cyan-500'},
                'veneers': {bg: 'from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30', text: 'text-pink-700 dark:text-pink-300', badge: 'bg-gradient-to-r from-pink-600 to-rose-600', glow: 'from-pink-500/20 to-rose-500/20', dot: 'bg-pink-500'},
                'scaling': {bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-gradient-to-r from-emerald-600 to-teal-600', glow: 'from-emerald-500/20 to-teal-500/20', dot: 'bg-emerald-500'},
                'gingivectomy': {bg: 'from-fuchsia-50 to-purple-50 dark:from-fuchsia-950/30 dark:to-purple-950/30', text: 'text-fuchsia-700 dark:text-fuchsia-300', badge: 'bg-gradient-to-r from-fuchsia-600 to-purple-600', glow: 'from-fuchsia-500/20 to-purple-500/20', dot: 'bg-fuchsia-500'},
                'imaging': {bg: 'from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30', text: 'text-violet-700 dark:text-violet-300', badge: 'bg-gradient-to-r from-violet-600 to-indigo-600', glow: 'from-violet-500/20 to-indigo-500/20', dot: 'bg-violet-500'},
                'other': {bg: 'from-stone-50 to-gray-50 dark:from-stone-950/30 dark:to-gray-950/30', text: 'text-stone-700 dark:text-stone-300', badge: 'bg-gradient-to-r from-stone-600 to-gray-600', glow: 'from-stone-500/20 to-gray-500/20', dot: 'bg-stone-500'},
              };
              
              const colors = categoryColors[categoryKey] || categoryColors['other'];
              
              const handleCategoryClick = () => {
                if (firstCondition) {
                  const currentIndex = categoryStats.findIndex(s => s.condition === highlightedCondition);
                  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % categoryStats.length;
                  setHighlightedCondition(categoryStats[nextIndex].condition);
                }
              };
              
              return (
                <Card 
                  key={categoryKey}
                  className={cn(
                    "group/category relative overflow-hidden transition-all duration-500 cursor-pointer",
                    "bg-gradient-to-br", colors.bg,
                    "border-2 hover:border-4",
                    hasData ? "shadow-lg hover:shadow-2xl border-transparent hover:scale-110" : "shadow-sm hover:shadow-lg opacity-50 hover:opacity-100 border-muted",
                    isHighlighted && "ring-4 ring-offset-2 ring-indigo-500 scale-110 animate-pulse",
                    isSelectedToothCategory && "ring-4 ring-offset-2 ring-yellow-400 scale-110 shadow-2xl animate-pulse"
                  )}
                  onClick={handleCategoryClick}
                >
                  {/* Animated gradient overlay */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover/category:opacity-100 transition-opacity duration-500",
                    colors.glow
                  )} />
                  
                  {/* Pulsing glow for active categories */}
                  {hasData && (
                    <div className={cn("absolute -inset-1 bg-gradient-to-br blur-xl opacity-30 group-hover/category:opacity-60 transition-opacity duration-500", colors.glow)} />
                  )}
                  
                  <CardContent className="p-2 relative">
                    {/* Category indicator dot */}
                    <div className={cn("absolute top-1 right-1 w-2 h-2 rounded-full shadow-sm animate-pulse", colors.dot)} />
                    
                    <div className="flex flex-col items-center justify-center text-center min-h-[50px]">
                      <h3 className={cn("text-xs font-bold mb-1 group-hover/category:scale-110 transition-transform duration-300 leading-tight", colors.text)}>
                        {t(`dental_chart.category_${categoryKey}`)}
                      </h3>
                      {hasData ? (
                        <span className={cn(
                          "inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-sm font-bold text-white rounded-full shadow-md",
                          "group-hover/category:scale-125 transition-transform duration-300",
                          colors.badge
                        )}>
                          {categoryTotal}
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">0</span>
                      )}
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
