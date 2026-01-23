import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Save,
  Send,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useCohortStore } from '@/stores/cohortStore';
import { useCohorts } from '@/hooks/useCohorts';
import { useTrainers } from '@/hooks/useTrainers';
import { useMentors } from '@/hooks/useMentors';
import { useDailyEfforts, useBulkCreateDailyEfforts } from '@/hooks/useDailyEfforts';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

type Step = 'cohort' | 'stakeholder' | 'review';
type ViewMode = 'form' | 'history';
type DateFilter = 'today' | 'week' | 'month' | 'all';

interface StakeholderEntry {
  id: string;
  stakeholderRole: string;
  stakeholderId: string;
  stakeholderName: string;
  mode: string;
  virtualReason: string;
  areaOfWork: string;
  effortHours: string;
  startTime: string;
  endTime: string;
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

export const DailyEfforts = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [currentStep, setCurrentStep] = useState<Step>('cohort');
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const { cohorts: mockCohorts } = useCohortStore();
  const { data: dbCohorts = [] } = useCohorts();
  const { user } = useAuthStore();
  const bulkCreateEfforts = useBulkCreateDailyEfforts();

  // Use mock cohorts if no DB cohorts
  const cohorts = dbCohorts.length > 0 ? dbCohorts.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    bu: c.bu,
    skill: c.skill,
    location: c.location,
  })) : mockCohorts.filter(c => c.status === 'active').map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    bu: c.bu,
    skill: c.skill,
    location: c.location,
  }));

  const [formData, setFormData] = useState({
    cohortId: '',
    date: new Date().toISOString().split('T')[0],
    activeGencCount: '',
  });

  const [entries, setEntries] = useState<StakeholderEntry[]>([
    {
      id: '1',
      stakeholderRole: '',
      stakeholderId: '',
      stakeholderName: '',
      mode: 'in-person',
      virtualReason: '',
      areaOfWork: '',
      effortHours: '',
      startTime: '',
      endTime: '',
    },
  ]);

  const selectedCohort = cohorts.find((c) => c.id === formData.cohortId);
  const { data: trainers = [] } = useTrainers(formData.cohortId);
  const { data: mentors = [] } = useMentors(formData.cohortId);

  // Date filter logic
  const getDateRange = () => {
    const today = new Date();
    switch (dateFilter) {
      case 'today':
        return { start: format(today, 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
      case 'week':
        return { start: format(startOfWeek(today), 'yyyy-MM-dd'), end: format(endOfWeek(today), 'yyyy-MM-dd') };
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
    setEntries([
      ...entries,
      {
        id: Date.now().toString(),
        stakeholderRole: '',
        stakeholderId: '',
        stakeholderName: '',
        mode: 'in-person',
        virtualReason: '',
        areaOfWork: '',
        effortHours: '',
        startTime: '',
        endTime: '',
      },
    ]);
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
          ? trainers.filter(t => t.type === 'technical').map(t => ({ id: t.id, name: t.name }))
          : mockTrainers.filter(t => t.type === 'technical').map(t => ({ id: t.id, name: t.name }));
      case 'behavioral-trainer':
        return trainers.length > 0
          ? trainers.filter(t => t.type === 'behavioral').map(t => ({ id: t.id, name: t.name }))
          : mockTrainers.filter(t => t.type === 'behavioral').map(t => ({ id: t.id, name: t.name }));
      case 'mentor':
        return mentors.length > 0
          ? mentors.filter(m => m.type === 'mentor').map(m => ({ id: m.id, name: m.name }))
          : mockMentors.filter(m => m.type === 'mentor').map(m => ({ id: m.id, name: m.name }));
      case 'buddy-mentor':
        return mentors.length > 0
          ? mentors.filter(m => m.type === 'buddy').map(m => ({ id: m.id, name: m.name }))
          : mockMentors.filter(m => m.type === 'buddy').map(m => ({ id: m.id, name: m.name }));
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
        // Reset form
        setCurrentStep('cohort');
        setEntries([{
          id: '1',
          stakeholderRole: '',
          stakeholderId: '',
          stakeholderName: '',
          mode: 'in-person',
          virtualReason: '',
          areaOfWork: '',
          effortHours: '',
          startTime: '',
          endTime: '',
        }]);
        setFormData({
          cohortId: formData.cohortId, // Keep cohort selected
          date: new Date().toISOString().split('T')[0],
          activeGencCount: '',
        });
        setViewMode('history');
      },
    });
  };

  // Group efforts by date
  const groupedEfforts = efforts.reduce((acc, effort) => {
    const date = effort.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(effort);
    return acc;
  }, {} as Record<string, typeof efforts>);

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
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Select Cohort</label>
                      <select
                        value={formData.cohortId}
                        onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="input-premium w-full"
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
                      <h4 className="font-medium text-foreground">Selected Cohort Info</h4>
                      <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                        <p><span className="font-medium">BU:</span> {selectedCohort.bu}</p>
                        <p><span className="font-medium">Skill:</span> {selectedCohort.skill}</p>
                        <p><span className="font-medium">Location:</span> {selectedCohort.location}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {currentStep === 'stakeholder' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Stakeholder Entries</h2>
                    <GradientButton
                      variant="outline"
                      size="sm"
                      icon={<Plus className="h-4 w-4" />}
                      onClick={addEntry}
                    >
                      Add Entry
                    </GradientButton>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add multiple entries for different stakeholders (Technical, Behavioral, Mentor, Buddy)
                  </p>

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
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Stakeholder Role</label>
                            <select
                              value={entry.stakeholderRole}
                              onChange={(e) => {
                                updateEntry(entry.id, 'stakeholderRole', e.target.value);
                                updateEntry(entry.id, 'stakeholderId', '');
                                updateEntry(entry.id, 'stakeholderName', '');
                              }}
                              className="input-premium w-full"
                            >
                              <option value="">Select role...</option>
                              {stakeholderRoles.map((role) => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Stakeholder Name</label>
                            <select
                              value={entry.stakeholderId}
                              onChange={(e) => {
                                const selected = getStakeholderOptions(entry.stakeholderRole).find(s => s.id === e.target.value);
                                updateEntry(entry.id, 'stakeholderId', e.target.value);
                                updateEntry(entry.id, 'stakeholderName', selected?.name || '');
                              }}
                              className="input-premium w-full"
                              disabled={!entry.stakeholderRole}
                            >
                              <option value="">Select stakeholder...</option>
                              {getStakeholderOptions(entry.stakeholderRole).map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
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
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Start Time</label>
                            <input
                              type="time"
                              value={entry.startTime}
                              onChange={(e) => updateEntry(entry.id, 'startTime', e.target.value)}
                              className="input-premium w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">End Time</label>
                            <input
                              type="time"
                              value={entry.endTime}
                              onChange={(e) => updateEntry(entry.id, 'endTime', e.target.value)}
                              className="input-premium w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Effort Hours</label>
                            <input
                              type="number"
                              value={entry.effortHours}
                              onChange={(e) => updateEntry(entry.id, 'effortHours', e.target.value)}
                              placeholder="Auto-calculated or manual"
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
                    <p>Effort hours will be auto-calculated if you provide start and end times.</p>
                  </div>
                </div>
              )}

              {currentStep === 'review' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Review & Submit</h2>
                  
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                    <h4 className="font-medium text-foreground mb-2">Cohort Info</h4>
                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                      <p><span className="font-medium">Cohort:</span> {selectedCohort?.name}</p>
                      <p><span className="font-medium">Date:</span> {formData.date}</p>
                      <p><span className="font-medium">Active GenC:</span> {formData.activeGencCount || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Entries ({entries.filter(e => e.stakeholderRole && e.areaOfWork).length})</h4>
                    {entries.filter(e => e.stakeholderRole && e.areaOfWork).map((entry, index) => (
                      <div key={entry.id} className="rounded-lg border border-border/50 bg-muted/20 p-4">
                        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-muted-foreground">Role</p>
                            <p className="font-medium text-foreground capitalize">{entry.stakeholderRole.replace('-', ' ')}</p>
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
                            <p className="font-medium text-foreground">{entry.effortHours || '0'} hrs ({entry.mode})</p>
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
                        {entries.filter(e => e.stakeholderRole && e.areaOfWork).length} entries ready for submission
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {(['today', 'week', 'month', 'all'] as DateFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    dateFilter === filter
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
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
            </div>
          </div>

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
                  <GlassCard key={date} className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </h4>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {dayEfforts.reduce((sum, e) => sum + Number(e.effort_hours), 0)} hrs total
                      </span>
                    </div>
                    <div className="space-y-3">
                      {dayEfforts.map((effort) => (
                        <div
                          key={effort.id}
                          className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{effort.stakeholder_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {effort.stakeholder_type} • {effort.area_of_work}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{effort.effort_hours} hrs</p>
                            <p className="text-sm capitalize text-muted-foreground">{effort.mode_of_training}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No efforts found</h3>
              <p className="mt-2 text-muted-foreground">
                {formData.cohortId ? 'No efforts logged for this cohort in the selected period' : 'Select a cohort to view efforts'}
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
    </div>
  );
};
