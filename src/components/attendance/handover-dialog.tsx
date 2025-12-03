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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ArrowRightLeft,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Plus,
  Trash2,
  Loader2,
  Send,
  Check,
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
}

interface PendingTask {
  id: string;
  task: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface ImportantNote {
  id: string;
  note: string;
  type: 'info' | 'warning' | 'urgent';
}

interface Handover {
  id: string;
  fromStaffId: string;
  fromStaff: Staff;
  toStaffId: string;
  toStaff: Staff;
  fromShift?: Shift;
  handoverType: 'Shift' | 'CashDrawer' | 'Emergency';
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  handoverTime: string;
  handoverNotes?: string;
  acceptanceNotes?: string;
  pendingTasks?: PendingTask[];
  importantNotes?: ImportantNote[];
}

interface HandoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff[];
  activeShift?: Shift | null;
  currentStaffId?: string;
  onHandoverComplete?: () => void;
}

const handoverStatusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800',
};

export function HandoverDialog({
  open,
  onOpenChange,
  staff,
  activeShift,
  currentStaffId,
  onHandoverComplete,
}: HandoverDialogProps) {
  const { t, language, isRTL } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const { toast } = useToast();

  const [mode, setMode] = React.useState<'create' | 'pending'>('create');
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [pendingHandovers, setPendingHandovers] = React.useState<Handover[]>([]);

  // Form state
  const [toStaffId, setToStaffId] = React.useState('');
  const [handoverNotes, setHandoverNotes] = React.useState('');
  const [pendingTasks, setPendingTasks] = React.useState<PendingTask[]>([]);
  const [importantNotes, setImportantNotes] = React.useState<ImportantNote[]>([]);
  const [newTask, setNewTask] = React.useState('');
  const [newTaskPriority, setNewTaskPriority] = React.useState<'low' | 'medium' | 'high'>('medium');
  const [newNote, setNewNote] = React.useState('');
  const [newNoteType, setNewNoteType] = React.useState<'info' | 'warning' | 'urgent'>('info');

  // Accept handover state
  const [selectedHandover, setSelectedHandover] = React.useState<Handover | null>(null);
  const [acceptanceNotes, setAcceptanceNotes] = React.useState('');

  React.useEffect(() => {
    if (open && currentStaffId) {
      fetchPendingHandovers();
    }
  }, [open, currentStaffId]);

  const fetchPendingHandovers = async () => {
    if (!currentStaffId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/handovers?action=pending&staffId=${currentStaffId}`);
      if (response.ok) {
        const data = await response.json();
        setPendingHandovers(data.handovers || []);
      }
    } catch (error) {
      console.error('Error fetching handovers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setPendingTasks([
      ...pendingTasks,
      {
        id: Date.now().toString(),
        task: newTask,
        priority: newTaskPriority,
        completed: false,
      },
    ]);
    setNewTask('');
  };

  const handleRemoveTask = (id: string) => {
    setPendingTasks(pendingTasks.filter((t) => t.id !== id));
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setImportantNotes([
      ...importantNotes,
      {
        id: Date.now().toString(),
        note: newNote,
        type: newNoteType,
      },
    ]);
    setNewNote('');
  };

  const handleRemoveNote = (id: string) => {
    setImportantNotes(importantNotes.filter((n) => n.id !== id));
  };

  const handleCreateHandover = async () => {
    if (!toStaffId || !currentStaffId) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          fromStaffId: currentStaffId,
          toStaffId,
          fromShiftId: activeShift?.id,
          handoverType: 'Shift',
          handoverNotes,
          pendingTasks,
          importantNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to create handover');

      toast({
        title: t('handover.toast.created'),
        description: t('handover.toast.created_desc'),
      });

      resetForm();
      onOpenChange(false);
      onHandoverComplete?.();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('handover.toast.error_create'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptHandover = async () => {
    if (!selectedHandover) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/handovers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          handoverId: selectedHandover.id,
          acceptanceNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to accept handover');

      toast({
        title: t('handover.toast.accepted'),
        description: t('handover.toast.accepted_desc'),
      });

      setSelectedHandover(null);
      setAcceptanceNotes('');
      fetchPendingHandovers();
      onHandoverComplete?.();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('handover.toast.error_accept'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectHandover = async (handoverId: string, reason?: string) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/handovers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          handoverId,
          reason,
        }),
      });

      if (!response.ok) throw new Error('Failed to reject handover');

      toast({
        title: t('handover.toast.rejected'),
        description: t('handover.toast.rejected_desc'),
      });

      fetchPendingHandovers();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('handover.toast.error_reject'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setToStaffId('');
    setHandoverNotes('');
    setPendingTasks([]);
    setImportantNotes([]);
    setNewTask('');
    setNewNote('');
    setSelectedHandover(null);
    setAcceptanceNotes('');
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

  const availableStaff = staff.filter((s) => s.id !== currentStaffId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            {t('handover.title')}
          </DialogTitle>
          <DialogDescription>{t('handover.description')}</DialogDescription>
        </DialogHeader>

        {/* Mode Tabs */}
        <div className="flex gap-2 border-b pb-4">
          <Button
            variant={mode === 'create' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('create')}
          >
            <Send className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {t('handover.initiate')}
          </Button>
          <Button
            variant={mode === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('pending')}
            className="relative"
          >
            <Clock className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {t('handover.pending')}
            {pendingHandovers.length > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingHandovers.length}
              </Badge>
            )}
          </Button>
        </div>

        <ScrollArea className="max-h-[60vh] pr-4">
          {mode === 'create' ? (
            <div className="space-y-6 py-4">
              {/* Select Staff */}
              <div className="grid gap-2">
                <Label>{t('handover.hand_over_to')}</Label>
                <Select value={toStaffId} onValueChange={setToStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('handover.select_staff')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {s.name} - {s.role}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Handover Notes */}
              <div className="grid gap-2">
                <Label>{t('handover.notes')}</Label>
                <Textarea
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder={t('handover.notes_placeholder')}
                  rows={3}
                />
              </div>

              {/* Pending Tasks */}
              <div className="grid gap-3">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('handover.pending_tasks')}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder={t('handover.add_task')}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                  <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as any)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('handover.priority.low')}</SelectItem>
                      <SelectItem value="medium">{t('handover.priority.medium')}</SelectItem>
                      <SelectItem value="high">{t('handover.priority.high')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={handleAddTask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {pendingTasks.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {pendingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <Badge className={priorityColors[task.priority]} variant="secondary">
                            {t(`handover.priority.${task.priority}`)}
                          </Badge>
                          <span className="text-sm">{task.task}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Important Notes */}
              <div className="grid gap-3">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t('handover.important_notes')}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={t('handover.add_note')}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <Select value={newNoteType} onValueChange={(v) => setNewNoteType(v as any)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">{t('handover.note_type.info')}</SelectItem>
                      <SelectItem value="warning">{t('handover.note_type.warning')}</SelectItem>
                      <SelectItem value="urgent">{t('handover.note_type.urgent')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={handleAddNote}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {importantNotes.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {importantNotes.map((note) => (
                      <div
                        key={note.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg",
                          note.type === 'urgent' && "bg-red-50 dark:bg-red-900/20",
                          note.type === 'warning' && "bg-amber-50 dark:bg-amber-900/20",
                          note.type === 'info' && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {note.type === 'urgent' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          {note.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                          {note.type === 'info' && <FileText className="h-4 w-4 text-blue-500" />}
                          <span className="text-sm">{note.note}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingHandovers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>{t('handover.no_pending')}</p>
                </div>
              ) : (
                pendingHandovers.map((handover) => (
                  <Card key={handover.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{handover.fromStaff.name}</span>
                        </div>
                        <Badge className={handoverStatusColors[handover.status]}>
                          {t(`handover.status.${handover.status.toLowerCase()}`)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {formatDate(handover.handoverTime)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {handover.handoverNotes && (
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="text-sm">{handover.handoverNotes}</p>
                        </div>
                      )}

                      {handover.pendingTasks && handover.pendingTasks.length > 0 && (
                        <div>
                          <Label className="text-sm mb-2 block">{t('handover.pending_tasks')}:</Label>
                          <div className="space-y-1">
                            {(handover.pendingTasks as PendingTask[]).map((task, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <Badge className={priorityColors[task.priority]} variant="secondary">
                                  {t(`handover.priority.${task.priority}`)}
                                </Badge>
                                <span>{task.task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {handover.importantNotes && handover.importantNotes.length > 0 && (
                        <div>
                          <Label className="text-sm mb-2 block">{t('handover.important_notes')}:</Label>
                          <div className="space-y-1">
                            {(handover.importantNotes as ImportantNote[]).map((note, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "flex items-center gap-2 text-sm p-2 rounded",
                                  note.type === 'urgent' && "bg-red-50 dark:bg-red-900/20",
                                  note.type === 'warning' && "bg-amber-50 dark:bg-amber-900/20",
                                  note.type === 'info' && "bg-blue-50 dark:bg-blue-900/20"
                                )}
                              >
                                {note.type === 'urgent' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                {note.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                                {note.type === 'info' && <FileText className="h-4 w-4 text-blue-500" />}
                                <span>{note.note}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {selectedHandover?.id === handover.id ? (
                        <div className="space-y-3">
                          <Label>{t('handover.acceptance_notes')}</Label>
                          <Textarea
                            value={acceptanceNotes}
                            onChange={(e) => setAcceptanceNotes(e.target.value)}
                            placeholder={t('handover.acceptance_notes_placeholder')}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              className="flex-1"
                              onClick={handleAcceptHandover}
                              disabled={submitting}
                            >
                              {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Check className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                              )}
                              {t('handover.confirm_accept')}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedHandover(null)}
                            >
                              {t('common.cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={() => setSelectedHandover(handover)}
                          >
                            <CheckCircle className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                            {t('handover.accept')}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleRejectHandover(handover.id)}
                            disabled={submitting}
                          >
                            <XCircle className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                            {t('handover.reject')}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </ScrollArea>

        {mode === 'create' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateHandover} disabled={submitting || !toStaffId}>
              {submitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />}
              <ArrowRightLeft className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t('handover.initiate_handover')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
