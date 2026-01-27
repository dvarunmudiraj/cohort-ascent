import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Eye,
  ChevronDown,
  GraduationCap,
  BarChart3,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { WeeklyTimeline } from '@/components/efforts/WeeklyTimeline';
import { WeeklyLogForm, WeeklyLogData } from '@/components/efforts/WeeklyLogForm';
import { WeeklyHistoryView } from '@/components/efforts/WeeklyHistoryView';
import { useCohortStore } from '@/stores/cohortStore';
import { useCohorts } from '@/hooks/useCohorts';
import { useTrainers } from '@/hooks/useTrainers';
import { useMentors } from '@/hooks/useMentors';
import { useDailyEfforts, useBulkCreateDailyEfforts } from '@/hooks/useDailyEfforts';
import { useAuthStore } from '@/stores/authStore';
import { generateCalendarWeeks, getCurrentWeek, WeekRange } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, isAfter, isWithinInterval } from 'date-fns';

type ViewMode = 'entry' | 'history';

export const WeeklyEfforts = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('entry');
  const [selectedCohortId, setSelectedCohortId] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<WeekRange | null>(null);
  
  const { cohorts: mockCohorts } = useCohortStore();
  const { data: dbCohorts = [] } = useCohorts();
  const { user } = useAuthStore();
  const bulkCreateEfforts = useBulkCreateDailyEfforts();

  // Merge cohorts
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

  const selectedCohort = cohorts.find(c => c.id === selectedCohortId);
  
  // Get stakeholders for selected cohort
  const { data: trainers = [] } = useTrainers(selectedCohortId);
  const { data: mentors = [] } = useMentors(selectedCohortId);

  // Get mock stakeholders if DB is empty
  const mockCohort = mockCohorts.find(c => c.id === selectedCohortId);
  
  const trainersList = useMemo(() => {
    if (trainers.length > 0) {
      return trainers.map(t => ({ id: t.id, name: t.name, type: t.type }));
    }
    return mockCohort?.trainers?.map(t => ({ id: t.id, name: t.name, type: t.type })) || [];
  }, [trainers, mockCohort]);

  const mentorsList = useMemo(() => {
    if (mentors.length > 0) {
      return mentors.filter(m => m.type === 'mentor').map(m => ({ id: m.id, name: m.name, type: m.type }));
    }
    return mockCohort?.mentors?.filter(m => m.type === 'mentor').map(m => ({ id: m.id, name: m.name, type: m.type })) || [];
  }, [mentors, mockCohort]);

  const buddyMentorsList = useMemo(() => {
    if (mentors.length > 0) {
      return mentors.filter(m => m.type === 'buddy').map(m => ({ id: m.id, name: m.name, type: m.type }));
    }
    return mockCohort?.mentors?.filter(m => m.type === 'buddy').map(m => ({ id: m.id, name: m.name, type: m.type })) || [];
  }, [mentors, mockCohort]);

  // Generate calendar weeks
  const calendarWeeks = useMemo(() => {
    if (!selectedCohort) return [];
    const endDate = selectedCohort.endDate || format(new Date(), 'yyyy-MM-dd');
    return generateCalendarWeeks(selectedCohort.startDate, endDate);
  }, [selectedCohort]);

  // Get efforts for selected cohort
  const { data: efforts = [] } = useDailyEfforts(selectedCohortId || undefined);

  // Build weekly data map from efforts
  const weeklyDataMap = useMemo(() => {
    const map = new Map<string, { data: WeeklyLogData; submittedAt: string }>();
    
    calendarWeeks.forEach(week => {
      const weekEfforts = efforts.filter(e => {
        const date = new Date(e.date);
        return isWithinInterval(date, { start: week.startDate, end: week.endDate });
      });
      
      if (weekEfforts.length > 0) {
        const trainerEffort = weekEfforts.find(e => e.stakeholder_type.toLowerCase().includes('trainer'));
        const mentorEffort = weekEfforts.find(e => e.stakeholder_type.toLowerCase() === 'mentor');
        const buddyEffort = weekEfforts.find(e => e.stakeholder_type.toLowerCase().includes('buddy'));
        
        map.set(week.id, {
          data: {
            trainer: {
              id: trainerEffort?.stakeholder_id || '',
              name: trainerEffort?.stakeholder_name || trainersList[0]?.name || 'Not Assigned',
              hours: weekEfforts.filter(e => e.stakeholder_type.toLowerCase().includes('trainer'))
                .reduce((sum, e) => sum + Number(e.effort_hours), 0),
              activities: trainerEffort?.area_of_work || '',
            },
            mentor: {
              id: mentorEffort?.stakeholder_id || '',
              name: mentorEffort?.stakeholder_name || mentorsList[0]?.name || 'Not Assigned',
              hours: weekEfforts.filter(e => e.stakeholder_type.toLowerCase() === 'mentor')
                .reduce((sum, e) => sum + Number(e.effort_hours), 0),
              notes: mentorEffort?.area_of_work || '',
            },
            buddyMentor: {
              id: buddyEffort?.stakeholder_id || '',
              name: buddyEffort?.stakeholder_name || buddyMentorsList[0]?.name || 'Not Assigned',
              hours: weekEfforts.filter(e => e.stakeholder_type.toLowerCase().includes('buddy'))
                .reduce((sum, e) => sum + Number(e.effort_hours), 0),
              notes: buddyEffort?.area_of_work || '',
            },
          },
          submittedAt: weekEfforts[0]?.updated_at || weekEfforts[0]?.created_at || new Date().toISOString(),
        });
      }
    });
    
    return map;
  }, [efforts, calendarWeeks, trainersList, mentorsList, buddyMentorsList]);

  // Set of completed week IDs
  const completedWeeks = useMemo(() => {
    return new Set(Array.from(weeklyDataMap.keys()));
  }, [weeklyDataMap]);

  // Auto-select current week when cohort changes
  useEffect(() => {
    if (calendarWeeks.length > 0 && !selectedWeek) {
      const current = getCurrentWeek(calendarWeeks);
      if (current) {
        setSelectedWeek(current);
      } else {
        // Select first available week
        setSelectedWeek(calendarWeeks[0]);
      }
    }
  }, [calendarWeeks, selectedWeek]);

  // Check if selected week is editable
  const isWeekEditable = useMemo(() => {
    if (!selectedWeek) return false;
    const today = new Date();
    // Can't edit future weeks
    if (isAfter(selectedWeek.startDate, today)) return false;
    return true;
  }, [selectedWeek]);

  const handleWeekSelect = (week: WeekRange) => {
    const today = new Date();
    if (isAfter(week.startDate, today)) {
      toast.error('Cannot access future weeks');
      return;
    }
    setSelectedWeek(week);
  };

  const handleSaveWeeklyLog = (data: WeeklyLogData, status: 'draft' | 'completed') => {
    if (!selectedWeek || !selectedCohortId) return;

    const midWeekDate = format(selectedWeek.startDate, 'yyyy-MM-dd');
    
    const effortsToCreate = [];
    
    // Add trainer effort
    if (data.trainer.hours > 0) {
      effortsToCreate.push({
        cohort_id: selectedCohortId,
        date: midWeekDate,
        stakeholder_id: data.trainer.id || 'trainer-default',
        stakeholder_name: data.trainer.name,
        stakeholder_type: 'Technical Trainer',
        mode_of_training: 'in-person',
        area_of_work: data.trainer.activities,
        effort_hours: data.trainer.hours,
        submitted_by: user?.id || 'unknown',
      });
    }
    
    // Add mentor effort
    if (data.mentor.hours > 0) {
      effortsToCreate.push({
        cohort_id: selectedCohortId,
        date: midWeekDate,
        stakeholder_id: data.mentor.id || 'mentor-default',
        stakeholder_name: data.mentor.name,
        stakeholder_type: 'Mentor',
        mode_of_training: 'in-person',
        area_of_work: data.mentor.notes,
        effort_hours: data.mentor.hours,
        submitted_by: user?.id || 'unknown',
      });
    }
    
    // Add buddy mentor effort
    if (data.buddyMentor.hours > 0) {
      effortsToCreate.push({
        cohort_id: selectedCohortId,
        date: midWeekDate,
        stakeholder_id: data.buddyMentor.id || 'buddy-default',
        stakeholder_name: data.buddyMentor.name,
        stakeholder_type: 'Buddy Mentor',
        mode_of_training: 'in-person',
        area_of_work: data.buddyMentor.notes,
        effort_hours: data.buddyMentor.hours,
        submitted_by: user?.id || 'unknown',
      });
    }

    if (effortsToCreate.length === 0) {
      toast.error('Please log at least one hour for any stakeholder');
      return;
    }

    bulkCreateEfforts.mutate(effortsToCreate, {
      onSuccess: () => {
        toast.success(`Week ${selectedWeek.weekNumber} effort log ${status === 'completed' ? 'submitted' : 'saved as draft'} successfully!`);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Weekly Effort Logging</h1>
          <p className="mt-2 text-muted-foreground">
            Log and track weekly training efforts for your cohort
          </p>
        </div>
        <div className="flex gap-3">
          <GradientButton
            variant={viewMode === 'entry' ? 'primary' : 'outline'}
            onClick={() => setViewMode('entry')}
            icon={<Calendar className="h-4 w-4" />}
          >
            Log Effort
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

      {/* Cohort Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-foreground">Select Cohort</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={selectedCohortId}
                  onChange={(e) => {
                    setSelectedCohortId(e.target.value);
                    setSelectedWeek(null);
                  }}
                  className="input-premium w-full pl-10"
                >
                  <option value="">Choose a cohort...</option>
                  {cohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.code} - {cohort.name} ({cohort.skill})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedCohort && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-6 rounded-lg border border-border/30 bg-muted/20 p-4"
              >
                <div>
                  <p className="text-xs text-muted-foreground">Business Unit</p>
                  <p className="font-medium text-foreground">{selectedCohort.bu}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{selectedCohort.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(selectedCohort.startDate), 'MMM d')} - {selectedCohort.endDate ? format(new Date(selectedCohort.endDate), 'MMM d, yyyy') : 'Ongoing'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Content */}
      {selectedCohortId && calendarWeeks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 lg:grid-cols-[300px_1fr]"
        >
          {/* Left Panel - Timeline */}
          <GlassCard className="h-fit p-4 lg:sticky lg:top-4">
            <WeeklyTimeline
              weeks={calendarWeeks}
              selectedWeek={selectedWeek}
              onSelectWeek={handleWeekSelect}
              completedWeeks={completedWeeks}
            />
          </GlassCard>

          {/* Right Panel - Form or History */}
          <div>
            <AnimatePresence mode="wait">
              {viewMode === 'entry' ? (
                <motion.div
                  key="entry"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {selectedWeek ? (
                    <GlassCard className="p-6">
                      <WeeklyLogForm
                        selectedWeek={selectedWeek}
                        trainers={trainersList}
                        mentors={mentorsList}
                        buddyMentors={buddyMentorsList}
                        initialData={weeklyDataMap.get(selectedWeek.id)?.data}
                        isEditable={isWeekEditable}
                        onSave={handleSaveWeeklyLog}
                        isSaving={bulkCreateEfforts.isPending}
                        totalWeeks={calendarWeeks.length}
                      />
                    </GlassCard>
                  ) : (
                    <GlassCard className="p-12 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-semibold text-foreground">Select a Week</h3>
                      <p className="mt-2 text-muted-foreground">
                        Choose a week from the timeline to start logging efforts
                      </p>
                    </GlassCard>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <WeeklyHistoryView
                    weeks={calendarWeeks}
                    weeklyData={weeklyDataMap}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!selectedCohortId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Select a Cohort to Get Started</h3>
            <p className="mt-2 text-muted-foreground">
              Choose a cohort from the dropdown above to view and log weekly efforts
            </p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default WeeklyEfforts;
