import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface StakeholderCardProps {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  skill: string;
  type: string;
  avatarUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  variant: 'trainer' | 'mentor';
  isInternal?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  index?: number;
}

export const StakeholderCard = ({
  id,
  name,
  email,
  phone,
  skill,
  type,
  avatarUrl,
  startDate,
  endDate,
  status,
  variant,
  isInternal,
  onEdit,
  onDelete,
  index = 0,
}: StakeholderCardProps) => {
  const getTypeLabel = () => {
    if (variant === 'trainer') {
      return type === 'technical' ? 'Technical Trainer' : 'Behavioral Trainer';
    }
    return type === 'mentor' ? 'Mentor' : 'Buddy Mentor';
  };

  const getTypeColor = () => {
    if (variant === 'trainer') {
      return type === 'technical' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary';
    }
    return type === 'mentor' ? 'bg-neon-blue/10 text-neon-blue' : 'bg-neon-purple/10 text-neon-purple';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard variant="hover" glow={variant === 'trainer' ? 'cyan' : 'violet'} className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={avatarUrl || undefined} alt={name} />
              <AvatarFallback className="bg-muted text-foreground font-medium">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{skill}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem onClick={() => onEdit?.(id)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(id)} 
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor()}`}>
            {getTypeLabel()}
          </span>
          {variant === 'trainer' && isInternal !== undefined && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isInternal ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
            }`}>
              {isInternal ? 'Internal' : 'External'}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
          }`}>
            {status}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{email}</span>
          </div>
          {phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{phone}</span>
            </div>
          )}
          {startDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {format(new Date(startDate), 'MMM d, yyyy')}
                {endDate && ` - ${format(new Date(endDate), 'MMM d, yyyy')}`}
              </span>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};
