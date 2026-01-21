import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  MoreHorizontal,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCohortStore } from '@/stores/cohortStore';
import { StatsCard } from '@/components/ui/StatsCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const { cohorts } = useCohortStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const activeCohorts = cohorts.filter((c) => c.status === 'active');
  const totalCandidates = cohorts.reduce((sum, c) => sum + c.candidateCount, 0);

  const recentActivity = [
    { id: 1, action: 'Daily effort submitted', cohort: 'GenC Batch Alpha', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'New candidate added', cohort: 'GenC Batch Beta', time: '4 hours ago', type: 'info' },
    { id: 3, action: 'Mentor assigned', cohort: 'GenC Batch Alpha', time: '6 hours ago', type: 'success' },
    { id: 4, action: 'Weekly report pending', cohort: 'GenC Batch Gamma', time: '1 day ago', type: 'warning' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isAdmin
            ? 'Here\'s an overview of all training operations'
            : 'Track your cohorts and manage training efforts'}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Cohorts"
          value={activeCohorts.length}
          change="+2 this month"
          changeType="positive"
          icon={GraduationCap}
          iconColor="cyan"
          delay={0.1}
        />
        <StatsCard
          title="Total Candidates"
          value={totalCandidates}
          change="+28 this week"
          changeType="positive"
          icon={Users}
          iconColor="violet"
          delay={0.2}
        />
        <StatsCard
          title="Avg. Completion"
          value="78%"
          change="+5% vs last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="success"
          delay={0.3}
        />
        <StatsCard
          title="Pending Reports"
          value="3"
          change="Due this Friday"
          changeType="neutral"
          icon={Calendar}
          iconColor="warning"
          delay={0.4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Cohorts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <GlassCard variant="default" className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Active Cohorts</h2>
              <GradientButton
                variant="ghost"
                size="sm"
                onClick={() => navigate('/cohorts')}
                icon={<ArrowUpRight className="h-4 w-4" />}
                iconPosition="right"
              >
                View All
              </GradientButton>
            </div>
            <div className="space-y-4">
              {activeCohorts.map((cohort, index) => (
                <motion.div
                  key={cohort.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="group flex items-center gap-4 rounded-xl border border-border/30 bg-muted/20 p-4 transition-all hover:border-primary/30 hover:bg-muted/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-neon-blue/20">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{cohort.name}</h3>
                      <span className="badge-active">Active</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cohort.skill} • {cohort.location} • {cohort.candidateCount} candidates
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="mb-1 text-sm font-medium text-foreground">{cohort.progress}%</div>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cohort.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-neon-blue"
                      />
                    </div>
                  </div>
                  <button className="opacity-0 transition-opacity group-hover:opacity-100">
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  </button>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard variant="default" className="p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className={`mt-1 rounded-full p-1 ${
                    activity.type === 'success' ? 'bg-success/20' :
                    activity.type === 'warning' ? 'bg-warning/20' : 'bg-info/20'
                  }`}>
                    {activity.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : activity.type === 'warning' ? (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    ) : (
                      <Clock className="h-4 w-4 text-info" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.cohort}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <GlassCard variant="feature" className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <GradientButton
              variant="outline"
              size="sm"
              onClick={() => navigate('/efforts')}
            >
              Log Daily Effort
            </GradientButton>
            <GradientButton
              variant="outline"
              size="sm"
              onClick={() => navigate('/candidates')}
            >
              Add Candidates
            </GradientButton>
            <GradientButton
              variant="outline"
              size="sm"
              onClick={() => navigate('/reports')}
            >
              Generate Report
            </GradientButton>
            {isAdmin && (
              <GradientButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/cohorts')}
              >
                Assign Coach
              </GradientButton>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
