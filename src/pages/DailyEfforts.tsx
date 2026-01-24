import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Send,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useCohortStore } from '@/stores/cohortStore';
import { useCohorts } from '@/hooks/useCohorts';
import { useTrainers } from '@/hooks/useTrainers';
import { useMentors } from '@/hooks/useMentors';
import { useDailyEfforts, useBulkCreateDailyEfforts, useUpdateDailyEffort, useDeleteDailyEffort, DailyEffortDB } from '@/hooks/useDailyEfforts';
import { useAuthStore } from '@/stores/authStore';
import { EffortEntryCard } from '@/components/efforts/EffortEntryCard';
import { EffortViewModal } from '@/components/efforts/EffortViewModal';
import { EffortEditModal } from '@/components/efforts/EffortEditModal';
import { generateCalendarWeeks, getCurrentWeek, WeekRange } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

type Step = 'cohort' | 'stakeholder' | 'review';
type ViewMode = 'form' | 'history';
type DateFilter = 'today' | 'week' | 'month' | 'all';

interface StakeholderEntry {
  id: string;
  stakeholderRole: string;
  stakeholderId: string;
  stakeholderName: string;
  stakeholderEmpId: string;
  stakeholderEmail: string;
  employeeType: string;
  mode: string;
  virtualReason: string;
  areaOfWork: string;
  effortHours: string;
  startTime: string;
  endTime: string;
  trainingStartDate: string;
  trainingEndDate: string;
}

const steps: { id: Step; label: string }[] = [
  { id: 'cohort', label: 'Cohort Details' },
  { id: 'stakeholder', label: 'Stakeholder Entries' },
  { id: 'review', label: 'Review & Submit' },
];

const stakeholderRoles = [
  { value: 'tech-trainer', label: 'Technical Trainer' },
  { value: 'behavioral-trainer', label: 'Behavioral Trainer' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'buddy-mentor', label: 'Buddy Mentor' },
];

const emptyEntry = (): StakeholderEntry => ({
  id: Date.now().toString(),
  stakeholderRole: '',
  stakeholderId: '',
  stakeholderName: '',
  stakeholderEmpId: '',
  stakeholderEmail: '',
  employeeType: 'internal',
  mode: 'in-person',
  virtualReason: '',
  areaOfWork: '',
  effortHours: '',
  startTime: '',
  endTime: '',
  trainingStartDate: '',
  trainingEndDate: '',
});

