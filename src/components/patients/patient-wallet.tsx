'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Settings,
  History,
  CreditCard,
  Banknote,
  Building2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  TrendingUp,
  TrendingDown,
  Receipt,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface WalletData {
  id: string;
  patientId: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalPayments: number;
  totalRefunds: number;
  isActive: boolean;
  autoPayEnabled: boolean;
  lowBalanceAlert: number | null;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  lastTransactionAt?: string;
  transactions?: Transaction[];
}

interface Transaction {
  id: string;
  type: 'Deposit' | 'Withdrawal' | 'Payment' | 'Refund' | 'Adjustment' | 'Transfer';
  status: 'Pending' | 'Completed' | 'Failed' | 'Cancelled' | 'Refunded';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  referenceType?: string;
  paymentMethod?: string;
  description: string;
  notes?: string;
  processedBy?: string;
  processedByName?: string;
  createdAt: string;
  completedAt?: string;
}

interface PatientWalletProps {
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  onWalletUpdate?: (wallet: WalletData) => void;
  compact?: boolean;
}

const transactionTypeIcons: Record<string, React.ReactNode> = {
  Deposit: <ArrowDownLeft className="h-4 w-4 text-green-500" />,
  Withdrawal: <ArrowUpRight className="h-4 w-4 text-red-500" />,
  Payment: <Receipt className="h-4 w-4 text-blue-500" />,
  Refund: <RefreshCw className="h-4 w-4 text-purple-500" />,
  Adjustment: <Settings className="h-4 w-4 text-orange-500" />,
  Transfer: <ArrowUpRight className="h-4 w-4 text-cyan-500" />,
};

const transactionStatusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  Refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const paymentMethodIcons: Record<string, React.ReactNode> = {
  Cash: <Banknote className="h-4 w-4" />,
  Card: <CreditCard className="h-4 w-4" />,
  BankTransfer: <Building2 className="h-4 w-4" />,
};

