import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  GraduationCap,
  Users,
  UserCheck,
  Calendar,
  BarChart3,
  MapPin,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Plus,
  MoreVertical,
} from 'lucide-react';
import { useCohortStore } from '@/stores/cohortStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { cn } from '@/lib/utils';

type TabType = 'overview' | 'candidates' | 'stakeholders' | 'efforts' | 'reports';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: GraduationCap },
  { id: 'candidates', label: 'Candidates', icon: Users },
  { id: 'stakeholders', label: 'Trainers & Mentors', icon: UserCheck },
  { id: 'efforts', label: 'Daily Efforts', icon: Calendar },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export const CohortDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cohorts } = useCohortStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const cohort = cohorts.find((c) => c.id === id);

  if (!cohort) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Cohort not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button & Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/cohorts')}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cohorts
        </button>

        <GlassCard variant="feature" className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-neon-blue/20">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">{cohort.code}</span>
                <h1 className="text-2xl font-bold text-foreground">{cohort.name}</h1>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {cohort.location}
                  </span>
                  <span>•</span>
                  <span>{cohort.skill}</span>
                  <span>•</span>
                  <span>{cohort.candidateCount} candidates</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-foreground">{cohort.progress}%</p>
              </div>
              <div className="h-16 w-16">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-muted"
                    strokeWidth="2"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-primary"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={100}
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 100 - cohort.progress }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && <OverviewTab cohort={cohort} />}
        {activeTab === 'stakeholders' && <StakeholdersTab cohort={cohort} />}
        {activeTab === 'candidates' && <CandidatesTab cohort={cohort} />}
        {activeTab === 'efforts' && <EffortsTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </motion.div>
    </div>
  );
};

const OverviewTab = ({ cohort }: { cohort: ReturnType<typeof useCohortStore.getState>['cohorts'][0] }) => (
  <div className="grid gap-6 lg:grid-cols-3">
    <GlassCard className="p-6 lg:col-span-2">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Cohort Details</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Business Unit</p>
          <p className="font-medium text-foreground">{cohort.bu}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Skill/Technology</p>
          <p className="font-medium text-foreground">{cohort.skill}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Start Date</p>
          <p className="font-medium text-foreground">
            {new Date(cohort.startDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <span className="badge-active mt-1 inline-block capitalize">{cohort.status}</span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Coach</p>
          <p className="font-medium text-foreground">{cohort.coachName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Location</p>
          <p className="font-medium text-foreground">{cohort.location}</p>
        </div>
      </div>
    </GlassCard>

    <GlassCard className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Stats</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total Candidates</span>
          <span className="font-semibold text-foreground">{cohort.candidateCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Trainers</span>
          <span className="font-semibold text-foreground">{cohort.trainers.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Mentors</span>
          <span className="font-semibold text-foreground">{cohort.mentors.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Completion</span>
          <span className="font-semibold text-primary">{cohort.progress}%</span>
        </div>
      </div>
    </GlassCard>
  </div>
);

const StakeholdersTab = ({ cohort }: { cohort: ReturnType<typeof useCohortStore.getState>['cohorts'][0] }) => (
  <div className="space-y-8">
    {/* Trainers */}
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Trainers</h3>
        <GradientButton variant="outline" size="sm" icon={<Plus className="h-4 w-4" />}>
          Add Trainer
        </GradientButton>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cohort.trainers.map((trainer) => (
          <GlassCard key={trainer.id} variant="hover" glow="cyan" className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-neon-blue/30 text-lg font-semibold text-primary">
                  {trainer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{trainer.name}</h4>
                  <p className="text-sm capitalize text-muted-foreground">{trainer.type} Trainer</p>
                </div>
              </div>
              <button className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {trainer.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                {trainer.skill}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <span className={`badge-status ${trainer.isInternal ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                {trainer.isInternal ? 'Internal' : 'External'}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>

    {/* Mentors */}
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Mentors</h3>
        <GradientButton variant="outline" size="sm" icon={<Plus className="h-4 w-4" />}>
          Add Mentor
        </GradientButton>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cohort.mentors.map((mentor) => (
          <GlassCard key={mentor.id} variant="hover" glow="violet" className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-secondary/30 to-neon-purple/30 text-lg font-semibold text-secondary">
                  {mentor.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{mentor.name}</h4>
                  <p className="text-sm capitalize text-muted-foreground">{mentor.type} Mentor</p>
                </div>
              </div>
              <button className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {mentor.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                {mentor.skill}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  </div>
);

const CandidatesTab = ({ cohort }: { cohort: ReturnType<typeof useCohortStore.getState>['cohorts'][0] }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search candidates..."
          className="input-premium w-full"
        />
      </div>
      <div className="flex gap-3">
        <GradientButton variant="outline" size="sm">
          Upload CSV
        </GradientButton>
        <GradientButton variant="primary" size="sm" icon={<Plus className="h-4 w-4" />}>
          Add Candidate
        </GradientButton>
      </div>
    </div>

    <GlassCard className="overflow-hidden">
      <div className="p-6 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No candidates yet</h3>
        <p className="mt-2 text-muted-foreground">
          Upload a CSV file or add candidates manually
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <GradientButton variant="outline" size="sm">
            Upload CSV
          </GradientButton>
          <GradientButton variant="primary" size="sm">
            Add Manually
          </GradientButton>
        </div>
      </div>
    </GlassCard>
  </div>
);

const EffortsTab = () => (
  <GlassCard className="p-6">
    <div className="text-center py-12">
      <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">Daily Effort Tracking</h3>
      <p className="mt-2 text-muted-foreground">
        Log and track daily training efforts for this cohort
      </p>
      <GradientButton variant="primary" className="mt-6">
        Log Daily Effort
      </GradientButton>
    </div>
  </GlassCard>
);

const ReportsTab = () => (
  <GlassCard className="p-6">
    <div className="text-center py-12">
      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">Reports & Analytics</h3>
      <p className="mt-2 text-muted-foreground">
        Generate and download weekly reports
      </p>
      <GradientButton variant="primary" className="mt-6">
        Generate Report
      </GradientButton>
    </div>
  </GlassCard>
);
