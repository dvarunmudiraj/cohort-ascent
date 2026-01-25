import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { GradientButton } from '@/components/ui/GradientButton';

const cohortSchema = z.object({
  code: z.string().min(1, 'Cohort code is required'),
  name: z.string().min(2, 'Name is required'),
  bu: z.string().min(1, 'Business unit is required'),
  skill: z.string().min(1, 'Skill is required'),
  location: z.string().min(1, 'Location is required'),
  coach_id: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
});

type CohortFormData = z.infer<typeof cohortSchema>;

interface Coach {
  id: string;
  name: string;
}

interface AddCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CohortFormData) => void;
  coaches: Coach[];
  isLoading?: boolean;
}

export const AddCohortModal = ({
  isOpen,
  onClose,
  onSubmit,
  coaches,
  isLoading,
}: AddCohortModalProps) => {
  const form = useForm<CohortFormData>({
    resolver: zodResolver(cohortSchema),
    defaultValues: {
      code: '',
      name: '',
      bu: '',
      skill: '',
      location: '',
      coach_id: '',
      start_date: '',
      end_date: '',
    },
  });

  const handleSubmit = (data: CohortFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl border-border/50 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Cohort</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cohort Code</FormLabel>
                    <FormControl>
                      <Input placeholder="GC-2024-BLR-01" className="input-premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cohort Name</FormLabel>
                    <FormControl>
                      <Input placeholder="GenC Batch Alpha" className="input-premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Unit</FormLabel>
                    <FormControl>
                      <select {...field} className="input-premium w-full">
                        <option value="">Select BU...</option>
                        <option value="Digital Engineering">Digital Engineering</option>
                        <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                        <option value="Data & AI">Data & AI</option>
                        <option value="Enterprise Applications">Enterprise Applications</option>
                        <option value="Quality Engineering">Quality Engineering</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill / Technology</FormLabel>
                    <FormControl>
                      <Input placeholder="React, Node.js, AWS" className="input-premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Location</FormLabel>
                    <FormControl>
                      <select {...field} className="input-premium w-full">
                        <option value="">Select location...</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coach_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Coach</FormLabel>
                    <FormControl>
                      <select {...field} className="input-premium w-full">
                        <option value="">Select coach...</option>
                        {coaches.map((coach) => (
                          <option key={coach.id} value={coach.id}>
                            {coach.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="input-premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" className="input-premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <GradientButton type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </GradientButton>
              <GradientButton type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Cohort'}
              </GradientButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
