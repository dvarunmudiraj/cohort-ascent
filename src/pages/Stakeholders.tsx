import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  Search,
  Plus,
  Mail,
  Phone,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { AddTrainerModal } from '@/components/modals/AddTrainerModal';
import { AddMentorModal } from '@/components/modals/AddMentorModal';
import { useTrainers, useCreateTrainer, useDeleteTrainer } from '@/hooks/useTrainers';
import { useMentors, useCreateMentor, useDeleteMentor } from '@/hooks/useMentors';
import { useCohorts } from '@/hooks/useCohorts';
import { useCohortStore } from '@/stores/cohortStore';
import { toast } from 'sonner';

type TabType = 'trainers' | 'mentors';

export const Stakeholders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('trainers');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showAddMentor, setShowAddMentor] = useState(false);

  const { data: dbCohorts = [] } = useCohorts();
  const { cohorts: mockCohorts } = useCohortStore();
  const cohorts = dbCohorts.length > 0 ? dbCohorts : mockCohorts;

  const { data: trainers = [], isLoading: loadingTrainers } = useTrainers(
    selectedCohort !== 'all' ? selectedCohort : undefined
  );
  const { data: mentors = [], isLoading: loadingMentors } = useMentors(
    selectedCohort !== 'all' ? selectedCohort : undefined
  );

  const createTrainer = useCreateTrainer();
  const createMentor = useCreateMentor();
  const deleteTrainer = useDeleteTrainer();
  const deleteMentor = useDeleteMentor();

  // Use mock data if no DB data
  const mockTrainers = mockCohorts.flatMap(c => c.trainers.map(t => ({
    id: t.id,
    emp_id: t.id,
    name: t.name,
    email: t.email,
    phone: null,
    type: t.type,
    skill: t.skill,
    avatar_url: t.avatar || null,
    cohort_id: c.id,
    cohort_name: c.name,
    is_internal: t.isInternal,
    status: 'active',
  })));

  const mockMentorsData = mockCohorts.flatMap(c => c.mentors.map(m => ({
    id: m.id,
    emp_id: m.id,
    name: m.name,
    email: m.email,
    phone: null,
    type: m.type,
    skill: m.skill,
    avatar_url: m.avatar || null,
    cohort_id: c.id,
    cohort_name: c.name,
    status: 'active',
  })));

  const displayTrainers = trainers.length > 0 ? trainers : mockTrainers;
  const displayMentors = mentors.length > 0 ? mentors : mockMentorsData;

  const filteredTrainers = displayTrainers.filter(
    (t) =>
      (selectedCohort === 'all' || t.cohort_id === selectedCohort) &&
      (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMentors = displayMentors.filter(
    (m) =>
      (selectedCohort === 'all' || m.cohort_id === selectedCohort) &&
      (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddTrainer = (data: any) => {
    if (!selectedCohort || selectedCohort === 'all') {
      toast.error('Please select a cohort first');
      return;
    }
    createTrainer.mutate({
      ...data,
      cohort_id: selectedCohort,
      status: 'active',
    }, {
      onSuccess: () => setShowAddTrainer(false),
    });
  };

  const handleAddMentor = (data: any) => {
    if (!selectedCohort || selectedCohort === 'all') {
      toast.error('Please select a cohort first');
      return;
    }
    createMentor.mutate({
      ...data,
      cohort_id: selectedCohort,
      status: 'active',
    }, {
      onSuccess: () => setShowAddMentor(false),
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
          <h1 className="text-3xl font-bold text-foreground">Stakeholders</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage trainers, mentors, and buddy mentors
          </p>
        </div>
        <div className="flex gap-3">
          <GradientButton
            variant="outline"
            icon={<UserCheck className="h-4 w-4" />}
            onClick={() => setShowAddMentor(true)}
          >
            Add Mentor
          </GradientButton>
          <GradientButton
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddTrainer(true)}
          >
            Add Trainer
          </GradientButton>
        </div>
      </motion.div>

      {/* Tabs and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('trainers')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'trainers'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Trainers ({filteredTrainers.length})
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'mentors'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Mentors ({filteredMentors.length})
          </button>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="input-premium appearance-none pr-10"
            >
              <option value="all">All Cohorts</option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {dbCohorts.length > 0 ? cohort.code : cohort.code} - {cohort.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or skill..."
            className="input-premium w-full pl-12"
          />
        </div>
      </motion.div>

      {/* Content */}
      {activeTab === 'trainers' ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredTrainers.map((trainer, index) => (
              <motion.div
                key={trainer.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GlassCard variant="hover" glow="cyan" className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/30 to-neon-blue/30 text-xl font-bold text-primary">
                        {trainer.avatar_url ? (
                          <img src={trainer.avatar_url} alt={trainer.name} className="h-full w-full object-cover" />
                        ) : (
                          trainer.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{trainer.name}</h3>
                        <span className="text-sm capitalize text-muted-foreground">
                          {trainer.type} Trainer
                        </span>
                      </div>
                    </div>
                    <ActionMenu
                      onEdit={() => toast.info(`Edit ${trainer.name}`)}
                      onDelete={() => {
                        if (trainers.length > 0) {
                          deleteTrainer.mutate(trainer.id);
                        } else {
                          toast.info('Cannot delete mock data');
                        }
                      }}
                    />
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {trainer.email}
                    </div>
                    {trainer.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {trainer.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      {trainer.skill}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                    <span className={`badge-status ${trainer.is_internal ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                      {trainer.is_internal ? 'Internal' : 'External'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(trainer as any).cohort_name || 'Assigned'}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredTrainers.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No trainers found</h3>
              <p className="mt-2 text-muted-foreground">Add trainers to your cohorts</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredMentors.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GlassCard variant="hover" glow="violet" className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-secondary/30 to-neon-purple/30 text-xl font-bold text-secondary">
                        {mentor.avatar_url ? (
                          <img src={mentor.avatar_url} alt={mentor.name} className="h-full w-full object-cover" />
                        ) : (
                          mentor.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{mentor.name}</h3>
                        <span className="text-sm capitalize text-muted-foreground">
                          {mentor.type === 'buddy' ? 'Buddy Mentor' : 'Mentor'}
                        </span>
                      </div>
                    </div>
                    <ActionMenu
                      onEdit={() => toast.info(`Edit ${mentor.name}`)}
                      onDelete={() => {
                        if (mentors.length > 0) {
                          deleteMentor.mutate(mentor.id);
                        } else {
                          toast.info('Cannot delete mock data');
                        }
                      }}
                    />
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {mentor.email}
                    </div>
                    {mentor.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {mentor.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      {mentor.skill}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                    <span className="badge-status badge-active">Active</span>
                    <span className="text-xs text-muted-foreground">
                      {(mentor as any).cohort_name || 'Assigned'}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredMentors.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No mentors found</h3>
              <p className="mt-2 text-muted-foreground">Add mentors to your cohorts</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddTrainerModal
        isOpen={showAddTrainer}
        onClose={() => setShowAddTrainer(false)}
        onSubmit={handleAddTrainer}
        cohortId={selectedCohort !== 'all' ? selectedCohort : ''}
        isLoading={createTrainer.isPending}
      />
      <AddMentorModal
        isOpen={showAddMentor}
        onClose={() => setShowAddMentor(false)}
        onSubmit={handleAddMentor}
        cohortId={selectedCohort !== 'all' ? selectedCohort : ''}
        isLoading={createMentor.isPending}
      />
    </div>
  );
};
