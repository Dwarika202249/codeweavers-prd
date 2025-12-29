import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';


export default function NotificationsBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleClick = (n: any) => {
    // Mark notification as read and close the dropdown.
    // Do NOT navigate to enrollment pages from notifications to avoid inadvertent redirection/security issues.
    if (!n.read) markRead(n._id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((s) => !s)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs bg-red-500 text-white">{unreadCount}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-800 rounded shadow-lg z-50">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between">
            <div className="text-sm font-medium text-white">Notifications</div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <button onClick={() => markAllRead()} className="px-2 py-1 rounded bg-gray-800 text-xs">Mark all read</button>
            </div>
          </div>
          <div className="max-h-64 overflow-auto">
            {loading ? <div className="p-3 text-gray-400">Loading…</div> : notifications.length === 0 ? <div className="p-3 text-gray-400">No notifications</div> : (
              notifications.map((n: any) => (
                <div key={n._id} onClick={() => handleClick(n)} className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 ${n.read ? '' : 'bg-gray-900'}`}>
                  <div className="text-sm text-white">{n.title}</div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
                    <div>{n.message}</div>
                    <div className="ml-2">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}