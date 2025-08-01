
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
} from "lucide-react";
import RevenueVsExpensesChart from "@/components/financial/revenue-vs-expenses-chart";
import ExpensesByCategoryChart from "@/components/financial/expenses-by-category-chart";
import { AddTransactionDialog } from "@/components/financial/add-transaction-dialog";
import { useToast } from '@/hooks/use-toast';
import { getCollection, setDocument } from '@/services/firestore';

export type Transaction = {
  id: string;
  date: string;
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
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await getCollection<Transaction>('transactions');
        setTransactions(data);
      } catch (error) {
        toast({ title: "Error fetching transactions", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [toast]);

  const financialPageStats = React.useMemo(() => {
    const revenue = transactions.filter(t => t.type === 'Revenue').reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0);
    const expenses = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0);
    const netProfit = revenue - expenses;
    // Note: Pending payments would likely come from the 'invoices' collection, not transactions.
    // This is a simplified calculation based on transactions.
    const pending = transactions.filter(t => t.status === 'Pending').reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0);

    return [
      {
        title: "Total Revenue",
        value: `EGP ${revenue.toLocaleString()}`,
        description: "Total revenue recorded",
        icon: "TrendingUp",
        changeType: "positive",
      },
      {
        title: "Total Expenses",
        value: `EGP ${expenses.toLocaleString()}`,
        description: "Total expenses recorded",
        icon: "TrendingDown",
        changeType: "negative",
      },
      {
        title: "Net Profit",
        value: `EGP ${netProfit.toLocaleString()}`,
        description: "Revenue minus expenses",
        icon: "DollarSign",
        changeType: "positive",
      },
      {
        title: "Pending Payments",
        value: `EGP ${pending.toLocaleString()}`,
        description: "From pending transactions",
        icon: "Wallet",
        changeType: "neutral",
      },
    ];
  }, [transactions]);


  const handleSaveTransaction = async (data: Omit<Transaction, 'id' | 'status'>) => {
    try {
      const newTransaction: Transaction = {
        id: `TRN-${Date.now()}`,
        ...data,
        amount: `EGP ${parseFloat(data.amount).toFixed(2)}`,
        status: 'Completed',
      };
      await setDocument('transactions', newTransaction.id, newTransaction);
      setTransactions(prev => [newTransaction, ...prev]);
      toast({
        title: "Transaction Added",
        description: `New ${newTransaction.type.toLowerCase()} of ${newTransaction.amount} has been recorded.`,
      });
    } catch (e) {
      toast({ title: "Error adding transaction", variant: "destructive" });
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
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <AddTransactionDialog onSave={handleSaveTransaction} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {financialPageStats.map((stat) => {
            const Icon = iconMap[stat.icon as IconKey];
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon
                    className={cn(
                      "h-4 w-4 text-muted-foreground",
                      stat.changeType === "positive" && "text-green-500",
                      stat.changeType === "negative" && "text-red-500"
                    )}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
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
              <CardTitle>Revenue vs Expenses</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <RevenueVsExpensesChart />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ExpensesByCategoryChart />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-4">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Transaction History</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search transactions..."
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.patient && <div className="text-xs text-muted-foreground">Patient: {transaction.patient}</div>}
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
                              {transaction.type}
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
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No transactions found.
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
                <p>Revenue-specific information will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expenses" className="mt-4">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
                <p>Expense-specific information will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
                <p>Financial reports will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
