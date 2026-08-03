import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Logo from '@/components/layout/Logo';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { login, selectAuthStatus, selectCurrentUser } from '@/features/auth/authSlice';
import { useToast } from '@/hooks/useToast';
import { ROLE_HOME_PATH } from '@/utils/constants';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useToast();
  const user = useAppSelector(selectCurrentUser);
  const status = useAppSelector(selectAuthStatus);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;
      navigate(from || ROLE_HOME_PATH[user.role], { replace: true });
    }
  }, [user, navigate, location.state]);

  const onSubmit = async (values) => {
    const result = await dispatch(login(values));
    if (login.rejected.match(result)) {
      notify(result.payload || 'Unable to log in', 'error');
    } else {
      notify('Welcome back!', 'success');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-3xl border border-ink-100 bg-white p-8 shadow-card"
      >
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center font-display text-2xl font-bold text-ink-900">Welcome back</h1>
        <p className="mt-1.5 text-center text-sm text-ink-500">Log in to order from your favorite restaurants</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          <Input
            label="Email address"
            type="email"
            icon="mail"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            icon="lock"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" className="w-full" loading={status === 'loading'}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
