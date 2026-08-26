import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Mail,
  MessageSquare,
  Briefcase,
  Loader2,
  CheckCircle2,
  DollarSign,
  Star,
  CheckCheck,
  Megaphone,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { formatRelativeTime, formatNotificationDateTime } from '../../utils/dateTime';
import { getNotificationRoute } from '../../utils/notificationRoutes';

const getNotificationIcon = (type: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('invitation')) return <Mail className="w-4.5 h-4.5" />;
  if (t.includes('escrow') || t.includes('payment')) return <DollarSign className="w-4.5 h-4.5" />;
  if (t.includes('review') || t.includes('rating')) return <Star className="w-4.5 h-4.5" />;
  if (t.includes('negotiation') || t.includes('offer')) return <MessageSquare className="w-4.5 h-4.5" />;
  if (t.includes('campaign')) return <Megaphone className="w-4.5 h-4.5" />;
  if (t.includes('collab') || t.includes('deliverable') || t.includes('content') || t.includes('revision') || t.includes('approved'))
    return <CheckCircle2 className="w-4.5 h-4.5" />;
  if (t.includes('report') || t.includes('dispute')) return <AlertTriangle className="w-4.5 h-4.5" />;
  return <Bell className="w-4.5 h-4.5" />;
};

export const CreatorNotifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, refreshAppData } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    refreshAppData().finally(() => setLoading(false));
  }, [refreshAppData]);

  const unreadCount = notifications.filter((n: any) => !n.isRead && !n.read).length;

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n: any) => !n.isRead && !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="bg-pink-100 text-[#EC4899] text-xs font-black px-2.5 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time updates on campaign invitations, negotiation counter offers, escrow deposits, and 5★ reviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filter === 'unread' ? 'bg-white text-[#EC4899] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsRead()}
              className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#EC4899] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-pink-200 shadow-2xs cursor-pointer active:scale-95"
            >
              <CheckCheck className="w-4 h-4 text-[#EC4899]" /> Mark all as read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#EC4899]" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center border-slate-200/90 shadow-xs">
              <EmptyState
                icon={Bell}
                title={filter === 'unread' ? 'No Unread Notifications' : 'All Caught Up!'}
                description={
                  filter === 'unread'
                    ? 'You have read all your platform notifications.'
                    : 'No notifications available. New campaign invitations, negotiation offers, and milestone updates will appear here.'
                }
                variant="card"
              />
            </Card>
          ) : (
            filteredNotifications.map((n) => {
              const nid = n._id;
              const isUnread = !n.isRead;
              const relativeTime = formatRelativeTime(n.createdAt);
              const fullTime = formatNotificationDateTime(n.createdAt);

              return (
                <Card
                  key={nid}
                  onClick={() => {
                    markNotificationRead(nid);
                    navigate(getNotificationRoute(n, 'creator'));
                  }}
                  className={`p-4.5 border-slate-200/90 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                    isUnread
                      ? 'bg-gradient-to-r from-pink-50/90 via-pink-50/40 to-white border-pink-300 shadow-sm ring-1 ring-pink-500/10'
                      : 'bg-white/95 hover:bg-slate-50/80'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                      isUnread
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                    }`}
                  >
                    {getNotificationIcon(n.type || '')}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                        {n.title || n.message}
                      </h4>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 block">
                          {relativeTime}
                        </span>
                        <span className="text-[9px] text-slate-400 font-normal hidden sm:block">
                          {fullTime}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>

                  {isUnread && (
                    <span
                      className="w-2 h-2 rounded-full bg-[#EC4899] shrink-0 mt-2 shadow-xs animate-pulse"
                      aria-label="Unread"
                    />
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
