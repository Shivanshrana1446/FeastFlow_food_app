import { restaurantApi } from '@/api/restaurantApi';
import { useFetch } from './useFetch';

/**
 * Resolves the restaurant owned by the current user. Owner dashboards operate
 * on a single restaurant; if an owner manages several, the first one (most
 * recently created) is treated as the active one.
 */
export function useOwnerRestaurant() {
  const { data: restaurants, loading, error, refetch } = useFetch(() => restaurantApi.listMine(), []);
  return { restaurant: restaurants?.[0] || null, restaurants, loading, error, refetch };
}
