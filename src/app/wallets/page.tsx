'use client';

import * as React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CardIcon } from '@/components/ui/card-icon';
import { cn } from '@/lib/utils';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  RefreshCw,
  Users,
  TrendingUp,
  DollarSign,
  Receipt,
  History,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface WalletData {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  patientEmail: string | null;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalPayments: number;
  totalRefunds: number;
  isActive: boolean;
  autoPayEnabled: boolean;
  lowBalanceAlert: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  paymentMethod: string | null;
  processedByName: string | null;
  createdAt: string;
}

interface Patient {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

const paymentMethods = [
  { value: 'Cash', label: 'wallet.payment_methods.cash' },
  { value: 'Card', label: 'wallet.payment_methods.card' },
  { value: 'BankTransfer', label: 'wallet.payment_methods.bank_transfer' },
  { value: 'Check', label: 'wallet.payment_methods.check' },
  { value: 'Other', label: 'wallet.payment_methods.other' },
];

export default function WalletsPage() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const dateLocale = language === 'ar' ? ar : enUS;

  const [wallets, setWallets] = React.useState<WalletData[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = React.useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = React.useState(false);
  const [transactionsDialogOpen, setTransactionsDialogOpen] = React.useState(false);
  
  // Selected wallet for operations
  const [selectedWallet, setSelectedWallet] = React.useState<WalletData | null>(null);
  const [selectedPatientId, setSelectedPatientId] = React.useState('');
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  
  // Form states
  const [amount, setAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('Cash');
  const [description, setDescription] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  // Stats
  const [stats, setStats] = React.useState({
    totalWallets: 0,
    totalBalance: 0,
    totalDeposits: 0,
    totalPayments: 0,
  });

  // Fetch wallets
  const fetchWallets = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallet?action=list');
      if (response.ok) {
        const data = await response.json();
        setWallets(data.wallets || []);
        
        // Calculate stats
        const walletList = data.wallets || [];
        setStats({
          totalWallets: walletList.length,
          totalBalance: walletList.reduce((sum: number, w: WalletData) => sum + w.balance, 0),
          totalDeposits: walletList.reduce((sum: number, w: WalletData) => sum + w.totalDeposits, 0),
          totalPayments: walletList.reduce((sum: number, w: WalletData) => sum + w.totalPayments, 0),
        });
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      toast({
        title: t('wallet.toast.error_loading'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  // Fetch patients without wallets
  const fetchPatients = React.useCallback(async () => {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchWallets();
    fetchPatients();
  }, [fetchWallets, fetchPatients]);

  // Get patients without wallets
  const patientsWithoutWallets = React.useMemo(() => {
    const walletPatientIds = new Set(wallets.map(w => w.patientId));
    return patients.filter(p => !walletPatientIds.has(p.id));
  }, [patients, wallets]);

  // Filter wallets by search
  const filteredWallets = React.useMemo(() => {
    if (!searchTerm) return wallets;
    const term = searchTerm.toLowerCase();
    return wallets.filter(w => 
      w.patientName?.toLowerCase().includes(term) ||
      w.patientPhone?.toLowerCase().includes(term) ||
      w.patientEmail?.toLowerCase().includes(term)
    );
  }, [wallets, searchTerm]);

  // Create wallet for patient
  const handleCreateWallet = async () => {
    if (!selectedPatientId) return;
    
    setProcessing(true);
    try {
      const patient = patients.find(p => p.id === selectedPatientId);
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          patientId: selectedPatientId,
          patientName: patient?.name,
          patientPhone: patient?.phone,
          patientEmail: patient?.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create wallet');
      }

      toast({
        title: t('wallet.toast.wallet_created'),
        description: t('wallet.toast.wallet_created_desc'),
      });
      
      setCreateDialogOpen(false);
      setSelectedPatientId('');
      fetchWallets();
    } catch (error) {
      toast({
        title: t('wallet.toast.error_creating'),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!selectedWallet || !amount) return;
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast({
        title: t('common.error'),
        description: t('billing.validation.amount_positive'),
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          walletId: selectedWallet.id,
          amount: depositAmount,
          paymentMethod,
          description: description || `Deposit - ${paymentMethod}`,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deposit');
      }

      toast({
        title: t('wallet.toast.deposit_success'),
        description: t('wallet.toast.deposit_success_desc'),
      });
      
      resetForm();
      setDepositDialogOpen(false);
      fetchWallets();
    } catch (error) {
      toast({
        title: t('wallet.toast.error_deposit'),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!selectedWallet || !amount) return;
    
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({
        title: t('common.error'),
        description: t('billing.validation.amount_positive'),
        variant: 'destructive',
      });
      return;
    }

    if (withdrawAmount > selectedWallet.balance) {
      toast({
        title: t('wallet.toast.insufficient_balance'),
        description: t('wallet.toast.insufficient_balance_desc'),
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdraw',
          walletId: selectedWallet.id,
          amount: withdrawAmount,
          description: description || 'Withdrawal',
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw');
      }

      toast({
        title: t('wallet.toast.withdraw_success'),
        description: t('wallet.toast.withdraw_success_desc'),
      });
      
      resetForm();
      setWithdrawDialogOpen(false);
      fetchWallets();
    } catch (error) {
      toast({
        title: t('wallet.toast.error_withdraw'),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Fetch transactions for a wallet
  const fetchTransactions = async (walletId: string) => {
    try {
      const response = await fetch(`/api/wallet?action=transactions&walletId=${walletId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const openTransactionsDialog = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    setTransactionsDialogOpen(true);
    fetchTransactions(wallet.id);
  };

  const openDepositDialog = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    resetForm();
    setDepositDialogOpen(true);
  };

  const openWithdrawDialog = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    resetForm();
    setWithdrawDialogOpen(true);
  };

  const resetForm = () => {
    setAmount('');
    setPaymentMethod('Cash');
    setDescription('');
    setNotes('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
    }).format(value);
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Deposit': return 'bg-green-100 text-green-800';
      case 'Withdrawal': return 'bg-red-100 text-red-800';
      case 'Payment': return 'bg-blue-100 text-blue-800';
      case 'Refund': return 'bg-purple-100 text-purple-800';
      case 'Adjustment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/30 via-teal-200/20 to-cyan-200/10 dark:from-emerald-900/15 dark:via-teal-900/10 dark:to-cyan-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-amber-200/30 via-orange-200/20 to-red-200/10 dark:from-amber-900/15 dark:via-orange-900/10 dark:to-red-900/5 rounded-full blur-3xl animate-pulse [animation-delay:1.5s]"></div>
        </div>

        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl">
                    <Wallet className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    {t('wallet.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('wallet.description')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  onClick={fetchWallets}
                  className="h-11 px-6 rounded-xl font-semibold bg-background/60 backdrop-blur-sm border-border/50 hover:bg-accent hover:text-accent-foreground hover:border-accent/50 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <RefreshCw className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('common.refresh')}
                </Button>
                <Button 
                  onClick={() => setCreateDialogOpen(true)}
                  className="h-11 px-6 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Plus className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('wallet.create_wallet')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-1.5 grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-0 shadow-sm transition-all duration-500 group metric-card-blue min-h-0">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-0.5 p-1.5 space-y-0">
              <CardTitle className="text-sm font-semibold leading-tight">{t('wallet.total_wallets')}</CardTitle>
              <CardIcon variant="blue" className="w-10 h-10">
                <Users className="h-5 w-5" />
              </CardIcon>
            </CardHeader>
            <CardContent className="p-1.5 pt-0">
              <div className="text-lg font-bold leading-tight">{stats.totalWallets}</div>
              <p className="text-xs text-muted-foreground leading-tight">{t('wallet.active_patient_wallets')}</p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-sm transition-all duration-500 group metric-card-green min-h-0">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-0.5 p-1.5 space-y-0">
              <CardTitle className="text-sm font-semibold leading-tight">{t('wallet.total_balance')}</CardTitle>
              <CardIcon variant="green" className="w-10 h-10">
                <DollarSign className="h-5 w-5" />
              </CardIcon>
            </CardHeader>
            <CardContent className="p-1.5 pt-0">
              <div className="text-lg font-bold text-green-600 leading-tight">{formatCurrency(stats.totalBalance)}</div>
              <p className="text-xs text-muted-foreground leading-tight">{t('wallet.available_funds')}</p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-sm transition-all duration-500 group metric-card-purple min-h-0">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-0.5 p-1.5 space-y-0">
              <CardTitle className="text-sm font-semibold leading-tight">{t('wallet.total_deposits')}</CardTitle>
              <CardIcon variant="purple" className="w-10 h-10">
                <TrendingUp className="h-5 w-5" />
              </CardIcon>
            </CardHeader>
            <CardContent className="p-1.5 pt-0">
              <div className="text-lg font-bold leading-tight">{formatCurrency(stats.totalDeposits)}</div>
              <p className="text-xs text-muted-foreground leading-tight">{t('wallet.all_time_deposits')}</p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-sm transition-all duration-500 group metric-card-orange min-h-0">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-0.5 p-1.5 space-y-0">
              <CardTitle className="text-sm font-semibold leading-tight">{t('wallet.total_payments')}</CardTitle>
              <CardIcon variant="orange" className="w-10 h-10">
                <Receipt className="h-5 w-5" />
              </CardIcon>
            </CardHeader>
            <CardContent className="p-1.5 pt-0">
              <div className="text-lg font-bold leading-tight">{formatCurrency(stats.totalPayments)}</div>
              <p className="text-xs text-muted-foreground leading-tight">{t('wallet.payments_from_wallets')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Wallets Table Card */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>{t('wallet.all_wallets')}</CardTitle>
            <CardDescription>{t('wallet.manage_all_wallets')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
                <Input
                  placeholder={t('wallet.search_patients')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                />
              </div>
            </div>

            {/* Wallets Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.patient')}</TableHead>
                    <TableHead>{t('common.phone')}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('wallet.balance')}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('wallet.total_deposits')}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('wallet.total_payments')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {t('common.loading')}
                      </TableCell>
                    </TableRow>
                  ) : filteredWallets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {t('wallet.no_wallets')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWallets.map((wallet) => (
                      <TableRow key={wallet.id}>
                        <TableCell className="font-medium">{wallet.patientName}</TableCell>
                        <TableCell dir="ltr">{wallet.patientPhone || '-'}</TableCell>
                        <TableCell className={cn("font-semibold text-green-600", isRTL ? 'text-left' : 'text-right')}>
                          {formatCurrency(wallet.balance)}
                        </TableCell>
                        <TableCell className={isRTL ? 'text-left' : 'text-right'}>{formatCurrency(wallet.totalDeposits)}</TableCell>
                        <TableCell className={isRTL ? 'text-left' : 'text-right'}>{formatCurrency(wallet.totalPayments)}</TableCell>
                        <TableCell>
                          <Badge variant={wallet.isActive ? 'default' : 'secondary'}>
                            {wallet.isActive ? t('common.active') : t('common.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                          <div className={cn("flex gap-1", isRTL ? 'justify-start' : 'justify-end')}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDepositDialog(wallet)}
                              title={t('wallet.deposit')}
                            >
                              <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openWithdrawDialog(wallet)}
                              title={t('wallet.withdraw')}
                              disabled={wallet.balance <= 0}
                            >
                              <ArrowUpRight className="h-4 w-4 text-red-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openTransactionsDialog(wallet)}
                              title={t('wallet.transaction_history')}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Create Wallet Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('wallet.create_wallet')}</DialogTitle>
            <DialogDescription>{t('wallet.create_wallet_desc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('common.patient')} *</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('wallet.select_patient')} />
                </SelectTrigger>
                <SelectContent>
                  {patientsWithoutWallets.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} {patient.phone ? `(${patient.phone})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {patientsWithoutWallets.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('wallet.all_patients_have_wallets')}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateWallet} disabled={!selectedPatientId || processing}>
              {processing ? t('common.processing') : t('wallet.create_wallet')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('wallet.deposit_funds')}</DialogTitle>
            <DialogDescription>
              {selectedWallet?.patientName} - {t('wallet.balance')}: {formatCurrency(selectedWallet?.balance || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('wallet.amount')} *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('wallet.payment_method')} *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {t(method.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('wallet.description_label')} {t('wallet.optional')}</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('wallet.deposit_description_placeholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('wallet.notes')} {t('wallet.optional')}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('wallet.notes_placeholder')}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleDeposit} disabled={!amount || processing}>
              {processing ? t('common.processing') : t('wallet.deposit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('wallet.withdraw_funds')}</DialogTitle>
            <DialogDescription>
              {selectedWallet?.patientName} - {t('wallet.available_balance')}: {formatCurrency(selectedWallet?.balance || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('wallet.amount')} *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={selectedWallet?.balance || 0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                {t('wallet.max')}: {formatCurrency(selectedWallet?.balance || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t('wallet.description_label')} {t('wallet.optional')}</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('wallet.withdraw_description_placeholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('wallet.notes')} {t('wallet.optional')}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('wallet.notes_placeholder')}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={!amount || processing || parseFloat(amount) > (selectedWallet?.balance || 0)}
              variant="destructive"
            >
              {processing ? t('common.processing') : t('wallet.withdraw')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transactions History Dialog */}
      <Dialog open={transactionsDialogOpen} onOpenChange={setTransactionsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{t('wallet.transaction_history')}</DialogTitle>
            <DialogDescription>
              {selectedWallet?.patientName} - {t('wallet.balance')}: {formatCurrency(selectedWallet?.balance || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('wallet.date')}</TableHead>
                  <TableHead>{t('common.type')}</TableHead>
                  <TableHead className="text-right">{t('wallet.amount')}</TableHead>
                  <TableHead className="text-right">{t('wallet.balance_after')}</TableHead>
                  <TableHead>{t('wallet.description_label')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t('wallet.no_transactions')}
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(tx.createdAt), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTransactionTypeColor(tx.type)}>
                          {t(`wallet.type.${tx.type.toLowerCase()}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        tx.type === 'Deposit' || tx.type === 'Refund' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'Deposit' || tx.type === 'Refund' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(tx.balanceAfter)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{tx.description || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
