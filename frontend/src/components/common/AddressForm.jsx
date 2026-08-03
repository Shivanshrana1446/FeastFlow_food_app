import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export const addressSchema = z.object({
  label: z.string().trim().optional(),
  line1: z.string().trim().min(1, 'Address is required'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
  country: z.string().trim().min(1).default('India'),
});

export default function AddressForm({ defaultValues, onSubmit, submitLabel = 'Save address', submitting, className = '' }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addressSchema), defaultValues: { country: 'India', ...defaultValues } });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Label" placeholder="Home" {...register('label')} containerClassName="col-span-2 sm:col-span-1" />
        <Input
          label="Address line 1"
          placeholder="123 Main St"
          error={errors.line1?.message}
          {...register('line1')}
          containerClassName="col-span-2"
        />
        <Input label="Address line 2 (optional)" {...register('line2')} containerClassName="col-span-2" />
        <Input label="City" error={errors.city?.message} {...register('city')} />
        <Input label="State" error={errors.state?.message} {...register('state')} />
        <Input label="Postal code" error={errors.postalCode?.message} {...register('postalCode')} />
        <Input label="Country" {...register('country')} />
      </div>
      <Button type="submit" size="sm" loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
