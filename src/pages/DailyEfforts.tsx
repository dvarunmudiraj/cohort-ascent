import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Save,
  Send,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useCohortStore } from '@/stores/cohortStore';
import { cn } from '@/lib/utils';

type Step = 'cohort' | 'stakeholder' | 'effort' | 'review';

const steps: { id: Step; label: string }[] = [
  { id: 'cohort', label: 'Cohort Details' },
  { id: 'stakeholder', label: 'Stakeholder Info' },
  { id: 'effort', label: 'Effort Entry' },
  { id: 'review', label: 'Review & Submit' },
];

export const DailyEfforts = () => {
  const [currentStep, setCurrentStep] = useState<Step>('cohort');
  const { cohorts } = useCohortStore();
  const [formData, setFormData] = useState({
    cohortId: '',
    stakeholderRole: '',
    stakeholderId: '',
    mode: 'in-person',
    virtualReason: '',
    areaOfWork: '',
    effortHours: '',
    date: new Date().toISOString().split('T')[0],
  });

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Daily Effort Entry</h1>
        <p className="mt-2 text-muted-foreground">
          Log training efforts for your cohort stakeholders
        </p>
      </motion.div>

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
                  onClick={() => setCurrentStep(step.id)}
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
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Select Cohort</label>
                  <select
                    value={formData.cohortId}
                    onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
                    className="input-premium w-full"
                  >
                    <option value="">Choose a cohort...</option>
                    {cohorts.filter(c => c.status === 'active').map((cohort) => (
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
              </div>
              {formData.cohortId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-border/50 bg-muted/30 p-4"
                >
                  <h4 className="font-medium text-foreground">Selected Cohort Info</h4>
                  {(() => {
                    const cohort = cohorts.find(c => c.id === formData.cohortId);
                    return cohort ? (
                      <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                        <p><span className="font-medium">BU:</span> {cohort.bu}</p>
                        <p><span className="font-medium">Skill:</span> {cohort.skill}</p>
                        <p><span className="font-medium">Location:</span> {cohort.location}</p>
                      </div>
                    ) : null;
                  })()}
                </motion.div>
              )}
            </div>
          )}

          {currentStep === 'stakeholder' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Stakeholder Information</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Stakeholder Role</label>
                  <select
                    value={formData.stakeholderRole}
                    onChange={(e) => setFormData({ ...formData, stakeholderRole: e.target.value })}
                    className="input-premium w-full"
                  >
                    <option value="">Select role...</option>
                    <option value="tech-trainer">Technical Trainer</option>
                    <option value="behavioral-trainer">Behavioral Trainer</option>
                    <option value="mentor">Mentor</option>
                    <option value="buddy-mentor">Buddy Mentor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">SME/Mentor</label>
                  <select
                    value={formData.stakeholderId}
                    onChange={(e) => setFormData({ ...formData, stakeholderId: e.target.value })}
                    className="input-premium w-full"
                  >
                    <option value="">Select stakeholder...</option>
                    <option value="1">Alex Kumar - Technical Trainer</option>
                    <option value="2">Raj Patel - Mentor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Mode of Training</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mode"
                        value="in-person"
                        checked={formData.mode === 'in-person'}
                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-foreground">In-Person</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mode"
                        value="virtual"
                        checked={formData.mode === 'virtual'}
                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-foreground">Virtual</span>
                    </label>
                  </div>
                </div>
                {formData.mode === 'virtual' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Reason for Virtual</label>
                    <input
                      type="text"
                      value={formData.virtualReason}
                      onChange={(e) => setFormData({ ...formData, virtualReason: e.target.value })}
                      placeholder="Enter reason..."
                      className="input-premium w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'effort' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Effort Details</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Area of Work</label>
                  <input
                    type="text"
                    value={formData.areaOfWork}
                    onChange={(e) => setFormData({ ...formData, areaOfWork: e.target.value })}
                    placeholder="e.g., React Components, AWS Setup..."
                    className="input-premium w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Effort Hours</label>
                  <input
                    type="number"
                    value={formData.effortHours}
                    onChange={(e) => setFormData({ ...formData, effortHours: e.target.value })}
                    placeholder="0.0"
                    min="0"
                    max="24"
                    step="0.5"
                    className="input-premium w-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/10 p-4 text-sm text-info">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>Effort hours will be auto-calculated based on session start and end times if provided.</p>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Review & Submit</h2>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Cohort</p>
                    <p className="font-medium text-foreground">
                      {cohorts.find(c => c.id === formData.cohortId)?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{formData.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stakeholder Role</p>
                    <p className="font-medium capitalize text-foreground">
                      {formData.stakeholderRole.replace('-', ' ') || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mode</p>
                    <p className="font-medium capitalize text-foreground">{formData.mode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Area of Work</p>
                    <p className="font-medium text-foreground">{formData.areaOfWork || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Effort Hours</p>
                    <p className="font-medium text-foreground">{formData.effortHours || '0'} hrs</p>
                  </div>
                </div>
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
                    Your daily effort entry is ready for submission
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
              <GradientButton variant="outline" icon={<Save className="h-4 w-4" />}>
                Save Draft
              </GradientButton>
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
                  icon={<Send className="h-4 w-4" />}
                  iconPosition="right"
                >
                  Submit Entry
                </GradientButton>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
