import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, User, Mail, Phone, Briefcase, Building, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useCreateMentor, uploadMentorAvatar, MentorInsert } from '@/hooks/useMentors';

interface AddMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohortId: string;
}

export const AddMentorModal = ({ isOpen, onClose, cohortId }: AddMentorModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emp_id: '',
    skill: '',
    type: 'mentor' as 'mentor' | 'buddy',
    assignment_start_date: '',
    assignment_end_date: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const createMentor = useCreateMentor();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const mentorData: MentorInsert = {
        cohort_id: cohortId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        emp_id: formData.emp_id,
        skill: formData.skill,
        type: formData.type,
        assignment_start_date: formData.assignment_start_date || null,
        assignment_end_date: formData.assignment_end_date || null,
      };

      const newMentor = await createMentor.mutateAsync(mentorData);

      // Upload avatar if provided
      if (avatarFile && newMentor.id) {
        const avatarUrl = await uploadMentorAvatar(avatarFile, newMentor.id);
        // Update mentor with avatar URL would be handled by useUpdateMentor
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating mentor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      emp_id: '',
      skill: '',
      type: 'mentor',
      assignment_start_date: '',
      assignment_end_date: '',
    });
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <GlassCard variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Add Mentor</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex justify-center mb-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer group"
                >
                  <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-premium w-full pl-10"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Employee ID *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.emp_id}
                      onChange={(e) => setFormData({ ...formData, emp_id: e.target.value })}
                      className="input-premium w-full pl-10"
                      placeholder="EMP001"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-premium w-full pl-10"
                      placeholder="mentor@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-premium w-full pl-10"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Expertise *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.skill}
                      onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                      className="input-premium w-full pl-10"
                      placeholder="Architecture, DevOps"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Mentor Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'mentor' | 'buddy' })}
                    className="input-premium w-full"
                    required
                  >
                    <option value="mentor">Mentor</option>
                    <option value="buddy">Buddy Mentor</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Assignment Start</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={formData.assignment_start_date}
                      onChange={(e) => setFormData({ ...formData, assignment_start_date: e.target.value })}
                      className="input-premium w-full pl-10"
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Assignment End</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={formData.assignment_end_date}
                      onChange={(e) => setFormData({ ...formData, assignment_end_date: e.target.value })}
                      className="input-premium w-full pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <GradientButton
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </GradientButton>
                <GradientButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Adding...' : 'Add Mentor'}
                </GradientButton>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
