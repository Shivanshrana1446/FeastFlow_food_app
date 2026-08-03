import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { restaurantApi } from '@/api/restaurantApi';
import { menuApi } from '@/api/menuApi';
import { useFetch } from '@/hooks/useFetch';
import { useOwnerRestaurant } from '@/hooks/useOwnerRestaurant';
import { useToast, errorMessage } from '@/hooks/useToast';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import VegDot from '@/components/restaurant/VegDot';
import EmptyState from '@/components/ui/EmptyState';
import { CardSkeletonGrid } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency, resolveAssetUrl } from '@/utils/format';
import { ASSET_BASE_URL } from '@/utils/constants';

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100),
});

const addOnRowSchema = z.object({
  name: z.string().trim().min(1),
  price: z.coerce.number().min(0),
});

const menuItemSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  description: z.string().trim().max(1000).optional(),
  category: z.string().min(1, 'Choose a category'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  isVeg: z.boolean(),
  isAvailable: z.boolean(),
  addOns: z.array(addOnRowSchema).optional(),
});

function CategoryModal({ isOpen, onClose, onSaved, restaurantId, category }) {
  const notify = useToast();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(categorySchema), defaultValues: { name: category?.name || '' } });

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (category) {
        await restaurantApi.updateCategory(category._id, values);
      } else {
        await restaurantApi.createCategory({ restaurant: restaurantId, ...values });
      }
      notify(category ? 'Category updated' : 'Category added', 'success');
      onSaved();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Edit category' : 'Add category'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Category name" placeholder="Starters" error={errors.name?.message} {...register('name')} />
        <Button type="submit" size="sm" loading={saving}>
          Save
        </Button>
      </form>
    </Modal>
  );
}

