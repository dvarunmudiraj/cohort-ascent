import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Shield,
  Edit2,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { AddUserModal } from '@/components/modals/AddUserModal';
import { toast } from 'sonner';

// Mock coach data - in real app this would come from profiles table + user_roles
const mockCoaches = [
  { id: 'c1', name: 'Sarah Coach', email: 'sarah@cognizant.com', phone: '+91 98765 43210', location: 'Bangalore', assignedCohorts: 3, status: 'active' },
  { id: 'c2', name: 'Michael Chen', email: 'michael.chen@cognizant.com', phone: '+91 98765 43211', location: 'Chennai', assignedCohorts: 2, status: 'active' },
  { id: 'c3', name: 'Priya Sharma', email: 'priya.sharma@cognizant.com', phone: '+91 98765 43212', location: 'Hyderabad', assignedCohorts: 1, status: 'active' },
  { id: 'c4', name: 'Rahul Verma', email: 'rahul.verma@cognizant.com', phone: '+91 98765 43213', location: 'Pune', assignedCohorts: 0, status: 'inactive' },
];

const mockAdmins = [
  { id: 'a1', name: 'John Administrator', email: 'admin@cognizant.com', phone: '+91 98765 43200', location: 'Bangalore', status: 'active' },
];

export const Coaches = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'coaches' | 'admins'>('coaches');
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserType, setAddUserType] = useState<'coach' | 'admin'>('coach');

  const filteredCoaches = mockCoaches.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdmins = mockAdmins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (data: any) => {
    toast.success(`${addUserType === 'coach' ? 'Coach' : 'Admin'} added successfully`);
    setShowAddUser(false);
  };

  const handleEdit = (user: any) => {
    toast.info(`Edit ${user.name}`);
  };

  const handleDelete = (user: any) => {
    if (confirm(`Are you sure you want to remove ${user.name}?`)) {
      toast.success(`${user.name} removed`);
    }
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
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage coaches and administrators
          </p>
        </div>
        <div className="flex gap-3">
          <GradientButton
            variant="outline"
            icon={<Shield className="h-4 w-4" />}
            onClick={() => {
              setAddUserType('admin');
              setShowAddUser(true);
            }}
          >
            Add Admin
          </GradientButton>
          <GradientButton
            variant="primary"
            icon={<UserPlus className="h-4 w-4" />}
            onClick={() => {
              setAddUserType('coach');
              setShowAddUser(true);
            }}
          >
            Add Coach
          </GradientButton>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4"
      >
        <button
          onClick={() => setActiveTab('coaches')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'coaches'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Coaches ({mockCoaches.length})
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'admins'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Administrators ({mockAdmins.length})
        </button>
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
            placeholder="Search by name, email, or location..."
            className="input-premium w-full pl-12"
          />
        </div>
      </motion.div>

      {/* Content */}
      {activeTab === 'coaches' ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCoaches.map((coach, index) => (
              <motion.div
                key={coach.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GlassCard variant="hover" glow="cyan" className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-neon-blue/30 text-xl font-bold text-primary">
                        {coach.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{coach.name}</h3>
                        <span className={`badge-status ${coach.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                          {coach.status}
                        </span>
                      </div>
                    </div>
                    <ActionMenu
                      onEdit={() => handleEdit(coach)}
                      onDelete={() => handleDelete(coach)}
                    />
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {coach.email}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {coach.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {coach.location}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                    <span className="text-sm text-muted-foreground">Assigned Cohorts</span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {coach.assignedCohorts}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredAdmins.map((admin, index) => (
              <motion.div
                key={admin.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GlassCard variant="hover" glow="violet" className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary/30 to-neon-purple/30 text-xl font-bold text-secondary">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{admin.name}</h3>
                        <div className="mt-1 flex items-center gap-1">
                          <Shield className="h-3 w-3 text-secondary" />
                          <span className="text-xs font-medium text-secondary">Administrator</span>
                        </div>
                      </div>
                    </div>
                    <ActionMenu
                      onEdit={() => handleEdit(admin)}
                      onDelete={() => handleDelete(admin)}
                    />
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {admin.email}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {admin.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {admin.location}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSubmit={handleAddUser}
        userType={addUserType}
      />
    </div>
  );
};
