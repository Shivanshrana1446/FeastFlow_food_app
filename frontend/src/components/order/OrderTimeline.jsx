import Icon from '@/components/ui/Icon';
import { ORDER_STATUS, ORDER_STATUS_FLOW, ORDER_STATUS_LABEL } from '@/utils/constants';
import { formatTime } from '@/utils/format';

export default function OrderTimeline({ status, statusHistory = [] }) {
  if (status === ORDER_STATUS.CANCELLED) {
    const cancelledAt = statusHistory.find((h) => h.status === ORDER_STATUS.CANCELLED)?.changedAt;
    return (
      <div className="flex items-center gap-3 rounded-xl bg-danger-50 p-4 text-danger-700">
        <Icon name="alertCircle" className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">This order was cancelled</p>
          {cancelledAt && <p className="text-xs">{formatTime(cancelledAt)}</p>}
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);
  const historyByStatus = statusHistory.reduce((acc, h) => ({ ...acc, [h.status]: h.changedAt }), {});

  return (
    <ol className="space-y-0">
      {ORDER_STATUS_FLOW.map((step, index) => {
        const done = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === ORDER_STATUS_FLOW.length - 1;

        return (
          <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${
                  index < currentIndex ? 'bg-success-500' : 'bg-ink-200'
                }`}
              />
            )}
            <span
              className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                done
                  ? 'border-success-500 bg-success-500 text-white'
                  : 'border-ink-200 bg-white text-ink-300'
              } ${isCurrent ? 'ring-4 ring-success-100' : ''}`}
            >
              <Icon name="check" className="h-4 w-4" strokeWidth={3} />
            </span>
            <div className="pt-1">
              <p className={`text-sm font-semibold ${done ? 'text-ink-900' : 'text-ink-500'}`}>
                {ORDER_STATUS_LABEL[step]}
              </p>
              {historyByStatus[step] && <p className="text-xs text-ink-500">{formatTime(historyByStatus[step])}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
