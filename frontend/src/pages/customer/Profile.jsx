import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCurrentUser, updateCurrentUser } from '@/features/auth/authSlice';
import { userApi } from '@/api/userApi';
import { useToast, errorMessage } from '@/hooks/useToast';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AddressForm from '@/components/common/AddressForm';
import PageTransition from '@/components/common/PageTransition';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  phone: z.string().trim().optional(),
});

export default function Profile() {
  const dispatch = useAppDispatch();
  const notify = useToast();
  const user = useAppSelector(selectCurrentUser);

  const [savingProfile, setSavingProfile] = useState(false);
  const [addressModal, setAddressModal] = useState(null); // { mode: 'add'|'edit', address? }
  const [savingAddress, setSavingAddress] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name, phone: user?.phone } });

  const onSubmitProfile = async (values) => {
    setSavingProfile(true);
    try {
      const updated = await userApi.updateUser(user._id, values);
      dispatch(updateCurrentUser(updated));
      notify('Profile updated', 'success');
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (values) => {
    setSavingAddress(true);
    try {
      const updated =
        addressModal.mode === 'edit'
          ? await userApi.updateAddress(addressModal.address._id, values)
          : await userApi.addAddress(values);
      dispatch(updateCurrentUser(updated));
      notify(addressModal.mode === 'edit' ? 'Address updated' : 'Address added', 'success');
      setAddressModal(null);
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleAvatarChange = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const updated = await userApi.uploadAvatar(formData);
      dispatch(updateCurrentUser(updated));
      notify('Profile photo updated', 'success');
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleDeleteAddress = async () => {
    setDeleting(true);
    try {
      const updated = await userApi.removeAddress(deleteTarget._id);
      dispatch(updateCurrentUser(updated));
      notify('Address removed', 'success');
      setDeleteTarget(null);
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageTransition className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">My Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar name={user?.name} src={user?.avatarUrl} size="lg" />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-500 text-white shadow-soft hover:bg-brand-600 disabled:opacity-60"
            >
              <Icon name={uploadingAvatar ? 'spinner' : 'edit'} className={`h-3.5 w-3.5 ${uploadingAvatar ? 'animate-spin' : ''}`} />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleAvatarChange(e.target.files[0])}
            />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-ink-900">{user?.name}</p>
            <p className="text-sm text-ink-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitProfile)} className="mt-6 space-y-4">
          <Input label="Full name" error={errors.name?.message} {...register('name')} />
          <Input label="Phone number" error={errors.phone?.message} {...register('phone')} />
          <Button type="submit" size="sm" loading={savingProfile}>
            Save changes
          </Button>
        </form>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-ink-900">Saved addresses</h2>
          <button
            onClick={() => setAddressModal({ mode: 'add' })}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add new
          </button>
        </div>

        {!user?.addresses?.length ? (
          <p className="mt-4 text-sm text-ink-500">No saved addresses yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {user.addresses.map((address) => (
              <div key={address._id} className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-3.5">
                <div>
                  <p className="text-sm font-semibold text-ink-800">{address.label || 'Address'}</p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {address.line1}, {address.line2 ? `${address.line2}, ` : ''}
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => setAddressModal({ mode: 'edit', address })}
                    aria-label={`Edit ${address.label || 'address'}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700"
                  >
                    <Icon name="edit" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(address)}
                    aria-label={`Delete ${address.label || 'address'}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-danger-50 hover:text-danger-500"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={Boolean(addressModal)}
        onClose={() => setAddressModal(null)}
        title={addressModal?.mode === 'edit' ? 'Edit address' : 'Add address'}
      >
        {addressModal && (
          <AddressForm
            defaultValues={addressModal.address}
            onSubmit={handleSaveAddress}
            submitting={savingAddress}
            submitLabel={addressModal.mode === 'edit' ? 'Update address' : 'Add address'}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteAddress}
        loading={deleting}
        title="Remove address"
        description="Are you sure you want to remove this saved address?"
        confirmLabel="Remove"
      />
    </PageTransition>
  );
}
