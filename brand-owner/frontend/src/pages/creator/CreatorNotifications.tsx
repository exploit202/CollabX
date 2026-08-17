import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Bell, Check, Mail, MessageSquare, Briefcase } from 'lucide-react';

export const CreatorNotifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500">Alerts for brand invitations, counter offers, and deliverable approvals</p>
        </div>
        <button
          onClick={markAllNotificationsRead}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Check className="w-3.5 h-3.5" /> Mark All Read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No notifications available.
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => { markNotificationRead(n.id); if (n.link) navigate(n.link); }}
              className={`p-4 border-slate-200/90 flex items-start gap-3 cursor-pointer transition-all ${
                !n.read ? 'bg-purple-50/60 border-purple-200 shadow-sm' : 'bg-white opacity-80'
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
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{n.timestamp}</span>
                </div>
                {!n.read && <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-600 mr-1" aria-label="Unread" />}
                <p className="text-xs text-slate-600 mt-1">{n.message}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
