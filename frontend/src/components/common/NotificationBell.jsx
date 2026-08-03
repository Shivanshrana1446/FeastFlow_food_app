import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '@/api/notificationApi';
import Icon from '@/components/ui/Icon';
import Dropdown from '@/components/ui/Dropdown';
import { formatDateTime } from '@/utils/format';

const ICONS = {
  order_placed: 'receipt',
  order_status_changed: 'clock',
  order_assigned: 'bike',
  order_delivered: 'checkCircle',
  review_received: 'starFilled',
};

const POLL_INTERVAL_MS = 20000;

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(() => {
    notificationApi
      .list({ limit: 10 })
      .then(({ data, meta }) => {
        setNotifications(data);
        setUnreadCount(meta?.unreadCount || 0);
      })
      .catch(() => {
        // Silent — the bell just stays quiet if this poll fails, no need to alarm the user.
      });
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const handleOpenNotification = async (notification) => {
    if (!notification.isRead) {
      await notificationApi.markAsRead(notification._id).catch(() => {});
      load();
    }
    if (notification.data?.orderId) {
      navigate(`/orders/${notification.data.orderId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead().catch(() => {});
    load();
  };

  return (
    <Dropdown
      trigger={
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        >
          <Icon name="bell" className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-500 text-2xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="flex items-center justify-between border-b border-ink-100 px-3 py-2">
        <p className="text-sm font-semibold text-ink-900">Notifications</p>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 w-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-ink-500">You&apos;re all caught up</p>
        ) : (
          notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => handleOpenNotification(n)}
              className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-ink-50 ${
                !n.isRead ? 'bg-brand-50/40' : ''
              }`}
            >
              <Icon name={ICONS[n.type] || 'info'} className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-800">{n.title}</p>
                {n.message && <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{n.message}</p>}
                <p className="mt-0.5 text-2xs text-ink-500">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
            </button>
          ))
        )}
      </div>
    </Dropdown>
  );
}
