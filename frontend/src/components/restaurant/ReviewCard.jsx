import Avatar from '@/components/ui/Avatar';
import StarRating from '@/components/ui/StarRating';
import { formatDate } from '@/utils/format';

export default function ReviewCard({ review }) {
  return (
    <div className="flex gap-3 border-b border-ink-100 py-4 last:border-none">
      <Avatar name={review.user?.name} src={review.user?.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink-800">{review.user?.name || 'Anonymous'}</p>
          <span className="shrink-0 text-xs text-ink-500">{formatDate(review.createdAt)}</span>
        </div>
        <StarRating value={review.rating} size="h-3.5 w-3.5" />
        {review.comment && <p className="mt-1.5 text-sm text-ink-600">{review.comment}</p>}
      </div>
    </div>
  );
}
