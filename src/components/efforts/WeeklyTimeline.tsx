import { motion } from 'framer-motion';
import { Check, Lock, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeekRange } from '@/utils/dateUtils';
import { format, isAfter, isBefore, isWithinInterval } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type WeekStatus = 'completed' | 'active' | 'locked';

interface WeeklyTimelineProps {
  weeks: WeekRange[];
  selectedWeek: WeekRange | null;
  onSelectWeek: (week: WeekRange) => void;
  completedWeeks: Set<string>;
}

export const WeeklyTimeline = ({
  weeks,
  selectedWeek,
  onSelectWeek,
  completedWeeks,
}: WeeklyTimelineProps) => {
  const today = new Date();

  const getWeekStatus = (week: WeekRange): WeekStatus => {
    // Check if week is completed
    if (completedWeeks.has(week.id)) {
      return 'completed';
    }
    
    // Check if week is in the future
    if (isAfter(week.startDate, today)) {
      return 'locked';
    }
    
    // Check if today is within this week (active)
    if (isWithinInterval(today, { start: week.startDate, end: week.endDate })) {
      return 'active';
    }
    
    // Past week without completion - still editable
    return 'active';
  };

  const getStatusConfig = (status: WeekStatus) => {
    switch (status) {
      case 'completed':
        return {
          icon: Check,
          bgClass: 'bg-success/20 border-success/50',
          iconClass: 'text-success',
          lineClass: 'bg-success',
        };
      case 'active':
        return {
          icon: Clock,
          bgClass: 'bg-primary/20 border-primary/50',
          iconClass: 'text-primary',
          lineClass: 'bg-primary',
        };
      case 'locked':
        return {
          icon: Lock,
          bgClass: 'bg-muted border-border/50 opacity-50',
          iconClass: 'text-muted-foreground',
          lineClass: 'bg-border',
        };
    }
  };

  return (
    <div className="relative space-y-1">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Calendar className="h-4 w-4 text-primary" />
        Weekly Timeline
      </h3>
      
      <div className="space-y-2">
        {weeks.map((week, index) => {
          const status = getWeekStatus(week);
          const config = getStatusConfig(status);
          const Icon = config.icon;
          const isSelected = selectedWeek?.id === week.id;
          const isClickable = status !== 'locked';

          return (
            <TooltipProvider key={week.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => isClickable && onSelectWeek(week)}
                    disabled={!isClickable}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                        : config.bgClass,
                      isClickable ? 'cursor-pointer hover:border-primary/50' : 'cursor-not-allowed'
                    )}
                  >
                    {/* Status Icon */}
                    <div
                      className={cn(
                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border',
                        isSelected ? 'border-primary bg-primary text-primary-foreground' : config.bgClass
                      )}
                    >
                      <Icon className={cn('h-4 w-4', isSelected ? 'text-primary-foreground' : config.iconClass)} />
                    </div>

                    {/* Week Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        status === 'locked' ? 'text-muted-foreground' : 'text-foreground'
                      )}>
                        Week {week.weekNumber}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {format(week.startDate, 'MMM d')} - {format(week.endDate, 'MMM d')}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                        status === 'completed' && 'bg-success/20 text-success',
                        status === 'active' && 'bg-primary/20 text-primary',
                        status === 'locked' && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {status}
                    </span>

                    {/* Connection Line */}
                    {index < weeks.length - 1 && (
                      <div
                        className={cn(
                          'absolute -bottom-2 left-[1.375rem] h-3 w-0.5',
                          config.lineClass
                        )}
                      />
                    )}
                  </motion.button>
                </TooltipTrigger>
                {status === 'locked' && (
                  <TooltipContent side="right" className="bg-background border-border">
                    <p className="text-sm">Available after this week ends</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};
