import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Mail, MessageSquare, Briefcase, Loader2, CheckCircle2, DollarSign, Star, CheckCheck } from 'lucide-react';

import { formatNotificationDateTime } from '../../utils/dateTime';

export const BrandNotifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, refreshAppData } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshAppData().finally(() => setLoading(false));
  }, [refreshAppData]);

  const hasUnread = notifications.some((n: any) => !n.isRead && !n.read);

  const getIcon = (type: string) => {
    if (type.includes('invitation')) return <Mail className="w-4 h-4" />;
    if (type.includes('payment')) return <DollarSign className="w-4 h-4" />;
    if (type.includes('review')) return <Star className="w-4 h-4" />;
    if (type.includes('approved') || type.includes('completed')) return <CheckCircle2 className="w-4 h-4" />;
    if (type.includes('negotiation')) return <MessageSquare className="w-4 h-4" />;
    return <Briefcase className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500">Alerts for campaign updates, creator counter offers, deliverable submissions, and payouts</p>
        </div>
        {hasUnread && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#EC4899] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-pink-100 shrink-0 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-[#EC4899]" /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No notifications available.
            </Card>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.isRead && !n.read;
              return (
                <Card
                  key={n._id || n.id}
                  onClick={() => markNotificationRead(n._id || n.id)}
                  className={`p-4 border-slate-200/90 flex items-start gap-3 cursor-pointer transition-all ${
                    isUnread ? 'bg-pink-50/60 border-pink-200 shadow-sm' : 'bg-white opacity-80'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(n.type || '')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{n.title || n.message}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatNotificationDateTime(n.createdAt || n.timestamp)}
                      </span>
                    </div>
                    {isUnread && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#EC4899] mr-1" aria-label="Unread" />}
                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
