'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  Banknote,
  DollarSign,
  User,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Loader2,
  History,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  Send,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface Shift {
  id: string;
  staffId: string;
  staff: Staff;
  status: string;
  actualStart?: string;
  openingCashAmount?: number;
  closingCashAmount?: number;
}

interface CashTransaction {
  id: string;
  type: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  cashAmount?: number;
  cardAmount?: number;
  description?: string;
  staff: Staff;
  createdAt: string;
}

interface CashHandover {
  id: string;
  fromStaff: Staff;
  toStaff: Staff;
  status: string;
  handoverTime: string;
  importantNotes?: any[];
}

interface CashDrawerHandoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff[];
  activeShift?: Shift | null;
  currentStaffId?: string;
  onHandoverComplete?: () => void;
}

export function CashDrawerHandoverDialog({
  open,
  onOpenChange,
  staff,
  activeShift,
  currentStaffId,
  onHandoverComplete,
}: CashDrawerHandoverDialogProps) {
  const { t, language, isRTL } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const { toast } = useToast();

  const [mode, setMode] = React.useState<'initiate' | 'receive' | 'history'>('initiate');
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  
  const [currentBalance, setCurrentBalance] = React.useState(0);
  const [transactions, setTransactions] = React.useState<CashTransaction[]>([]);
  const [pendingCashHandovers, setPendingCashHandovers] = React.useState<CashHandover[]>([]);
  const [handoverHistory, setHandoverHistory] = React.useState<CashHandover[]>([]);

  // Form state
  const [toStaffId, setToStaffId] = React.useState('');
  const [cashAmount, setCashAmount] = React.useState('');
  const [notes, setNotes] = React.useState('');
  
  // Receive state
  const [selectedHandover, setSelectedHandover] = React.useState<CashHandover | null>(null);
  const [confirmedAmount, setConfirmedAmount] = React.useState('');
  const [discrepancyNotes, setDiscrepancyNotes] = React.useState('');

  React.useEffect(() => {
    if (open && activeShift) {
      fetchData();
    }
  }, [open, activeShift]);

  const fetchData = async () => {
    if (!activeShift) return;
    setLoading(true);
    try {
      const [balanceRes, transactionsRes, handoversRes] = await Promise.all([
        fetch(`/api/shifts?action=cash-balance&shiftId=${activeShift.id}`),
        fetch(`/api/shifts?action=cash-transactions&shiftId=${activeShift.id}`),
        fetch(`/api/handovers?type=CashDrawer&staffId=${currentStaffId}`),
      ]);

      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setCurrentBalance(data.balance || activeShift.openingCashAmount || 0);
      }

      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setTransactions(data.transactions || []);
      }

      if (handoversRes.ok) {
        const data = await handoversRes.json();
        const handovers = data.handovers || [];
        setPendingCashHandovers(handovers.filter((h: CashHandover) => 
          h.status === 'Pending' && h.toStaff.id === currentStaffId
        ));
        setHandoverHistory(handovers.filter((h: CashHandover) => h.status === 'Completed'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateHandover = async () => {
    if (!toStaffId || !cashAmount || !activeShift) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate-cash-handover',
          fromStaffId: currentStaffId,
          toStaffId,
          fromShiftId: activeShift.id,
          cashAmount: parseFloat(cashAmount),
          notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to initiate cash handover');

      toast({
        title: t('cash_drawer.toast.initiated'),
        description: t('cash_drawer.toast.initiated_desc'),
      });

      resetForm();
      fetchData();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('cash_drawer.toast.error_initiate'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiveHandover = async () => {
    if (!selectedHandover || !confirmedAmount) return;
    setSubmitting(true);
    try {
      // First create a new shift for the receiving staff
      const shiftResponse = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          staffId: currentStaffId,
          scheduledStart: new Date().toISOString(),
          scheduledEnd: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          shiftType: 'Regular',
        }),
      });

      if (!shiftResponse.ok) throw new Error('Failed to create shift');
      const { shift: newShift } = await shiftResponse.json();

      // Start the shift
      await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          shiftId: newShift.id,
          openingCashAmount: parseFloat(confirmedAmount),
        }),
      });

      // Complete the cash handover
      const response = await fetch('/api/handovers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete-cash-handover',
          handoverId: selectedHandover.id,
          toShiftId: newShift.id,
          confirmedCashAmount: parseFloat(confirmedAmount),
          acceptanceNotes: discrepancyNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to complete cash handover');

      toast({
        title: t('cash_drawer.toast.received'),
        description: t('cash_drawer.toast.received_desc'),
      });

      resetForm();
      onOpenChange(false);
      onHandoverComplete?.();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('cash_drawer.toast.error_receive'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setToStaffId('');
    setCashAmount('');
    setNotes('');
    setSelectedHandover(null);
    setConfirmedAmount('');
    setDiscrepancyNotes('');
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getExpectedCash = () => {
    if (!selectedHandover?.importantNotes?.length) return 0;
    return selectedHandover.importantNotes[0]?.cashAmount || 0;
  };

  const getDiscrepancy = () => {
    if (!confirmedAmount || !selectedHandover) return 0;
    return parseFloat(confirmedAmount) - getExpectedCash();
  };

  const availableStaff = staff.filter((s) => 
    s.id !== currentStaffId && 
    (s.role.toLowerCase().includes('reception') || s.role.toLowerCase().includes('استقبال'))
  );

  const transactionTypeIcons: Record<string, React.ReactNode> = {
    Opening: <Wallet className="h-4 w-4 text-green-500" />,
    Closing: <Wallet className="h-4 w-4 text-red-500" />,
    Deposit: <TrendingUp className="h-4 w-4 text-green-500" />,
    Withdrawal: <TrendingDown className="h-4 w-4 text-red-500" />,
    Handover: <ArrowRight className="h-4 w-4 text-blue-500" />,
    Adjustment: <RefreshCw className="h-4 w-4 text-amber-500" />,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            {t('cash_drawer.title')}
          </DialogTitle>
          <DialogDescription>{t('cash_drawer.description')}</DialogDescription>
        </DialogHeader>

        {/* Current Balance Card */}
        {activeShift && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('cash_drawer.current_balance')}</p>
                  <p className="text-3xl font-bold">{formatCurrency(currentBalance)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t('cash_drawer.shift_started')}</p>
                  <p className="font-medium">{formatTime(activeShift.actualStart || '')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mode Tabs */}
        <div className="flex gap-2 border-b pb-4">
          <Button
            variant={mode === 'initiate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('initiate')}
          >
            <Send className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {t('cash_drawer.initiate')}
          </Button>
          <Button
            variant={mode === 'receive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('receive')}
            className="relative"
          >
            <Wallet className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {t('cash_drawer.receive')}
            {pendingCashHandovers.length > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingCashHandovers.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={mode === 'history' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('history')}
          >
            <History className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {t('cash_drawer.history')}
          </Button>
        </div>

        <ScrollArea className="max-h-[50vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : mode === 'initiate' ? (
            <div className="space-y-6 py-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('cash_drawer.handover_warning_title')}</AlertTitle>
                <AlertDescription>
                  {t('cash_drawer.handover_warning')}
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>{t('cash_drawer.hand_over_to')}</Label>
                  <Select value={toStaffId} onValueChange={setToStaffId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('cash_drawer.select_receptionist')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStaff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {s.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>{t('cash_drawer.cash_amount')}</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-9"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder={currentBalance.toString()}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('cash_drawer.current_balance')}: {formatCurrency(currentBalance)}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>{t('common.notes')}</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('cash_drawer.notes_placeholder')}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ) : mode === 'receive' ? (
            <div className="space-y-4 py-4">
              {pendingCashHandovers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>{t('cash_drawer.no_pending')}</p>
                </div>
              ) : (
                pendingCashHandovers.map((handover) => (
                  <Card key={handover.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{handover.fromStaff.name}</span>
                          <ArrowRight className="h-4 w-4" />
                          <span className="font-medium">{t('common.you')}</span>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800">
                          {t('cash_drawer.pending')}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatDate(handover.handoverTime)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">{t('cash_drawer.expected_amount')}</p>
                        <p className="text-2xl font-bold">{formatCurrency(handover.importantNotes?.[0]?.cashAmount)}</p>
                      </div>

                      {selectedHandover?.id === handover.id ? (
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label>{t('cash_drawer.confirmed_amount')}</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                step="0.01"
                                className="pl-9"
                                value={confirmedAmount}
                                onChange={(e) => setConfirmedAmount(e.target.value)}
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          {confirmedAmount && (
                            <div className={cn(
                              "p-3 rounded-lg",
                              getDiscrepancy() === 0 
                                ? "bg-green-50 dark:bg-green-900/20" 
                                : "bg-amber-50 dark:bg-amber-900/20"
                            )}>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">{t('cash_drawer.discrepancy')}:</span>
                                <span className={cn(
                                  "font-bold",
                                  getDiscrepancy() === 0 ? "text-green-600" :
                                  getDiscrepancy() > 0 ? "text-green-600" : "text-red-600"
                                )}>
                                  {formatCurrency(getDiscrepancy())}
                                </span>
                              </div>
                            </div>
                          )}

                          {confirmedAmount && getDiscrepancy() !== 0 && (
                            <div className="grid gap-2">
                              <Label>{t('cash_drawer.discrepancy_notes')}</Label>
                              <Textarea
                                value={discrepancyNotes}
                                onChange={(e) => setDiscrepancyNotes(e.target.value)}
                                placeholder={t('cash_drawer.discrepancy_notes_placeholder')}
                                rows={2}
                              />
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              className="flex-1"
                              onClick={handleReceiveHandover}
                              disabled={submitting || !confirmedAmount}
                            >
                              {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                              )}
                              {t('cash_drawer.confirm_receive')}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedHandover(null);
                                setConfirmedAmount('');
                                setDiscrepancyNotes('');
                              }}
                            >
                              {t('common.cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => setSelectedHandover(handover)}
                        >
                          <Wallet className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {t('cash_drawer.count_and_receive')}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Recent Transactions */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  {t('cash_drawer.recent_transactions')}
                </Label>
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('cash_drawer.no_transactions')}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('cash_drawer.type')}</TableHead>
                        <TableHead>{t('cash_drawer.amount')}</TableHead>
                        <TableHead>{t('cash_drawer.balance')}</TableHead>
                        <TableHead>{t('cash_drawer.time')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 10).map((txn) => (
                        <TableRow key={txn.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {transactionTypeIcons[txn.type] || <CreditCard className="h-4 w-4" />}
                              <span>{t(`cash_drawer.transaction_types.${txn.type.toLowerCase()}`)}</span>
                            </div>
                          </TableCell>
                          <TableCell className={cn(
                            "font-medium",
                            txn.amount >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatCurrency(txn.amount)}
                          </TableCell>
                          <TableCell>{formatCurrency(txn.newBalance)}</TableCell>
                          <TableCell>{formatTime(txn.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <Separator />

              {/* Handover History */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  {t('cash_drawer.handover_history')}
                </Label>
                {handoverHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('cash_drawer.no_handover_history')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {handoverHistory.slice(0, 5).map((handover) => (
                      <div
                        key={handover.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{handover.fromStaff.name}</span>
                          <ArrowRight className="h-4 w-4" />
                          <span>{handover.toStaff.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(handover.handoverTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>

        {mode === 'initiate' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleInitiateHandover} 
              disabled={submitting || !toStaffId || !cashAmount}
            >
              {submitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />}
              <Banknote className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t('cash_drawer.initiate_handover')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
