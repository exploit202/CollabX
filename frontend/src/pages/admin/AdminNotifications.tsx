import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ShieldAlert, Bell, CheckCheck, UserX, FileCheck, Flag } from 'lucide-react';
import { formatNotificationDateTime } from '../../utils/dateTime';

export const AdminNotifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, refreshAppData } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshAppData().finally(() => setLoading(false));
  }, [refreshAppData]);

  const hasUnread = notifications.some((n: any) => !n.isRead && !n.read);

  const getIcon = (type: string) => {
    if (type.includes('report') || type.includes('flag')) return <Flag className="w-4.5 h-4.5" />;
    if (type.includes('user') || type.includes('verification')) return <UserX className="w-4.5 h-4.5" />;
    if (type.includes('campaign')) return <FileCheck className="w-4.5 h-4.5" />;
    return <ShieldAlert className="w-4.5 h-4.5" />;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Command Notification Center</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time platform audit alerts, user reports, campaign moderation notices, and system logs</p>
        </div>
        {hasUnread && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 hover:bg-purple-100 text-purple-700 font-extrabold text-xs rounded-2xl flex items-center gap-2 transition-all border border-purple-200/80 shrink-0 self-start sm:self-auto active:scale-95 cursor-pointer shadow-2xs"
          >
            <CheckCheck className="w-4 h-4 text-purple-600" /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonLoader count={4} />
      ) : (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No System Alerts"
              description="Platform operations are running smoothly. System security alerts and user moderation flags will appear here."
              variant="card"
            />
          ) : (
            notifications.map((n: any) => {
              const isUnread = !n.isRead && !n.read;
              return (
                <Card
                  key={n._id || n.id}
                  onClick={() => markNotificationRead(n._id || n.id)}
                  className={`p-4.5 border-slate-200/90 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                    isUnread
                      ? 'bg-gradient-to-r from-purple-50/90 via-pink-50/40 to-white border-purple-200 shadow-sm ring-1 ring-purple-500/10'
                      : 'bg-white/90 hover:bg-slate-50/80'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                      isUnread ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {getIcon(n.type || '')}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                        {n.title || n.message}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                        {formatNotificationDateTime(n.createdAt || n.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message || n.text}</p>
                  </div>

                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-[#EC4899] shrink-0 mt-2 shadow-xs animate-pulse" aria-label="Unread" />
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
