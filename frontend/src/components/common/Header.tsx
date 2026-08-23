import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  Layers,
  Mail,
  DollarSign,
  Star,
  MessageSquare,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  CheckCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';
import { formatRelativeTime } from '../../utils/dateTime';
import { getNotificationRoute } from '../../utils/notificationRoutes';

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

const getNotificationIcon = (type: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('invitation')) return <Mail className="w-4 h-4 text-pink-500 shrink-0" />;
  if (t.includes('escrow') || t.includes('payment')) return <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />;
  if (t.includes('review') || t.includes('rating')) return <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />;
  if (t.includes('negotiation') || t.includes('offer')) return <MessageSquare className="w-4 h-4 text-purple-500 shrink-0" />;
  if (t.includes('campaign')) return <Megaphone className="w-4 h-4 text-blue-500 shrink-0" />;
  if (t.includes('collab') || t.includes('deliverable') || t.includes('content') || t.includes('revision'))
    return <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />;
  if (t.includes('report') || t.includes('dispute')) return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
  return <Bell className="w-4 h-4 text-slate-500 shrink-0" />;
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user, role, logout, isGuest } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = (notifications || []).filter((n: any) => n && !n.read && !n.isRead).length;
  const badgeLabel = unreadCount > 9 ? '10+' : String(unreadCount);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-2 shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Mobile Brand Logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-white shadow-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-base font-black bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
            CollabX
          </span>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isGuest ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-[#EC4899] hover:bg-pink-600 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              Get Started
            </Link>
          </>
        ) : (
          <>
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors relative flex items-center justify-center"
                title="Notifications"
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EC4899] text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                    {badgeLabel}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200/90 shadow-2xl rounded-2xl p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="bg-pink-100 text-[#EC4899] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-[#EC4899] font-bold hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 my-2 pr-1">
                    {!notifications || notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-600">No notifications yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">We'll alert you when updates happen.</p>
                      </div>
                    ) : (
                      (notifications || []).slice(0, 10).map((n: any) => {
                        if (!n) return null;
                        const nid = n._id || n.id;
                        const isUnread = !n.read && !n.isRead;
                        const relativeTime = formatRelativeTime(n.createdAt || n.timestamp);

                        return (
                          <div
                            key={nid}
                            onClick={() => {
                              markNotificationRead(nid);
                              setShowNotifications(false);
                              navigate(getNotificationRoute(n, role || 'brand'));
                            }}
                            className={`py-3 px-2.5 rounded-xl cursor-pointer transition-colors flex items-start gap-3 ${
                              isUnread ? 'bg-pink-50/50 hover:bg-pink-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100/80 border border-slate-200/60 shrink-0">
                              {getNotificationIcon(n.type || '')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-bold text-slate-900 truncate">{n.title || 'Update'}</p>
                                <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                  {relativeTime}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-[#EC4899] shrink-0 mt-1.5" aria-label="Unread" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <Link
                    to={`/${role}/notifications`}
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-xs font-bold text-[#EC4899] pt-2.5 border-t border-slate-100 hover:underline"
                  >
                    View All in Notification Center →
                  </Link>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <Avatar
                  src={typeof user?.profileImage === 'object' ? user?.profileImage?.url : (user?.profileImage || user?.avatar)}
                  name={user?.name || user?.fullName}
                  size="w-7 h-7"
                  textSize="text-[10px]"
                />
                <span className="text-xs font-semibold text-slate-700 hidden md:inline truncate max-w-[100px]">
                  {user?.name || user?.fullName || 'User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name || user?.fullName || 'User'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                      {role}
                    </span>
                  </div>

                  <Link
                    to={`/${role}/profile`}
                    onClick={() => setShowUserMenu(false)}
                    className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors mt-1"
                  >
                    Profile & Settings
                  </Link>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};
