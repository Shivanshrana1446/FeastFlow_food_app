import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { restaurantApi } from '@/api/restaurantApi';
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import SearchBar from '@/components/ui/SearchBar';
import FilterPanel from '@/components/ui/FilterPanel';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { CardSkeletonGrid } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'ratingAvg:desc', label: 'Rating: High to low' },
  { value: 'name:asc', label: 'Name: A to Z' },
  { value: 'createdAt:desc', label: 'Newest first' },
];

export default function RestaurantListing() {
  const [searchParams] = useSearchParams();
  const { page, limit, setPage } = usePagination(12);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [openOnly, setOpenOnly] = useState(false);
  const city = searchParams.get('city') || '';

  const params = useMemo(
    () => ({
      page,
      limit,
      q: q || undefined,
      city: city || undefined,
      sortBy: sortBy || undefined,
      isOpen: openOnly || undefined,
    }),
    [page, limit, q, city, sortBy, openOnly]
  );

  const { data: restaurants, meta, loading, error } = useFetch(() => restaurantApi.list(params), [JSON.stringify(params)]);

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">
          {city ? `Restaurants near ${city}` : 'All restaurants'}
        </h1>
        <p className="mt-1 text-sm text-ink-500">Order from the best places in your neighborhood</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <SearchBar placeholder="Search restaurants or cuisines..." onSearch={(val) => { setQ(val); setPage(1); }} className="flex-1" />
      </div>

      <FilterPanel className="mb-6">
        <Select
          className="!h-10 min-w-[190px]"
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          options={SORT_OPTIONS}
        />
        <button
          onClick={() => { setOpenOnly((v) => !v); setPage(1); }}
          className={`flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors ${
            openOnly ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:bg-ink-50'
          }`}
        >
          Open now
        </button>
      </FilterPanel>

      {loading ? (
        <CardSkeletonGrid count={limit} />
      ) : error ? (
        <EmptyState icon="alertCircle" title="Couldn't load restaurants" description={error} />
      ) : restaurants.length === 0 ? (
        <EmptyState icon="store" title="No restaurants found" description="Try a different search or clear your filters." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
