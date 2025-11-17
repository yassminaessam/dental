
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Search,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Sparkles,
  BarChart3,
  PieChart,
} from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import RevenueVsExpensesChart from "@/components/financial/revenue-vs-expenses-chart";
import ExpensesByCategoryChart from "@/components/financial/expenses-by-category-chart";
import { AddTransactionDialog } from "@/components/financial/add-transaction-dialog";
import { useToast } from '@/hooks/use-toast';
import { listDocuments, setDocument, updateDocument, deleteDocument } from '@/lib/data-client';
import { format, isValid } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditTransactionDialog } from '@/components/financial/edit-transaction-dialog';
import { useLanguage } from '@/contexts/LanguageContext';

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  category: string;
  type: 'Revenue' | 'Expense';
  amount: string;
  paymentMethod: string;
  status: 'Completed' | 'Pending';
  patient?: string;
};

const iconMap = {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
};

type IconKey = keyof typeof iconMap;

export default function FinancialPage() {
  const { t, isRTL } = useLanguage();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [chartData, setChartData] = React.useState<any[]>([]);
  const { toast } = useToast();
  const [transactionToEdit, setTransactionToEdit] = React.useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = React.useState<Transaction | null>(null);


  React.useEffect(() => {
    async function fetchTransactions() {
      try {
  // Fetch transactions via REST data client (was getCollection during Firestore era)
  const data = await listDocuments<any>('transactions');
        const parsedData = data.map(t => ({ ...t, date: new Date(t.date) }));
        setTransactions(parsedData);

        // Process data for charts
        const monthlyData: Record<string, { revenue: number, expenses: number, profit: number }> = {};
        parsedData.forEach(t => {
            if (isValid(t.date)) {
                const month = format(t.date, 'yyyy-MM');
                if (!monthlyData[month]) {
                    monthlyData[month] = { revenue: 0, expenses: 0, profit: 0 };
                }
                const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g,""));
                if (t.type === 'Revenue') {
                    monthlyData[month].revenue += amount;
                } else {
                    monthlyData[month].expenses += amount;
                }
                monthlyData[month].profit = monthlyData[month].revenue - monthlyData[month].expenses;
            }
        });

        const sortedChartData = Object.keys(monthlyData).sort().map(month => ({
            month: format(new Date(month + '-02'), 'MMM'),
            ...monthlyData[month]
        }));
        setChartData(sortedChartData);

      } catch (error) {
    toast({ title: t('financial.toast.error_fetching'), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [toast, t]);

  const financialPageStats = React.useMemo(() => {
    const revenue = transactions.filter(t => t.type === 'Revenue').reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0);
    const expenses = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0);
    const netProfit = revenue - expenses;
    const pending = transactions.filter(t => t.status === 'Pending').reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0);

    return [
      {
        titleKey: 'financial.total_revenue',
        value: `EGP ${revenue.toLocaleString()}`,
        descriptionKey: 'financial.total_revenue_desc',
        icon: "TrendingUp",
      },
      {
        titleKey: 'financial.total_expenses',
        value: `EGP ${expenses.toLocaleString()}`,
        descriptionKey: 'financial.total_expenses_desc',
        icon: "TrendingDown",
      },
      {
        titleKey: 'financial.net_profit',
        value: `EGP ${netProfit.toLocaleString()}`,
        descriptionKey: 'financial.net_profit_desc',
        icon: "DollarSign",
      },
      {
        titleKey: 'financial.pending_payments',
        value: `EGP ${pending.toLocaleString()}`,
        descriptionKey: 'financial.pending_payments_desc',
        icon: "Wallet",
      },
    ];
  }, [transactions]);
  
  const expensesByCategory = React.useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'Expense')
      .forEach(t => {
        const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g,""));
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += amount;
      });

    const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--muted))"];
    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name: (
        {
          'Patient Payment': t('financial.category.patient_payment'),
          'Insurance Payment': t('financial.category.insurance_payment'),
          'Supplies': t('financial.category.supplies'),
          'Salary': t('financial.category.salary'),
          'Rent': t('financial.category.rent'),
          'Utilities': t('financial.category.utilities'),
          'Marketing': t('financial.category.marketing'),
          'Other': t('financial.category.other'),
        } as Record<string, string>
      )[name] || name,
      value,
      color: colors[index % colors.length],
    }));
  }, [transactions]);


  const handleSaveTransaction = async (data: Omit<Transaction, 'id' | 'status'>) => {
    try {
      const newTransaction: Transaction = {
        id: `TRN-${Date.now()}`,
        date: new Date(data.date),
        description: data.description,
        type: data.type,
        category: data.category,
        paymentMethod: data.paymentMethod,
        patient: data.patient,
        amount: `EGP ${parseFloat(data.amount as string).toFixed(2)}`,
        status: 'Completed',
      };
      await setDocument('transactions', newTransaction.id, { ...newTransaction, date: newTransaction.date.toISOString() });
      setTransactions(prev => [...prev, newTransaction]);
      toast({
        title: t('financial.toast.transaction_added'),
        description: t('financial.toast.transaction_added_desc'),
      });
    } catch (e) {
      toast({ title: t('financial.toast.error_adding_transaction'), variant: "destructive" });
    }
  };
  
  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    try {
      await updateDocument('transactions', updatedTransaction.id, { ...updatedTransaction, date: updatedTransaction.date.toISOString() });
      setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
      setTransactionToEdit(null);
      toast({
        title: t('financial.toast.transaction_updated'),
        description: t('financial.toast.transaction_updated_desc'),
      });
    } catch (e) {
      toast({ title: t('financial.toast.error_updating_transaction'), variant: 'destructive' });
    }
  };

  const handleDeleteTransaction = async () => {
    if (transactionToDelete) {
      try {
        await deleteDocument('transactions', transactionToDelete.id);
        setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
        toast({
          title: t('financial.toast.transaction_deleted'),
          description: t('financial.toast.transaction_deleted_desc'),
          variant: "destructive",
        });
        setTransactionToDelete(null);
      } catch (e) {
        toast({ title: t('financial.toast.error_deleting_transaction'), variant: 'destructive' });
      }
    }
  };

  const filteredTransactions = React.useMemo(() => {
    return transactions
      .filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.patient?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(transaction => 
        typeFilter === 'all' || transaction.type.toLowerCase() === typeFilter
      );
  }, [transactions, searchTerm, typeFilter]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-200/30 via-yellow-200/20 to-lime-200/10 dark:from-amber-900/15 dark:via-yellow-900/10 dark:to-lime-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/30 via-blue-200/20 to-indigo-200/10 dark:from-cyan-900/15 dark:via-blue-900/10 dark:to-indigo-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Enhanced Financial Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-lime-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-xl">
                    <DollarSign className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 dark:from-sky-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    {t('financial.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('page.financial.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <FileText className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('reports.export_report')}
                </Button>
                <AddTransactionDialog onSave={handleSaveTransaction} />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Financial Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {financialPageStats.map((stat, index) => {
            const Icon = iconMap[stat.icon as IconKey];
            const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-orange', 'metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            const variants = ['blue','green','orange','purple'] as const;
            const variant = variants[index % variants.length];
            return (
              <Card
                key={stat.titleKey}
                className={cn(
                  'relative overflow-hidden border-0 shadow-xl transition-all duration-500 group',
                  cardStyle
                )}
                role="button"
                tabIndex={0}
                aria-label={t(stat.titleKey as string)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {t(stat.titleKey as string)}
                  </CardTitle>
                  <CardIcon variant={variant} aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </CardIcon>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {stat.value}
                  </div>
                  {stat.descriptionKey && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {t(stat.descriptionKey as string)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3 group relative border-2 border-muted hover:border-amber-200 dark:hover:border-amber-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-amber-50/10 dark:to-amber-950/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 group-hover:from-amber-500/20 group-hover:to-yellow-500/20 transition-colors">
                  <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text text-transparent">
                  {t('financial.revenue_vs_expenses')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pl-2 relative z-10">
              <RevenueVsExpensesChart data={chartData} />
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2 group relative border-2 border-muted hover:border-cyan-200 dark:hover:border-cyan-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-cyan-50/10 dark:to-cyan-950/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-colors">
                  <PieChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {t('financial.expenses_by_category')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-[350px] relative z-10">
              <ExpensesByCategoryChart data={expensesByCategory} />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-4">
            <TabsTrigger value="all">{t('financial.all_transactions')}</TabsTrigger>
            <TabsTrigger value="revenue">{t('financial.revenue')}</TabsTrigger>
            <TabsTrigger value="expenses">{t('common.expenses')}</TabsTrigger>
            <TabsTrigger value="reports">{t('nav.reports')}</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <Card className="group relative border-2 border-muted hover:border-lime-200 dark:hover:border-lime-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-lime-50/10 dark:to-lime-950/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-lime-500/5 to-green-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardHeader className="relative z-10 flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-lime-500/10 to-green-500/10 group-hover:from-lime-500/20 group-hover:to-green-500/20 transition-colors">
                    <FileText className="h-5 w-5 text-lime-600 dark:text-lime-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-lime-600 to-green-600 dark:from-lime-400 dark:to-green-400 bg-clip-text text-transparent">
                    {t('financial.transaction_history')}
                  </CardTitle>
                </div>
                
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto group/search">
                    <div className="absolute inset-0 bg-gradient-to-r from-lime-500/20 to-green-500/20 rounded-xl blur-lg opacity-0 group-hover/search:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <Search className={cn("absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover/search:text-lime-500 transition-colors duration-300", isRTL ? 'right-3' : 'left-3')} />
                      <Input
                        type="search"
                        placeholder={t('financial.search_transactions')}
                        className={cn(
                          "w-full rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted hover:border-lime-300 dark:hover:border-lime-700 focus:border-lime-500 dark:focus:border-lime-600 py-5 h-auto lg:w-[336px] shadow-sm hover:shadow-md transition-all duration-300",
                          isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'
                        )}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-[180px] rounded-xl border-2 hover:border-green-300 dark:hover:border-green-700 transition-colors">
                      <SelectValue placeholder={t('common.all_types')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_types')}</SelectItem>
                      <SelectItem value="revenue">{t('financial.revenue')}</SelectItem>
                      <SelectItem value="expense">{t('financial.expense')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('common.description')}</TableHead>
                      <TableHead>{t('financial.category')}</TableHead>
                      <TableHead>{t('financial.type')}</TableHead>
                      <TableHead>{t('financial.amount')}</TableHead>
                      <TableHead>{t('financial.payment_method')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{isValid(transaction.date) ? format(transaction.date, 'PPP') : t('common.na')}</TableCell>
                          <TableCell>
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.patient && (
                              <div className="text-xs text-muted-foreground">
                                {t('common.patient')}: {transaction.patient}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.type === "Revenue"
                                  ? "default"
                                  : "destructive"
                              }
                              className={cn(
                                transaction.type === 'Revenue' && 'bg-green-100 text-green-800',
                                transaction.type === 'Expense' && 'bg-red-100 text-red-800'
                              )}
                            >
                              {transaction.type === 'Revenue' ? t('financial.revenue') : t('financial.expense')}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.amount}</TableCell>
                          <TableCell>{transaction.paymentMethod}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.status === "Completed"
                                  ? "outline"
                                  : "secondary"
                              }
                            >
                              {transaction.status === 'Completed' ? t('common.completed') : t('common.pending')}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn(isRTL ? 'text-left' : 'text-right')}>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setTransactionToEdit(transaction)}>
                                    <Pencil className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                    {t('table.edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setTransactionToDelete(transaction)} className="text-destructive">
                                    <Trash2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                    {t('table.delete')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          {t('table.no_records_found')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="revenue" className="mt-4">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
                <p>{t('financial.empty.revenue_info')}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expenses" className="mt-4">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
                <p>{t('financial.empty.expense_info')}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
                <p>{t('financial.empty.reports_info')}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {transactionToEdit && (
        <EditTransactionDialog
            transaction={transactionToEdit}
            onSave={handleUpdateTransaction}
            open={!!transactionToEdit}
            onOpenChange={(isOpen) => !isOpen && setTransactionToEdit(null)}
        />
      )}

      <AlertDialog open={!!transactionToDelete} onOpenChange={(isOpen) => !isOpen && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('financial.confirm_delete_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}
