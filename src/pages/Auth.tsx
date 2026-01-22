import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  User,
  Eye,
  EyeOff,
} from 'lucide-react';
import { FloatingOrbs } from '@/components/ui/FloatingOrbs';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthContext } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated } = useAuthContext();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError.message === 'Invalid login credentials' 
        ? 'Invalid email or password. Please try again.' 
        : authError.message);
      setIsLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      signupSchema.parse({ fullName, email, password, confirmPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    const { error: authError } = await signUp(email, password, fullName);

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(authError.message);
      }
      setIsLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <FloatingOrbs variant="landing" />

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate('/')}
        className="absolute left-6 top-6 z-10 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4 rotate-180" />
        Back to Home
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-neon-blue shadow-lg shadow-primary/30">
            <GraduationCap className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isLogin ? 'Sign in to your account to continue' : 'Join the Academy Management Platform'}
          </p>
        </div>

        <div className="mb-6 flex rounded-lg bg-muted/30 p-1">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              isLogin ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              !isLogin ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign Up
          </button>
        </div>

        <GlassCard variant="elevated" className="p-8">
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="fullName"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="input-premium w-full pl-12"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-premium w-full pl-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-premium w-full pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="confirmPassword"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="input-premium w-full pl-12"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <GradientButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
              icon={isLoading ? undefined : <ArrowRight className="h-5 w-5" />}
              iconPosition="right"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block h-5 w-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                  />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </GradientButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-primary hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </GlassCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <Shield className="h-4 w-4 text-success" />
          Enterprise-grade security with role-based access
        </motion.div>
      </motion.div>
    </div>
  );
};