export const DailyEfforts = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [currentStep, setCurrentStep] = useState<Step>('cohort');
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const { cohorts: mockCohorts } = useCohortStore();
  const { data: dbCohorts = [] } = useCohorts();
  const { user } = useAuthStore();
  const bulkCreateEfforts = useBulkCreateDailyEfforts();
  const updateEffort = useUpdateDailyEffort();
  const deleteEffort = useDeleteDailyEffort();

  // Modal states
  const [viewingEffort, setViewingEffort] = useState<DailyEffortDB | null>(null);
  const [editingEffort, setEditingEffort] = useState<DailyEffortDB | null>(null);

  // Use mock cohorts if no DB cohorts
  const cohorts = useMemo(() => {
    if (dbCohorts.length > 0) {
      return dbCohorts.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        bu: c.bu,
        skill: c.skill,
        location: c.location,
        startDate: c.start_date,
        endDate: c.end_date || undefined,
      }));
    }
    return mockCohorts.filter(c => c.status === 'active').map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      bu: c.bu,
      skill: c.skill,
      location: c.location,
      startDate: c.startDate,
      endDate: c.endDate,
    }));
  }, [dbCohorts, mockCohorts]);

  const [formData, setFormData] = useState({
    cohortId: '',
    date: new Date().toISOString().split('T')[0],
    activeGencCount: '',
    month: format(new Date(), 'MMMM yyyy'),
  });

  const [entries, setEntries] = useState<StakeholderEntry[]>([emptyEntry()]);

  const selectedCohort = cohorts.find((c) => c.id === formData.cohortId);
  const { data: trainers = [] } = useTrainers(formData.cohortId);
  const { data: mentors = [] } = useMentors(formData.cohortId);

  // Generate calendar weeks based on selected cohort dates
  const calendarWeeks = useMemo(() => {
    if (!selectedCohort) return [];
    const endDate = selectedCohort.endDate || format(new Date(), 'yyyy-MM-dd');
    return generateCalendarWeeks(selectedCohort.startDate, endDate);
  }, [selectedCohort]);

  // Date filter logic
  const getDateRange = () => {
    const today = new Date();
    
    if (selectedWeek && calendarWeeks.length > 0) {
      const week = calendarWeeks.find(w => w.id === selectedWeek);
      if (week) {
        return { 
          start: format(week.startDate, 'yyyy-MM-dd'), 
          end: format(week.endDate, 'yyyy-MM-dd') 
        };
      }
    }
    
    switch (dateFilter) {
      case 'today':
        return { start: format(today, 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
      case 'week':
        return { start: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'), end: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd') };
      case 'month':
        return { start: format(startOfMonth(today), 'yyyy-MM-dd'), end: format(endOfMonth(today), 'yyyy-MM-dd') };
      default:
        return undefined;
    }
  };

  const { data: efforts = [], isLoading: loadingEfforts } = useDailyEfforts(
    formData.cohortId || undefined,
    getDateRange()
  );

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStep === 'cohort' && !formData.cohortId) {
      toast.error('Please select a cohort');
      return;
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const addEntry = () => {
    setEntries([...entries, emptyEntry()]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  const updateEntry = (id: string, field: keyof StakeholderEntry, value: string) => {
    setEntries(
      entries.map((e) => {
        if (e.id === id) {
          const updated = { ...e, [field]: value };
          // Auto-calculate hours if start and end time provided
          if ((field === 'startTime' || field === 'endTime') && updated.startTime && updated.endTime) {
            const start = new Date(`2000-01-01T${updated.startTime}`);
            const end = new Date(`2000-01-01T${updated.endTime}`);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            if (hours > 0) {
              updated.effortHours = hours.toFixed(1);
            }
          }
          return updated;
        }
        return e;
      })
    );
  };

  const getStakeholderOptions = (role: string) => {
    const mockTrainers = mockCohorts.find(c => c.id === formData.cohortId)?.trainers || [];
    const mockMentors = mockCohorts.find(c => c.id === formData.cohortId)?.mentors || [];

    switch (role) {
      case 'tech-trainer':
        return trainers.length > 0 
          ? trainers.filter(t => t.type === 'technical').map(t => ({ 
              id: t.id, 
              name: t.name, 
              empId: t.emp_id, 
              email: t.email,
              isInternal: t.is_internal 
            }))
          : mockTrainers.filter(t => t.type === 'technical').map(t => ({ 
              id: t.id, 
              name: t.name, 
              empId: t.id, 
              email: t.email,
              isInternal: t.isInternal 
            }));
      case 'behavioral-trainer':
        return trainers.length > 0
          ? trainers.filter(t => t.type === 'behavioral').map(t => ({ 
              id: t.id, 
              name: t.name, 
              empId: t.emp_id, 
              email: t.email,
              isInternal: t.is_internal 
            }))
          : mockTrainers.filter(t => t.type === 'behavioral').map(t => ({ 
              id: t.id, 
              name: t.name, 
              empId: t.id, 
              email: t.email,
              isInternal: t.isInternal 
            }));
      case 'mentor':
        return mentors.length > 0
          ? mentors.filter(m => m.type === 'mentor').map(m => ({ 
              id: m.id, 
              name: m.name, 
              empId: m.emp_id, 
              email: m.email,
              isInternal: true 
            }))
          : mockMentors.filter(m => m.type === 'mentor').map(m => ({ 
              id: m.id, 
              name: m.name, 
              empId: m.id, 
              email: m.email,
              isInternal: true 
            }));
      case 'buddy-mentor':
        return mentors.length > 0
          ? mentors.filter(m => m.type === 'buddy').map(m => ({ 
              id: m.id, 
              name: m.name, 
              empId: m.emp_id, 
              email: m.email,
              isInternal: true 
            }))
          : mockMentors.filter(m => m.type === 'buddy').map(m => ({ 
              id: m.id, 
              name: m.name, 
              empId: m.id, 
              email: m.email,
              isInternal: true 
            }));
      default:
        return [];
    }
  };

  const handleSubmit = () => {
    const validEntries = entries.filter(e => 
      e.stakeholderRole && e.stakeholderName && e.areaOfWork && e.effortHours
    );

    if (validEntries.length === 0) {
      toast.error('Please add at least one complete entry');
      return;
    }

    const effortsToCreate = validEntries.map(entry => ({
      cohort_id: formData.cohortId,
      date: formData.date,
      stakeholder_id: entry.stakeholderId || entry.id,
      stakeholder_name: entry.stakeholderName,
      stakeholder_type: stakeholderRoles.find(r => r.value === entry.stakeholderRole)?.label || entry.stakeholderRole,
      mode_of_training: entry.mode,
      virtual_reason: entry.mode === 'virtual' ? entry.virtualReason : null,
      area_of_work: entry.areaOfWork,
      effort_hours: parseFloat(entry.effortHours),
      session_start_time: entry.startTime || null,
      session_end_time: entry.endTime || null,
      active_genc_count: formData.activeGencCount ? parseInt(formData.activeGencCount) : null,
      notes: null,
      submitted_by: user?.id || 'unknown',
    }));

    bulkCreateEfforts.mutate(effortsToCreate, {
      onSuccess: () => {
        toast.success(`${validEntries.length} effort entries submitted successfully!`);
        // Reset form
        setCurrentStep('cohort');
        setEntries([emptyEntry()]);
        setFormData({
          ...formData,
          date: new Date().toISOString().split('T')[0],
          activeGencCount: '',
        });
        setViewMode('history');
      },
    });
  };

  // Group efforts by date and week
  const groupedEfforts = useMemo(() => {
    const byDate: Record<string, DailyEffortDB[]> = {};
    efforts.forEach(effort => {
      if (!byDate[effort.date]) byDate[effort.date] = [];
      byDate[effort.date].push(effort);
    });
    return byDate;
  }, [efforts]);

  // Calculate total hours
  const totalHours = useMemo(() => {
    return efforts.reduce((sum, e) => sum + Number(e.effort_hours), 0);
  }, [efforts]);

  const handleEditEffort = (effort: DailyEffortDB) => {
    setEditingEffort(effort);
  };

  const handleViewEffort = (effort: DailyEffortDB) => {
    setViewingEffort(effort);
  };

  const handleDeleteEffort = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteEffort.mutate(id);
    }
  };

  const handleSaveEdit = (data: Partial<DailyEffortDB> & { id: string }) => {
    updateEffort.mutate(data, {
      onSuccess: () => {
        setEditingEffort(null);
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Daily Effort Entry</h1>
          <p className="mt-2 text-muted-foreground">
            Log training efforts for your cohort stakeholders
          </p>
        </div>
        <div className="flex gap-3">
          <GradientButton
            variant={viewMode === 'form' ? 'primary' : 'outline'}
            onClick={() => setViewMode('form')}
            icon={<Plus className="h-4 w-4" />}
          >
            New Entry
          </GradientButton>
          <GradientButton
            variant={viewMode === 'history' ? 'primary' : 'outline'}
            onClick={() => setViewMode('history')}
            icon={<Eye className="h-4 w-4" />}
          >
            View History
          </GradientButton>
        </div>
      </motion.div>

      {viewMode === 'form' ? (
        <>
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => {
                        if (index <= currentStepIndex || (index === 1 && formData.cohortId)) {
                          setCurrentStep(step.id);
                        }
                      }}
                      className={cn(
                        'flex items-center gap-3',
                        index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                          step.id === currentStep
                            ? 'border-primary bg-primary text-primary-foreground'
                            : index < currentStepIndex
                            ? 'border-success bg-success/20 text-success'
                            : 'border-border bg-muted'
                        )}
                      >
                        {index < currentStepIndex ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className="hidden font-medium sm:inline">{step.label}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'mx-4 h-0.5 w-12 sm:w-24',
                          index < currentStepIndex ? 'bg-success' : 'bg-border'
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Form Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-8">
              {currentStep === 'cohort' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Cohort Details</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Select Cohort</label>
                      <select
                        value={formData.cohortId}
                        onChange={(e) => {
                          setFormData({ ...formData, cohortId: e.target.value });
                          setSelectedWeek('');
                        }}
                        className="input-premium w-full"
                      >
                        <option value="">Choose a cohort...</option>
                        {cohorts.map((cohort) => (
                          <option key={cohort.id} value={cohort.id}>
                            {cohort.code} - {cohort.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Calendar Weeks Dropdown */}
                    {selectedCohort && calendarWeeks.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Select Week</label>
                        <div className="relative">
                          <select
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(e.target.value)}
                            className="input-premium w-full appearance-none pr-10"
                          >
                            <option value="">Current Week</option>
                            {calendarWeeks.map((week) => (
                              <option key={week.id} value={week.id}>
                                {week.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          date: e.target.value,
                          month: format(parseISO(e.target.value), 'MMMM yyyy')
                        })}
                        className="input-premium w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Month</label>
                      <input
                        type="text"
                        value={formData.month}
                        readOnly
                        className="input-premium w-full bg-muted/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Active GenC Count</label>
                      <input
                        type="number"
                        value={formData.activeGencCount}
                        onChange={(e) => setFormData({ ...formData, activeGencCount: e.target.value })}
                        placeholder="e.g., 28"
                        className="input-premium w-full"
                      />
                    </div>
                  </div>

                  {selectedCohort && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-border/50 bg-muted/30 p-4"
                    >
                      <h4 className="font-medium text-foreground mb-3">Selected Cohort Info</h4>
                      <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-muted-foreground">Cohort Code</p>
                          <p className="font-medium text-foreground">{selectedCohort.code}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">BU</p>
                          <p className="font-medium text-foreground">{selectedCohort.bu}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Skill</p>
                          <p className="font-medium text-foreground">{selectedCohort.skill}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Training Location</p>
                          <p className="font-medium text-foreground">{selectedCohort.location}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {currentStep === 'stakeholder' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Stakeholder Entries</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add entries for Technical Trainer, Behavioral Trainer, Mentor, and Buddy Mentor
                      </p>
                    </div>
                    <GradientButton
                      variant="outline"
                      size="sm"
                      icon={<Plus className="h-4 w-4" />}
                      onClick={addEntry}
                    >
                      Add Entry
                    </GradientButton>
                  </div>

                  <AnimatePresence>
                    {entries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="rounded-lg border border-border/50 bg-muted/20 p-6"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="font-medium text-foreground">Entry #{index + 1}</h4>
                          {entries.length > 1 && (
                            <button
                              onClick={() => removeEntry(entry.id)}
                              className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {/* SME/Mentor/Buddy Mentor/MFRP Contributor */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Stakeholder Role</label>
                            <select
                              value={entry.stakeholderRole}
                              onChange={(e) => {
                                updateEntry(entry.id, 'stakeholderRole', e.target.value);
                                updateEntry(entry.id, 'stakeholderId', '');
                                updateEntry(entry.id, 'stakeholderName', '');
                                updateEntry(entry.id, 'stakeholderEmpId', '');
                                updateEntry(entry.id, 'stakeholderEmail', '');
                              }}
                              className="input-premium w-full"
                            >
                              <option value="">Select role...</option>
                              {stakeholderRoles.map((role) => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* SME ID / Mentor ID */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">SME/Mentor ID</label>
                            <select
                              value={entry.stakeholderId}
                              onChange={(e) => {
                                const selected = getStakeholderOptions(entry.stakeholderRole).find(s => s.id === e.target.value);
                                updateEntry(entry.id, 'stakeholderId', e.target.value);
                                updateEntry(entry.id, 'stakeholderName', selected?.name || '');
                                updateEntry(entry.id, 'stakeholderEmpId', selected?.empId || '');
                                updateEntry(entry.id, 'stakeholderEmail', selected?.email || '');
                                updateEntry(entry.id, 'employeeType', selected?.isInternal ? 'internal' : 'external');
                              }}
                              className="input-premium w-full"
                              disabled={!entry.stakeholderRole}
                            >
                              <option value="">Select stakeholder...</option>
                              {getStakeholderOptions(entry.stakeholderRole).map((s) => (
                                <option key={s.id} value={s.id}>{s.empId} - {s.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* SME Name / Mentor Name */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">SME/Mentor Name</label>
                            <input
                              type="text"
                              value={entry.stakeholderName}
                              readOnly
                              className="input-premium w-full bg-muted/30"
                              placeholder="Auto-filled"
                            />
                          </div>

                          {/* Mapped Trainer Type */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Trainer Type</label>
                            <select
                              value={entry.employeeType}
                              onChange={(e) => updateEntry(entry.id, 'employeeType', e.target.value)}
                              className="input-premium w-full"
                            >
                              <option value="internal">Internal</option>
                              <option value="external">External</option>
                            </select>
                          </div>

                          {/* Mode of Training */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Mode of Training</label>
                            <div className="flex gap-4 pt-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  value="in-person"
                                  checked={entry.mode === 'in-person'}
                                  onChange={(e) => updateEntry(entry.id, 'mode', e.target.value)}
                                  className="h-4 w-4 text-primary"
                                />
                                <span className="text-foreground">In-Person</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  value="virtual"
                                  checked={entry.mode === 'virtual'}
                                  onChange={(e) => updateEntry(entry.id, 'mode', e.target.value)}
                                  className="h-4 w-4 text-primary"
                                />
                                <span className="text-foreground">Virtual</span>
                              </label>
                            </div>
                          </div>

                          {/* Reason for Virtual */}
                          {entry.mode === 'virtual' && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Reason for Virtual</label>
                              <input
                                type="text"
                                value={entry.virtualReason}
                                onChange={(e) => updateEntry(entry.id, 'virtualReason', e.target.value)}
                                placeholder="Enter reason..."
                                className="input-premium w-full"
                              />
                            </div>
                          )}

                          {/* Area of Work */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Area of Work</label>
                            <input
                              type="text"
                              value={entry.areaOfWork}
                              onChange={(e) => updateEntry(entry.id, 'areaOfWork', e.target.value)}
                              placeholder="e.g., React Components, AWS Setup..."
                              className="input-premium w-full"
                            />
                          </div>

                          {/* Training Start Date */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Training Start Date</label>
                            <input
                              type="date"
                              value={entry.trainingStartDate}
                              onChange={(e) => updateEntry(entry.id, 'trainingStartDate', e.target.value)}
                              className="input-premium w-full"
                            />
                          </div>

                          {/* Training End Date */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Training End Date</label>
                            <input
                              type="date"
                              value={entry.trainingEndDate}
                              onChange={(e) => updateEntry(entry.id, 'trainingEndDate', e.target.value)}
                              className="input-premium w-full"
                            />
                          </div>

                          {/* Start Time */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Session Start Time</label>
                            <input
                              type="time"
                              value={entry.startTime}
                              onChange={(e) => updateEntry(entry.id, 'startTime', e.target.value)}
                              className="input-premium w-full"
                            />
                          </div>

                          {/* End Time */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Session End Time</label>
                            <input
                              type="time"
                              value={entry.endTime}
                              onChange={(e) => updateEntry(entry.id, 'endTime', e.target.value)}
                              className="input-premium w-full"
                            />
                          </div>

                          {/* Effort Hours */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Effort in Hours</label>
                            <input
                              type="number"
                              value={entry.effortHours}
                              onChange={(e) => updateEntry(entry.id, 'effortHours', e.target.value)}
                              placeholder="Auto-calculated"
                              min="0"
                              max="24"
                              step="0.5"
                              className="input-premium w-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/10 p-4 text-sm text-info">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>Effort hours will be auto-calculated if you provide start and end times. You can add multiple entries for different stakeholders on the same day.</p>
                  </div>
                </div>
              )}

              {currentStep === 'review' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Review & Submit</h2>
                  
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                    <h4 className="font-medium text-foreground mb-3">Cohort Info</h4>
                    <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-muted-foreground">Cohort</p>
                        <p className="font-medium text-foreground">{selectedCohort?.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium text-foreground">{format(parseISO(formData.date), 'EEEE, MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Month</p>
                        <p className="font-medium text-foreground">{formData.month}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Active GenC</p>
                        <p className="font-medium text-foreground">{formData.activeGencCount || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">
                      Entries ({entries.filter(e => e.stakeholderRole && e.areaOfWork).length})
                    </h4>
                    {entries.filter(e => e.stakeholderRole && e.areaOfWork).map((entry, index) => (
                      <div key={entry.id} className="rounded-lg border border-border/50 bg-muted/20 p-4">
                        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-muted-foreground">Role</p>
                            <p className="font-medium text-foreground capitalize">
                              {stakeholderRoles.find(r => r.value === entry.stakeholderRole)?.label}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stakeholder</p>
                            <p className="font-medium text-foreground">{entry.stakeholderName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Area of Work</p>
                            <p className="font-medium text-foreground">{entry.areaOfWork}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Hours</p>
                            <p className="font-medium text-foreground">
                              {entry.effortHours || '0'} hrs ({entry.mode === 'in-person' ? 'In-Person' : 'Virtual'})
                            </p>
                          </div>
                          {entry.startTime && entry.endTime && (
                            <div>
                              <p className="text-muted-foreground">Time</p>
                              <p className="font-medium text-foreground">{entry.startTime} - {entry.endTime}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Trainer Type</p>
                            <p className="font-medium text-foreground capitalize">{entry.employeeType}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-4"
                  >
                    <Check className="h-6 w-6 text-success" />
                    <div>
                      <p className="font-medium text-foreground">Ready to Submit</p>
                      <p className="text-sm text-muted-foreground">
                        {entries.filter(e => e.stakeholderRole && e.areaOfWork).length} entries •{' '}
                        {entries.filter(e => e.stakeholderRole && e.areaOfWork).reduce((sum, e) => sum + (parseFloat(e.effortHours) || 0), 0).toFixed(1)} total hours
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-6">
                <GradientButton
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  icon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </GradientButton>
                <div className="flex gap-3">
                  {currentStepIndex < steps.length - 1 ? (
                    <GradientButton
                      variant="primary"
                      onClick={handleNext}
                      icon={<ChevronRight className="h-4 w-4" />}
                      iconPosition="right"
                    >
                      Next
                    </GradientButton>
                  ) : (
                    <GradientButton
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={bulkCreateEfforts.isPending}
                      icon={<Send className="h-4 w-4" />}
                      iconPosition="right"
                    >
                      {bulkCreateEfforts.isPending ? 'Submitting...' : 'Submit Entry'}
                    </GradientButton>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      ) : (
        // History View
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Filters */}
          <GlassCard className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {(['today', 'week', 'month', 'all'] as DateFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setDateFilter(filter);
                      setSelectedWeek('');
                    }}
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      dateFilter === filter && !selectedWeek
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-3">
                {/* Cohort Filter */}
                <div className="relative">
                  <select
                    value={formData.cohortId}
                    onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
                    className="input-premium appearance-none pr-10"
                  >
                    <option value="">All Cohorts</option>
                    {cohorts.map((cohort) => (
                      <option key={cohort.id} value={cohort.id}>
                        {cohort.code} - {cohort.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                {/* Week Filter */}
                {selectedCohort && calendarWeeks.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="input-premium appearance-none pr-10"
                    >
                      <option value="">All Weeks</option>
                      {calendarWeeks.map((week) => (
                        <option key={week.id} value={week.id}>
                          {week.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Summary Stats */}
          {efforts.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <GlassCard className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{Object.keys(groupedEfforts).length}</p>
                <p className="text-sm text-muted-foreground">Days Logged</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{efforts.length}</p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </GlassCard>
            </div>
          )}

          {/* Efforts List */}
          {loadingEfforts ? (
            <GlassCard className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </GlassCard>
          ) : Object.keys(groupedEfforts).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedEfforts)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, dayEfforts]) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="font-semibold text-foreground">
                        {format(parseISO(date), 'EEEE, MMMM dd, yyyy')}
                      </h4>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {dayEfforts.reduce((sum, e) => sum + Number(e.effort_hours), 0).toFixed(1)} hrs
                      </span>
                    </div>
                    <div className="space-y-3">
                      {dayEfforts.map((effort, index) => (
                        <EffortEntryCard
                          key={effort.id}
                          effort={effort}
                          index={index}
                          onEdit={handleEditEffort}
                          onView={handleViewEffort}
                          onDelete={handleDeleteEffort}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No efforts found</h3>
              <p className="mt-2 text-muted-foreground">
                {formData.cohortId 
                  ? 'No efforts logged for this cohort in the selected period' 
                  : 'Select a cohort to view efforts'}
              </p>
              <GradientButton
                variant="primary"
                className="mt-6"
                onClick={() => setViewMode('form')}
              >
                Log New Effort
              </GradientButton>
            </GlassCard>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <EffortViewModal
        isOpen={!!viewingEffort}
        onClose={() => setViewingEffort(null)}
        effort={viewingEffort}
      />
      <EffortEditModal
        isOpen={!!editingEffort}
        onClose={() => setEditingEffort(null)}
        onSubmit={handleSaveEdit}
        effort={editingEffort}
        isLoading={updateEffort.isPending}
      />
    </div>
  );
};
