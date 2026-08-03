import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Logo from '@/components/layout/Logo';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { register as registerUser, selectAuthStatus, selectCurrentUser } from '@/features/auth/authSlice';
import { useToast } from '@/hooks/useToast';
import { ROLE_HOME_PATH, ROLES } from '@/utils/constants';

const schema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(100),
    email: z.string().trim().email('Enter a valid email address'),
    phone: z.string().trim().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum([ROLES.CUSTOMER, ROLES.RESTAURANT_OWNER, ROLES.DELIVERY_PARTNER]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ROLE_OPTIONS = [
  { value: ROLES.CUSTOMER, label: 'Customer — order food' },
  { value: ROLES.RESTAURANT_OWNER, label: 'Restaurant Owner — manage a restaurant' },
  { value: ROLES.DELIVERY_PARTNER, label: 'Delivery Partner — deliver orders' },
];

export default function Signup() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notify = useToast();
  const user = useAppSelector(selectCurrentUser);
  const status = useAppSelector(selectAuthStatus);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { role: ROLES.CUSTOMER } });

  useEffect(() => {
    if (user) navigate(ROLE_HOME_PATH[user.role], { replace: true });
  }, [user, navigate]);

  const onSubmit = async ({ confirmPassword, ...values }) => {
    const result = await dispatch(registerUser(values));
    if (registerUser.rejected.match(result)) {
      notify(result.payload || 'Unable to create account', 'error');
    } else {
      notify('Account created — welcome to FeastFlow!', 'success');
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
        <h1 className="mt-6 text-center font-display text-2xl font-bold text-ink-900">Create your account</h1>
        <p className="mt-1.5 text-center text-sm text-ink-500">Join FeastFlow in under a minute</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          <Input label="Full name" icon="user" placeholder="Jane Doe" error={errors.name?.message} {...register('name')} />
          <Input
            label="Email address"
            type="email"
            icon="mail"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input label="Phone (optional)" icon="phone" placeholder="9876543210" error={errors.phone?.message} {...register('phone')} />
          <Select label="I am a..." options={ROLE_OPTIONS} error={errors.role?.message} {...register('role')} />
          <Input
            label="Password"
            type="password"
            icon="lock"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            icon="lock"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full" loading={status === 'loading'}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
