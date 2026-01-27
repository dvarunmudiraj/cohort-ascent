import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  User, 
  FileText,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { WeekRange } from '@/utils/dateUtils';
import { format, getMonth, getYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { WeeklyLogData } from './WeeklyLogForm';

interface WeeklyHistoryData {
  week: WeekRange;
  data: WeeklyLogData;
  submittedAt: string;
}

interface WeeklyHistoryViewProps {
  weeks: WeekRange[];
  weeklyData: Map<string, { data: WeeklyLogData; submittedAt: string }>;
}

export const WeeklyHistoryView = ({ weeks, weeklyData }: WeeklyHistoryViewProps) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Group weeks by month
  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    weeks.forEach(week => {
      const monthKey = format(week.startDate, 'yyyy-MM');
      months.add(monthKey);
    });
    return Array.from(months).map(key => ({
      value: key,
      label: format(new Date(key + '-01'), 'MMMM yyyy'),
    }));
  }, [weeks]);

  // Filter weeks by selected month
  const filteredWeeks = useMemo(() => {
    if (selectedMonth === 'all') return weeks;
    return weeks.filter(week => {
      const monthKey = format(week.startDate, 'yyyy-MM');
      return monthKey === selectedMonth;
    });
  }, [weeks, selectedMonth]);

  // Get completed weeks
  const completedWeeks = useMemo(() => {
    return filteredWeeks.filter(week => weeklyData.has(week.id));
  }, [filteredWeeks, weeklyData]);

  const toggleExpand = (weekId: string) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekId)) {
        newSet.delete(weekId);
      } else {
        newSet.add(weekId);
      }
      return newSet;
    });
  };

  // Calculate month totals
  const monthTotals = useMemo(() => {
    let trainerHours = 0;
    let mentorHours = 0;
    let buddyHours = 0;
    
    completedWeeks.forEach(week => {
      const data = weeklyData.get(week.id);
      if (data) {
        trainerHours += data.data.trainer.hours || 0;
        mentorHours += data.data.mentor.hours || 0;
        buddyHours += data.data.buddyMentor.hours || 0;
      }
    });
    
    return { trainerHours, mentorHours, buddyHours, total: trainerHours + mentorHours + buddyHours };
  }, [completedWeeks, weeklyData]);

  return (
    <div className="space-y-6">
      {/* Month Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Weekly History</h2>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-premium min-w-[180px]"
          >
            <option value="all">All Months</option>
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Summary */}
      {selectedMonth !== 'all' && (
        <GlassCard variant="feature" className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            {monthOptions.find(m => m.value === selectedMonth)?.label} Summary
          </h3>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border/30 bg-muted/20 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{monthTotals.trainerHours}</p>
              <p className="text-sm text-muted-foreground">Trainer Hours</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-muted/20 p-4 text-center">
              <p className="text-2xl font-bold text-secondary">{monthTotals.mentorHours}</p>
              <p className="text-sm text-muted-foreground">Mentor Hours</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-muted/20 p-4 text-center">
              <p className="text-2xl font-bold text-info">{monthTotals.buddyHours}</p>
              <p className="text-sm text-muted-foreground">Buddy Mentor Hours</p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{monthTotals.total}</p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Completed Weeks */}
      {completedWeeks.length > 0 ? (
        <div className="space-y-4">
          {completedWeeks.map((week, index) => {
            const weekData = weeklyData.get(week.id);
            if (!weekData) return null;
            
            const isExpanded = expandedWeeks.has(week.id);
            const totalHours = 
              (weekData.data.trainer.hours || 0) + 
              (weekData.data.mentor.hours || 0) + 
              (weekData.data.buddyMentor.hours || 0);

            return (
              <motion.div
                key={week.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard variant="hover" className="overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => toggleExpand(week.id)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Week {week.weekNumber}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(week.startDate, 'MMM d')} - {format(week.endDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{totalHours} hrs</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {format(new Date(weekData.submittedAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border/30"
                      >
                        <div className="grid gap-4 p-4 md:grid-cols-3">
                          {/* Trainer */}
                          <div className="rounded-lg border border-border/30 bg-muted/10 p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">Trainer</span>
                            </div>
                            <p className="font-medium text-foreground">{weekData.data.trainer.name}</p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {weekData.data.trainer.hours} hours
                            </div>
                            {weekData.data.trainer.activities && (
                              <div className="mt-3 border-t border-border/20 pt-3">
                                <p className="text-xs text-muted-foreground">Activities:</p>
                                <p className="mt-1 text-sm text-foreground line-clamp-3">
                                  {weekData.data.trainer.activities}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Mentor */}
                          <div className="rounded-lg border border-border/30 bg-muted/10 p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <User className="h-4 w-4 text-secondary" />
                              <span className="text-sm font-medium text-secondary">Mentor</span>
                            </div>
                            <p className="font-medium text-foreground">{weekData.data.mentor.name}</p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {weekData.data.mentor.hours} hours
                            </div>
                            {weekData.data.mentor.notes && (
                              <div className="mt-3 border-t border-border/20 pt-3">
                                <p className="text-xs text-muted-foreground">Notes:</p>
                                <p className="mt-1 text-sm text-foreground line-clamp-3">
                                  {weekData.data.mentor.notes}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Buddy Mentor */}
                          <div className="rounded-lg border border-border/30 bg-muted/10 p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <User className="h-4 w-4 text-info" />
                              <span className="text-sm font-medium text-info">Buddy Mentor</span>
                            </div>
                            <p className="font-medium text-foreground">{weekData.data.buddyMentor.name}</p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {weekData.data.buddyMentor.hours} hours
                            </div>
                            {weekData.data.buddyMentor.notes && (
                              <div className="mt-3 border-t border-border/20 pt-3">
                                <p className="text-xs text-muted-foreground">Notes:</p>
                                <p className="mt-1 text-sm text-foreground line-clamp-3">
                                  {weekData.data.buddyMentor.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <GlassCard className="p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No Weekly Logs Yet</h3>
          <p className="mt-2 text-muted-foreground">
            {selectedMonth !== 'all' 
              ? 'No completed weeks for the selected month'
              : 'Start logging your weekly efforts to see history here'}
          </p>
        </GlassCard>
      )}
    </div>
  );
};