export function PatientWallet({
  patientId,
  patientName,
  patientPhone,
  patientEmail,
  onWalletUpdate,
  compact = false,
}: PatientWalletProps) {
  const { t, language, isRTL } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const { toast } = useToast();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dialogs
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Form states
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('Cash');
  const [depositNotes, setDepositNotes] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [lowBalanceAlert, setLowBalanceAlert] = useState('');

  useEffect(() => {
    fetchWallet();
  }, [patientId]);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      // Try to get existing wallet or create new one
      const response = await fetch(`/api/wallet?patientId=${patientId}`);
      const data = await response.json();

      if (data.wallet) {
        setWallet({
          ...data.wallet,
          balance: parseFloat(data.wallet.balance),
          totalDeposits: parseFloat(data.wallet.totalDeposits),
          totalWithdrawals: parseFloat(data.wallet.totalWithdrawals),
          totalPayments: parseFloat(data.wallet.totalPayments),
          totalRefunds: parseFloat(data.wallet.totalRefunds),
          lowBalanceAlert: data.wallet.lowBalanceAlert ? parseFloat(data.wallet.lowBalanceAlert) : null,
        });
        setAutoPayEnabled(data.wallet.autoPayEnabled);
        setLowBalanceAlert(data.wallet.lowBalanceAlert?.toString() || '');

        // Fetch transactions
        const txResponse = await fetch(`/api/wallet?action=transactions&walletId=${data.wallet.id}&limit=20`);
        const txData = await txResponse.json();
        if (txData.transactions) {
          setTransactions(txData.transactions.map((tx: Transaction) => ({
            ...tx,
            amount: parseFloat(tx.amount as unknown as string),
            balanceBefore: parseFloat(tx.balanceBefore as unknown as string),
            balanceAfter: parseFloat(tx.balanceAfter as unknown as string),
          })));
        }
      } else {
        // Create wallet if doesn't exist
        const createResponse = await fetch('/api/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            patientId,
            patientName,
            patientPhone,
            patientEmail,
          }),
        });
        const createData = await createResponse.json();
        if (createData.wallet) {
          setWallet({
            ...createData.wallet,
            balance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalPayments: 0,
            totalRefunds: 0,
            lowBalanceAlert: null,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast({
        title: t('common.error'),
        description: t('wallet.toast.error_loading'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!wallet || !depositAmount || parseFloat(depositAmount) <= 0) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          walletId: wallet.id,
          amount: depositAmount,
          paymentMethod: depositMethod,
          notes: depositNotes,
          description: t('wallet.deposit_description'),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setWallet({
        ...data.wallet,
        balance: parseFloat(data.wallet.balance),
        totalDeposits: parseFloat(data.wallet.totalDeposits),
        totalWithdrawals: parseFloat(data.wallet.totalWithdrawals),
        totalPayments: parseFloat(data.wallet.totalPayments),
        totalRefunds: parseFloat(data.wallet.totalRefunds),
      });

      toast({
        title: t('wallet.toast.deposit_success'),
        description: t('wallet.toast.deposit_success_desc', { amount: formatCurrency(parseFloat(depositAmount)) }),
      });

      setDepositDialogOpen(false);
      setDepositAmount('');
      setDepositNotes('');
      fetchWallet(); // Refresh to get latest transactions
      onWalletUpdate?.(data.wallet);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('wallet.toast.error_deposit'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!wallet || !withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

    if (parseFloat(withdrawAmount) > wallet.balance) {
      toast({
        title: t('common.error'),
        description: t('wallet.insufficient_balance'),
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdraw',
          walletId: wallet.id,
          amount: withdrawAmount,
          notes: withdrawNotes,
          description: t('wallet.withdrawal_description'),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setWallet({
        ...data.wallet,
        balance: parseFloat(data.wallet.balance),
        totalDeposits: parseFloat(data.wallet.totalDeposits),
        totalWithdrawals: parseFloat(data.wallet.totalWithdrawals),
        totalPayments: parseFloat(data.wallet.totalPayments),
        totalRefunds: parseFloat(data.wallet.totalRefunds),
      });

      toast({
        title: t('wallet.toast.withdraw_success'),
        description: t('wallet.toast.withdraw_success_desc', { amount: formatCurrency(parseFloat(withdrawAmount)) }),
      });

      setWithdrawDialogOpen(false);
      setWithdrawAmount('');
      setWithdrawNotes('');
      fetchWallet();
      onWalletUpdate?.(data.wallet);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('wallet.toast.error_withdraw'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!wallet) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/wallet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: wallet.id,
          autoPayEnabled,
          lowBalanceAlert: lowBalanceAlert ? parseFloat(lowBalanceAlert) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setWallet({
        ...wallet,
        autoPayEnabled: data.wallet.autoPayEnabled,
        lowBalanceAlert: data.wallet.lowBalanceAlert ? parseFloat(data.wallet.lowBalanceAlert) : null,
      });

      toast({
        title: t('wallet.toast.settings_updated'),
        description: t('wallet.toast.settings_updated_desc'),
      });

      setSettingsDialogOpen(false);
      onWalletUpdate?.(data.wallet);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('wallet.toast.error_settings'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('wallet.not_found')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {t('wallet.title')}
            </CardTitle>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => setDepositDialogOpen(true)}>
                <Plus className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setWithdrawDialogOpen(true)} disabled={wallet.balance <= 0}>
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(wallet.balance)}
          </div>
          {wallet.lowBalanceAlert && wallet.balance < wallet.lowBalanceAlert && (
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {t('wallet.low_balance_warning')}
            </p>
          )}
        </CardContent>

        {/* Deposit Dialog */}
        <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowDownLeft className="h-5 w-5 text-green-500" />
                {t('wallet.deposit')}
              </DialogTitle>
              <DialogDescription>{t('wallet.deposit_description')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('wallet.amount')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('wallet.payment_method')}</Label>
                <Select value={depositMethod} onValueChange={setDepositMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        {t('wallet.methods.cash')}
                      </div>
                    </SelectItem>
                    <SelectItem value="Card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {t('wallet.methods.card')}
                      </div>
                    </SelectItem>
                    <SelectItem value="BankTransfer">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {t('wallet.methods.bank_transfer')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('common.notes')}</Label>
                <Textarea
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  placeholder={t('wallet.notes_placeholder')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleDeposit} disabled={submitting || !depositAmount}>
                {submitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />}
                {t('wallet.deposit')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Withdraw Dialog */}
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-red-500" />
                {t('wallet.withdraw')}
              </DialogTitle>
              <DialogDescription>
                {t('wallet.available_balance')}: {formatCurrency(wallet.balance)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('wallet.amount')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  max={wallet.balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('common.notes')}</Label>
                <Textarea
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  placeholder={t('wallet.notes_placeholder')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleWithdraw} disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) > wallet.balance}>
                {submitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />}
                {t('wallet.withdraw')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  // Full wallet view
  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {t('wallet.title')}
              </CardTitle>
              <CardDescription>{t('wallet.description')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSettingsDialogOpen(true)}>
                <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t('wallet.settings')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Balance */}
            <div className="md:col-span-1">
              <div className="text-center p-6 rounded-lg bg-primary/5 border-2 border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">{t('wallet.current_balance')}</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(wallet.balance)}</p>
                {wallet.lowBalanceAlert && wallet.balance < wallet.lowBalanceAlert && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    {t('wallet.low_balance_warning')}
                  </p>
                )}
                <div className="flex gap-2 mt-4 justify-center">
                  <Button onClick={() => setDepositDialogOpen(true)}>
                    <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('wallet.deposit')}
                  </Button>
                  <Button variant="outline" onClick={() => setWithdrawDialogOpen(true)} disabled={wallet.balance <= 0}>
                    <Minus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('wallet.withdraw')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-700 dark:text-green-400">{t('wallet.total_deposits')}</p>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-semibold text-green-700 dark:text-green-400 mt-1">
                    {formatCurrency(wallet.totalDeposits)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-red-700 dark:text-red-400">{t('wallet.total_withdrawals')}</p>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-semibold text-red-700 dark:text-red-400 mt-1">
                    {formatCurrency(wallet.totalWithdrawals)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-700 dark:text-blue-400">{t('wallet.total_payments')}</p>
                    <Receipt className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mt-1">
                    {formatCurrency(wallet.totalPayments)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-purple-700 dark:text-purple-400">{t('wallet.total_refunds')}</p>
                    <RefreshCw className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-semibold text-purple-700 dark:text-purple-400 mt-1">
                    {formatCurrency(wallet.totalRefunds)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('wallet.transaction_history')}
          </CardTitle>
          <CardDescription>{t('wallet.transaction_history_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('wallet.no_transactions')}</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('wallet.transaction_type')}</TableHead>
                    <TableHead>{t('wallet.amount')}</TableHead>
                    <TableHead>{t('wallet.balance_after')}</TableHead>
                    <TableHead>{t('wallet.status')}</TableHead>
                    <TableHead>{t('wallet.date')}</TableHead>
                    <TableHead>{t('wallet.description')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transactionTypeIcons[tx.type]}
                          <span>{t(`wallet.types.${tx.type.toLowerCase()}`)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          tx.type === 'Deposit' || tx.type === 'Refund' ? "text-green-600" : "text-red-600"
                        )}>
                          {tx.type === 'Deposit' || tx.type === 'Refund' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(tx.balanceAfter)}</TableCell>
                      <TableCell>
                        <Badge className={transactionStatusColors[tx.status]}>
                          {t(`wallet.status.${tx.status.toLowerCase()}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {tx.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-green-500" />
              {t('wallet.deposit')}
            </DialogTitle>
            <DialogDescription>{t('wallet.deposit_desc')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('wallet.amount')}</Label>
              <Input
                type="number"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('wallet.payment_method')}</Label>
              <Select value={depositMethod} onValueChange={setDepositMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      {t('wallet.methods.cash')}
                    </div>
                  </SelectItem>
                  <SelectItem value="Card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {t('wallet.methods.card')}
                    </div>
                  </SelectItem>
                  <SelectItem value="BankTransfer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t('wallet.methods.bank_transfer')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t('common.notes')}</Label>
              <Textarea
                value={depositNotes}
                onChange={(e) => setDepositNotes(e.target.value)}
                placeholder={t('wallet.notes_placeholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleDeposit} disabled={submitting || !depositAmount}>
              {submitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />}
              {t('wallet.deposit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-red-500" />
              {t('wallet.withdraw')}
            </DialogTitle>
            <DialogDescription>
              {t('wallet.available_balance')}: {formatCurrency(wallet.balance)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('wallet.amount')}</Label>
              <Input
                type="number"
                step="0.01"
                max={wallet.balance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('common.notes')}</Label>
              <Textarea
                value={withdrawNotes}
                onChange={(e) => setWithdrawNotes(e.target.value)}
                placeholder={t('wallet.notes_placeholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) > wallet.balance}
              variant="destructive"
            >
              {submitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />}
              {t('wallet.withdraw')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('wallet.settings')}
            </DialogTitle>
            <DialogDescription>{t('wallet.settings_desc')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('wallet.auto_pay')}</Label>
                <p className="text-sm text-muted-foreground">{t('wallet.auto_pay_desc')}</p>
              </div>
              <Switch
                checked={autoPayEnabled}
                onCheckedChange={setAutoPayEnabled}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('wallet.low_balance_alert')}</Label>
              <Input
                type="number"
                step="0.01"
                value={lowBalanceAlert}
                onChange={(e) => setLowBalanceAlert(e.target.value)}
                placeholder={t('wallet.low_balance_alert_placeholder')}
              />
              <p className="text-sm text-muted-foreground">{t('wallet.low_balance_alert_desc')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdateSettings} disabled={submitting}>
              {submitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PatientWallet;
