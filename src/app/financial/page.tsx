
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
} from "lucide-react";
import RevenueVsExpensesChart from "@/components/financial/revenue-vs-expenses-chart";
import ExpensesByCategoryChart from "@/components/financial/expenses-by-category-chart";
import { AddTransactionDialog } from "@/components/financial/add-transaction-dialog";
import { useToast } from '@/hooks/use-toast';
import { getCollection, setDocument, updateDocument, deleteDocument } from '@/services/firestore';
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
        const data = await getCollection<any>('transactions');
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
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-3xl font-bold">{t('financial.title')}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">
        <FileText className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
        {t('reports.export_report')}
            </Button>
            <AddTransactionDialog onSave={handleSaveTransaction} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {financialPageStats.map((stat) => {
            const Icon = iconMap[stat.icon as IconKey];
            return (
              <Card key={stat.titleKey}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t(stat.titleKey as string)}
                  </CardTitle>
                  <Icon
                    className={cn(
                      "h-4 w-4 text-muted-foreground",
                      stat.icon === "TrendingUp" && "text-green-500",
                      stat.icon === "TrendingDown" && "text-red-500"
                    )}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.descriptionKey && (
                    <p className="text-xs text-muted-foreground">
                      {t(stat.descriptionKey as string)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{t('financial.revenue_vs_expenses')}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <RevenueVsExpensesChart data={chartData} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('financial.expenses_by_category')}</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
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
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>{t('financial.transaction_history')}</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
                    <Input
                      type="search"
                      placeholder={t('financial.search_transactions')}
                      className={cn(
                        "w-full rounded-lg bg-background lg:w-[336px]",
                        isRTL ? 'pr-8 text-right' : 'pl-8'
                      )}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
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
              <CardContent>
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
