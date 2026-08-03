import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { restaurantApi } from '@/api/restaurantApi';
import { useOwnerRestaurant } from '@/hooks/useOwnerRestaurant';
import { useToast, errorMessage } from '@/hooks/useToast';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { resolveAssetUrl } from '@/utils/format';
import { ASSET_BASE_URL } from '@/utils/constants';

const schema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(150),
  description: z.string().trim().max(1000).optional(),
  cuisine: z.string().trim().optional(),
  line1: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
  country: z.string().trim().min(1).default('India'),
  lng: z.coerce.number(),
  lat: z.coerce.number(),
  minOrderAmount: z.coerce.number().min(0).default(0),
  avgPreparationTimeMinutes: z.coerce.number().positive().default(30),
});

export default function ManageRestaurant() {
  const { restaurant, loading, refetch } = useOwnerRestaurant();
  const notify = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { country: 'India', minOrderAmount: 0, avgPreparationTimeMinutes: 30 },
  });

  useEffect(() => {
    if (restaurant) {
      reset({
        name: restaurant.name,
        description: restaurant.description,
        cuisine: restaurant.cuisine?.join(', '),
        line1: restaurant.address?.line1,
        city: restaurant.address?.city,
        state: restaurant.address?.state,
        postalCode: restaurant.address?.postalCode,
        country: restaurant.address?.country,
        lng: restaurant.location?.coordinates?.[0],
        lat: restaurant.location?.coordinates?.[1],
        minOrderAmount: restaurant.minOrderAmount,
        avgPreparationTimeMinutes: restaurant.avgPreparationTimeMinutes,
      });
    }
  }, [restaurant, reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    const payload = {
      name: values.name,
      description: values.description,
      cuisine: values.cuisine ? values.cuisine.split(',').map((c) => c.trim()).filter(Boolean) : [],
      address: {
        line1: values.line1,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country || 'India',
      },
      location: { coordinates: [values.lng, values.lat] },
      minOrderAmount: values.minOrderAmount,
      avgPreparationTimeMinutes: values.avgPreparationTimeMinutes,
    };

    try {
      if (restaurant) {
        await restaurantApi.update(restaurant._id, payload);
        notify('Restaurant updated', 'success');
      } else {
        await restaurantApi.create(payload);
        notify('Restaurant created — awaiting admin approval', 'success');
      }
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOpen = async () => {
    try {
      await restaurantApi.update(restaurant._id, { isOpen: !restaurant.isOpen });
      notify(restaurant.isOpen ? 'Restaurant marked closed' : 'Restaurant marked open', 'success');
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    }
  };

  const handleUpload = async (field, file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append(field, file);
    try {
      await restaurantApi.uploadImages(restaurant._id, formData);
      notify('Image updated', 'success');
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <PageTransition className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Manage Restaurant</h1>
          <p className="mt-1 text-sm text-ink-500">
            {restaurant ? 'Update your restaurant profile and photos.' : 'Set up your restaurant to start receiving orders.'}
          </p>
        </div>
        {restaurant && (
          <div className="flex items-center gap-2">
            <Badge variant={restaurant.isApproved ? 'success' : 'warning'}>
              {restaurant.isApproved ? 'Approved' : 'Pending approval'}
            </Badge>
            <button
              onClick={handleToggleOpen}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                restaurant.isOpen ? 'bg-success-50 text-success-700' : 'bg-ink-100 text-ink-600'
              }`}
            >
              {restaurant.isOpen ? 'Open now' : 'Closed'}
            </button>
          </div>
        )}
      </div>

      {restaurant && (
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-40 w-full bg-ink-100">
            {resolveAssetUrl(restaurant.coverImageUrl, ASSET_BASE_URL) && (
              <img src={resolveAssetUrl(restaurant.coverImageUrl, ASSET_BASE_URL)} alt="Cover" className="h-full w-full object-cover" />
            )}
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-soft"
            >
              <Icon name="upload" className="h-3.5 w-3.5" />
              Change cover
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={(e) => handleUpload('cover', e.target.files[0])} />
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-ink-100 shadow-soft">
              {resolveAssetUrl(restaurant.logoUrl, ASSET_BASE_URL) ? (
                <img src={resolveAssetUrl(restaurant.logoUrl, ASSET_BASE_URL)} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-300">
                  <Icon name="store" className="h-8 w-8" />
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} loading={uploading}>
              Change logo
            </Button>
            <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={(e) => handleUpload('logo', e.target.files[0])} />
          </div>
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Restaurant name" error={errors.name?.message} {...register('name')} />
          <TextArea label="Description" error={errors.description?.message} {...register('description')} />
          <Input label="Cuisines (comma separated)" placeholder="Italian, Pizza, Pasta" {...register('cuisine')} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Address line 1" error={errors.line1?.message} {...register('line1')} containerClassName="col-span-2" />
            <Input label="City" error={errors.city?.message} {...register('city')} />
            <Input label="State" error={errors.state?.message} {...register('state')} />
            <Input label="Postal code" error={errors.postalCode?.message} {...register('postalCode')} />
            <Input label="Country" {...register('country')} />
            <Input label="Longitude" type="number" step="any" error={errors.lng?.message} {...register('lng')} />
            <Input label="Latitude" type="number" step="any" error={errors.lat?.message} {...register('lat')} />
            <Input label="Minimum order amount (₹)" type="number" {...register('minOrderAmount')} />
            <Input label="Avg. preparation time (min)" type="number" {...register('avgPreparationTimeMinutes')} />
          </div>

          <Button type="submit" loading={saving}>
            {restaurant ? 'Save changes' : 'Create restaurant'}
          </Button>
        </form>
      </Card>
    </PageTransition>
  );
}
