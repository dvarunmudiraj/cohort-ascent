import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Send, User, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { WeekRange } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface StakeholderInfo {
  id: string;
  name: string;
  type: string;
}

export interface WeeklyLogData {
  trainer: {
    id: string;
    name: string;
    hours: number;
    activities: string;
  };
  mentor: {
    id: string;
    name: string;
    hours: number;
    notes: string;
  };
  buddyMentor: {
    id: string;
    name: string;
    hours: number;
    notes: string;
  };
}

interface WeeklyLogFormProps {
  selectedWeek: WeekRange;
  trainers: StakeholderInfo[];
  mentors: StakeholderInfo[];
  buddyMentors: StakeholderInfo[];
  initialData?: Partial<WeeklyLogData>;
  isEditable: boolean;
  onSave: (data: WeeklyLogData, status: 'draft' | 'completed') => void;
  isSaving: boolean;
  totalWeeks: number;
}

export const WeeklyLogForm = ({
  selectedWeek,
  trainers,
  mentors,
  buddyMentors,
  initialData,
  isEditable,
  onSave,
  isSaving,
  totalWeeks,
}: WeeklyLogFormProps) => {
  const [formData, setFormData] = useState<WeeklyLogData>({
    trainer: {
      id: trainers[0]?.id || '',
      name: trainers[0]?.name || 'Not Assigned',
      hours: 0,
      activities: '',
    },
    mentor: {
      id: mentors[0]?.id || '',
      name: mentors[0]?.name || 'Not Assigned',
      hours: 0,
      notes: '',
    },
    buddyMentor: {
      id: buddyMentors[0]?.id || '',
      name: buddyMentors[0]?.name || 'Not Assigned',
      hours: 0,
      notes: '',
    },
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        trainer: { ...prev.trainer, ...initialData.trainer },
        mentor: { ...prev.mentor, ...initialData.mentor },
        buddyMentor: { ...prev.buddyMentor, ...initialData.buddyMentor },
      }));
    } else {
      // Reset form when week changes
      setFormData({
        trainer: {
          id: trainers[0]?.id || '',
          name: trainers[0]?.name || 'Not Assigned',
          hours: 0,
          activities: '',
        },
        mentor: {
          id: mentors[0]?.id || '',
          name: mentors[0]?.name || 'Not Assigned',
          hours: 0,
          notes: '',
        },
        buddyMentor: {
          id: buddyMentors[0]?.id || '',
          name: buddyMentors[0]?.name || 'Not Assigned',
          hours: 0,
          notes: '',
        },
      });
    }
  }, [selectedWeek.id, initialData, trainers, mentors, buddyMentors]);

  const handleSubmit = (status: 'draft' | 'completed') => {
    onSave(formData, status);
    if (status === 'completed') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const totalHours = formData.trainer.hours + formData.mentor.hours + formData.buddyMentor.hours;

  return (
    <div className="space-y-6">
      {/* Week Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Week {selectedWeek.weekNumber} Effort Log
          </h2>
          <p className="text-sm text-muted-foreground">
            {format(selectedWeek.startDate, 'MMMM d')} - {format(selectedWeek.endDate, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{totalHours}</p>
            <p className="text-xs text-muted-foreground">Total Hours</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">
              Week {selectedWeek.weekNumber} of {totalWeeks}
            </p>
            <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(selectedWeek.weekNumber / totalWeeks) * 100}%` }}
                className="h-full bg-gradient-to-r from-primary to-neon-blue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-4"
        >
          <CheckCircle2 className="h-6 w-6 text-success" />
          <div>
            <p className="font-medium text-foreground">Successfully Saved!</p>
            <p className="text-sm text-muted-foreground">Week {selectedWeek.weekNumber} effort log has been saved.</p>
          </div>
        </motion.div>
      )}

      {/* Trainer Section */}
      <GlassCard variant="feature" className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Trainer Section</h3>
            <p className="text-sm text-muted-foreground">Log trainer activities and hours</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Trainer Name</label>
            <div className="input-premium flex items-center gap-2 bg-muted/50">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{formData.trainer.name}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Total Hours Worked</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                min="0"
                max="168"
                step="0.5"
                value={formData.trainer.hours || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  trainer: { ...prev.trainer, hours: parseFloat(e.target.value) || 0 }
                }))}
                disabled={!isEditable}
                className="input-premium w-full pl-10"
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Activities Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                value={formData.trainer.activities}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  trainer: { ...prev.trainer, activities: e.target.value }
                }))}
                disabled={!isEditable}
                className="input-premium min-h-[100px] w-full resize-none pl-10"
                placeholder="Describe training activities, topics covered, etc."
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Mentor Section */}
      <GlassCard variant="feature" className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
            <User className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Mentor Section</h3>
            <p className="text-sm text-muted-foreground">Log mentor guidance and review hours</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mentor Name</label>
            <div className="input-premium flex items-center gap-2 bg-muted/50">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{formData.mentor.name}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Total Hours Worked</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                min="0"
                max="168"
                step="0.5"
                value={formData.mentor.hours || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  mentor: { ...prev.mentor, hours: parseFloat(e.target.value) || 0 }
                }))}
                disabled={!isEditable}
                className="input-premium w-full pl-10"
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Guidance / Review Notes</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                value={formData.mentor.notes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  mentor: { ...prev.mentor, notes: e.target.value }
                }))}
                disabled={!isEditable}
                className="input-premium min-h-[100px] w-full resize-none pl-10"
                placeholder="Describe mentoring sessions, code reviews, guidance provided..."
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Buddy Mentor Section */}
      <GlassCard variant="feature" className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/20">
            <User className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Buddy Mentor Section</h3>
            <p className="text-sm text-muted-foreground">Log buddy mentor support hours</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Buddy Mentor Name</label>
            <div className="input-premium flex items-center gap-2 bg-muted/50">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{formData.buddyMentor.name}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Total Hours Worked</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                min="0"
                max="168"
                step="0.5"
                value={formData.buddyMentor.hours || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  buddyMentor: { ...prev.buddyMentor, hours: parseFloat(e.target.value) || 0 }
                }))}
                disabled={!isEditable}
                className="input-premium w-full pl-10"
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Support Notes</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                value={formData.buddyMentor.notes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  buddyMentor: { ...prev.buddyMentor, notes: e.target.value }
                }))}
                disabled={!isEditable}
                className="input-premium min-h-[100px] w-full resize-none pl-10"
                placeholder="Describe peer support, pair programming, assistance provided..."
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      {isEditable && (
        <div className="flex items-center justify-end gap-3">
          <GradientButton
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSaving}
            icon={<Save className="h-4 w-4" />}
          >
            Save Draft
          </GradientButton>
          <GradientButton
            variant="primary"
            onClick={() => handleSubmit('completed')}
            disabled={isSaving}
            icon={<Send className="h-4 w-4" />}
          >
            {isSaving ? 'Saving...' : 'Submit Week'}
          </GradientButton>
        </div>
      )}
    </div>
  );
};