function MenuItemModal({ isOpen, onClose, onSaved, restaurantId, categories, item }) {
  const notify = useToast();
  const [saving, setSaving] = useState(false);
  const [addOns, setAddOns] = useState(item?.addOns || []);
  const [addOnName, setAddOnName] = useState('');
  const [addOnPrice, setAddOnPrice] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      category: item?.category || categories[0]?._id || '',
      price: item?.price ?? '',
      isVeg: item?.isVeg ?? true,
      isAvailable: item?.isAvailable ?? true,
    },
  });

  const addAddOn = () => {
    if (!addOnName || !addOnPrice) return;
    setAddOns((prev) => [...prev, { name: addOnName, price: Number(addOnPrice) }]);
    setAddOnName('');
    setAddOnPrice('');
  };

  const removeAddOn = (name) => setAddOns((prev) => prev.filter((a) => a.name !== name));

  const onSubmit = async (values) => {
    setSaving(true);
    const payload = { ...values, addOns };
    try {
      if (item) {
        await menuApi.update(item._id, payload);
      } else {
        await menuApi.create({ restaurant: restaurantId, ...payload });
      }
      notify(item ? 'Menu item updated' : 'Menu item added', 'success');
      onSaved();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit menu item' : 'Add menu item'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Item name" error={errors.name?.message} {...register('name')} />
        <TextArea label="Description" error={errors.description?.message} {...register('description')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
            error={errors.category?.message}
            {...register('category')}
          />
          <Input label="Price (₹)" type="number" step="any" error={errors.price?.message} {...register('price')} />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" className="h-4 w-4 accent-brand-500" {...register('isVeg')} />
            Vegetarian
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" className="h-4 w-4 accent-brand-500" {...register('isAvailable')} />
            Available
          </label>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">Add-ons</p>
          {addOns.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {addOns.map((a) => (
                <Badge key={a.name} variant="neutral" className="gap-2">
                  {a.name} · {formatCurrency(a.price)}
                  <button type="button" onClick={() => removeAddOn(a.name)}>
                    <Icon name="close" className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={addOnName}
              onChange={(e) => setAddOnName(e.target.value)}
              placeholder="Add-on name"
              className="h-10 flex-1 rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-brand-500"
            />
            <input
              value={addOnPrice}
              onChange={(e) => setAddOnPrice(e.target.value)}
              type="number"
              placeholder="Price"
              className="h-10 w-24 rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-brand-500"
            />
            <Button type="button" variant="outline" size="sm" onClick={addAddOn}>
              Add
            </Button>
          </div>
        </div>

        <Button type="submit" loading={saving}>
          Save item
        </Button>
      </form>
    </Modal>
  );
}

export default function ManageMenu() {
  const { restaurant, loading: loadingRestaurant } = useOwnerRestaurant();
  const notify = useToast();

  const {
    data: categories,
    loading: loadingCategories,
    refetch: refetchCategories,
  } = useFetch(() => (restaurant ? restaurantApi.listCategories(restaurant._id) : Promise.resolve([])), [restaurant?._id]);

  const {
    data: items,
    loading: loadingItems,
    refetch: refetchItems,
  } = useFetch(() => (restaurant ? menuApi.list({ restaurant: restaurant._id, limit: 100 }) : Promise.resolve({ data: [], meta: null })), [
    restaurant?._id,
  ]);

  const [categoryModal, setCategoryModal] = useState(null);
  const [itemModal, setItemModal] = useState(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const imageInputRef = useRef(null);
  const [uploadingItemId, setUploadingItemId] = useState(null);

  // Declared before the early returns below so it always runs — conditionally
  // skipping a hook call between renders would violate the Rules of Hooks.
  const itemsByCategory = useMemo(
    () =>
      (items || []).reduce((acc, item) => {
        (acc[item.category] = acc[item.category] || []).push(item);
        return acc;
      }, {}),
    [items]
  );

  const refetchAll = () => {
    refetchCategories();
    refetchItems();
  };

  const handleDeleteCategory = async () => {
    setDeleting(true);
    try {
      await restaurantApi.deleteCategory(deleteCategoryTarget._id);
      notify('Category deleted', 'success');
      setDeleteCategoryTarget(null);
      refetchAll();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteItem = async () => {
    setDeleting(true);
    try {
      await menuApi.remove(deleteItemTarget._id);
      notify('Menu item deleted', 'success');
      setDeleteItemTarget(null);
      refetchAll();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadImage = async (itemId, file) => {
    if (!file) return;
    setUploadingItemId(itemId);
    const formData = new FormData();
    formData.append('image', file);
    try {
      await menuApi.uploadImage(itemId, formData);
      notify('Image updated', 'success');
      refetchItems();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setUploadingItemId(null);
    }
  };

  if (loadingRestaurant) return <CardSkeletonGrid count={4} />;

  if (!restaurant) {
    return (
      <EmptyState
        icon="utensils"
        title="Create your restaurant first"
        description="You need a restaurant profile before you can add a menu."
        actionLabel="Manage restaurant"
        actionTo="/owner/restaurant"
      />
    );
  }

  return (
    <PageTransition>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Manage Menu</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCategoryModal({})}>
            <Icon name="plus" className="h-4 w-4" />
            Add category
          </Button>
          <Button
            size="sm"
            onClick={() => setItemModal({})}
            disabled={!categories?.length}
          >
            <Icon name="plus" className="h-4 w-4" />
            Add item
          </Button>
        </div>
      </div>

      {loadingCategories || loadingItems ? (
        <CardSkeletonGrid count={4} />
      ) : !categories?.length ? (
        <EmptyState icon="list" title="No categories yet" description="Start by adding a category like 'Starters' or 'Mains'." actionLabel="Add category" onAction={() => setCategoryModal({})} />
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category._id}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink-900">{category.name}</h2>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCategoryModal({ category })}
                    aria-label={`Edit ${category.name} category`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700"
                  >
                    <Icon name="edit" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCategoryTarget(category)}
                    aria-label={`Delete ${category.name} category`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-danger-50 hover:text-danger-500"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!itemsByCategory[category._id]?.length ? (
                <p className="text-sm text-ink-500">No items in this category yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {itemsByCategory[category._id].map((item) => {
                    const itemImage = resolveAssetUrl(item.imageUrl, ASSET_BASE_URL);
                    return (
                    <Card key={item._id} className="flex items-center gap-3 p-3.5">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                        {itemImage ? (
                          <img src={itemImage} alt={item.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ink-300">
                            <Icon name="image" className="h-5 w-5" />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            imageInputRef.current.dataset.itemId = item._id;
                            imageInputRef.current.click();
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-ink-950/0 text-transparent transition-colors hover:bg-ink-950/40 hover:text-white"
                        >
                          {uploadingItemId === item._id ? (
                            <Icon name="spinner" className="h-4 w-4 animate-spin" />
                          ) : (
                            <Icon name="upload" className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <VegDot isVeg={item.isVeg} />
                        <p className="mt-1 truncate text-sm font-semibold text-ink-800">{item.name}</p>
                        <p className="text-sm text-ink-500">{formatCurrency(item.price)}</p>
                        {!item.isAvailable && <Badge variant="danger" className="mt-1">Unavailable</Badge>}
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          onClick={() => setItemModal({ item })}
                          aria-label={`Edit ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteItemTarget(item)}
                          aria-label={`Delete ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-danger-50 hover:text-danger-500"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleUploadImage(imageInputRef.current.dataset.itemId, e.target.files[0])}
      />

      {categoryModal && (
        <CategoryModal
          isOpen
          onClose={() => setCategoryModal(null)}
          restaurantId={restaurant._id}
          category={categoryModal.category}
          onSaved={() => {
            setCategoryModal(null);
            refetchAll();
          }}
        />
      )}

      {itemModal && (
        <MenuItemModal
          isOpen
          onClose={() => setItemModal(null)}
          restaurantId={restaurant._id}
          categories={categories || []}
          item={itemModal.item}
          onSaved={() => {
            setItemModal(null);
            refetchAll();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteCategoryTarget)}
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={handleDeleteCategory}
        loading={deleting}
        title="Delete category"
        description="This category must be empty of menu items before it can be deleted."
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteItemTarget)}
        onClose={() => setDeleteItemTarget(null)}
        onConfirm={handleDeleteItem}
        loading={deleting}
        title="Delete menu item"
        description={`Remove "${deleteItemTarget?.name}" from your menu? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </PageTransition>
  );
}
