import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Upload,
  Plus,
  Download,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';

interface Candidate {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  skill: string;
  location: string;
  cohort: string;
  status: 'active' | 'inactive' | 'completed';
  joinDate: string;
}

const mockCandidates: Candidate[] = [
  { id: '1', candidateId: 'GC-2024-001', name: 'Rahul Sharma', email: 'rahul.s@company.com', skill: 'React/Node.js', location: 'Bangalore', cohort: 'GenC Batch Alpha', status: 'active', joinDate: '2024-01-15' },
  { id: '2', candidateId: 'GC-2024-002', name: 'Priya Patel', email: 'priya.p@company.com', skill: 'React/Node.js', location: 'Bangalore', cohort: 'GenC Batch Alpha', status: 'active', joinDate: '2024-01-15' },
  { id: '3', candidateId: 'GC-2024-003', name: 'Arjun Kumar', email: 'arjun.k@company.com', skill: 'AWS/Azure', location: 'Chennai', cohort: 'GenC Batch Beta', status: 'active', joinDate: '2024-02-01' },
  { id: '4', candidateId: 'GC-2024-004', name: 'Sneha Reddy', email: 'sneha.r@company.com', skill: 'Machine Learning', location: 'Hyderabad', cohort: 'GenC Batch Gamma', status: 'inactive', joinDate: '2024-03-01' },
  { id: '5', candidateId: 'GC-2023-015', name: 'Vikram Singh', email: 'vikram.s@company.com', skill: 'Test Automation', location: 'Pune', cohort: 'GenC Batch Omega', status: 'completed', joinDate: '2023-10-01' },
];

const statusConfig = {
  active: { label: 'Active', class: 'badge-active' },
  inactive: { label: 'Inactive', class: 'badge-inactive' },
  completed: { label: 'Completed', class: 'bg-info/20 text-info' },
};

export const Candidates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [candidates] = useState<Candidate[]>(mockCandidates);
  const [isDragOver, setIsDragOver] = useState(false);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.candidateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
          <p className="mt-2 text-muted-foreground">
            Manage GenC candidates across your cohorts
          </p>
        </div>
        <div className="flex gap-3">
          <GradientButton variant="outline" icon={<Download className="h-4 w-4" />}>
            Export
          </GradientButton>
          <GradientButton variant="primary" icon={<Plus className="h-4 w-4" />}>
            Add Candidate
          </GradientButton>
        </div>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard
          variant={isDragOver ? 'elevated' : 'default'}
          className={`border-2 border-dashed p-8 text-center transition-all ${
            isDragOver ? 'border-primary bg-primary/5' : 'border-border/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            // Handle file drop
          }}
        >
          <Upload className={`mx-auto h-10 w-10 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Drag & Drop to Upload
          </h3>
          <p className="mt-2 text-muted-foreground">
            Upload CSV or Excel file with candidate data
          </p>
          <GradientButton variant="outline" size="sm" className="mt-4">
            Browse Files
          </GradientButton>
        </GlassCard>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-4 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="input-premium w-full pl-12"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-premium appearance-none pr-10"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </motion.div>

      {/* Candidates Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate ID</th>
                  <th>Name</th>
                  <th>Skill</th>
                  <th>Location</th>
                  <th>Cohort</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate, index) => (
                  <motion.tr
                    key={candidate.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="group"
                  >
                    <td className="font-mono text-sm">{candidate.candidateId}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-neon-blue/20 text-sm font-semibold text-primary">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{candidate.skill}</td>
                    <td>{candidate.location}</td>
                    <td>
                      <span className="text-sm text-muted-foreground">{candidate.cohort}</span>
                    </td>
                    <td>
                      <span className={`badge-status ${statusConfig[candidate.status].class}`}>
                        {statusConfig[candidate.status].label}
                      </span>
                    </td>
                    <td className="text-muted-foreground">
                      {new Date(candidate.joinDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCandidates.length === 0 && (
            <div className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No candidates found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};
