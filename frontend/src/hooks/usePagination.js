import { useState } from 'react';

export function usePagination(initialLimit = 12) {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);

  return { page, limit, setPage, resetPage: () => setPage(1) };
}
