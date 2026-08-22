import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Mail, MessageSquare, Briefcase, Loader2, CheckCheck } from 'lucide-react';

export const CreatorNotifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, refreshAppData } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshAppData().finally(() => setLoading(false));
  }, [refreshAppData]);

  const hasUnread = notifications.some((n: any) => !n.isRead && !n.read);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500">Alerts for brand invitations, counter offers, and deliverable approvals</p>
        </div>
        {hasUnread && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-purple-100 shrink-0 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-purple-600" /> Mark all as read
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
              No notifications available found in MongoDB.
            </Card>
          ) : (
            notifications.map((n) => (
              <Card
                key={n._id || n.id}
                onClick={() => markNotificationRead(n._id || n.id)}
                className={`p-4 border-slate-200/90 flex items-start gap-3 cursor-pointer transition-all ${
                  !n.isRead && !n.read ? 'bg-purple-50/60 border-purple-200 shadow-sm' : 'bg-white opacity-80'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  {n.type === 'invitation' ? (
                    <Mail className="w-4 h-4" />
                  ) : n.type === 'negotiation' ? (
                    <MessageSquare className="w-4 h-4" />
                  ) : (
                    <Briefcase className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{n.title || n.message}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {(!n.isRead && !n.read) && <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-600 mr-1" aria-label="Unread" />}
                  <p className="text-xs text-slate-600 mt-1">{n.message || n.text}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
