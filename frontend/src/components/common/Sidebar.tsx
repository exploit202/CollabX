import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Avatar } from './Avatar';
import {
  LayoutDashboard,
  Search,
  Megaphone,
  Mail,
  MessageSquare,
  Briefcase,
  Bookmark,
  Bell,
  Building2,
  Settings,
  FolderKanban,
  IndianRupee,
  Star,
  User,
  Users,
  ShieldAlert,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const { role, isGuest, user } = useAuth();
  const { notifications, invitations, negotiations } = useApp();

  const unreadNotifCount = notifications.filter((n: any) => !n.read && !n.isRead).length;
  const pendingInvCount = invitations.filter((i: any) => i.status === 'pending').length;
  const activeNegCount = negotiations.filter((n: any) => ['active', 'open', 'pending', 'in_progress'].includes(n.status)).length;

  const brandNav: NavItem[] = [
    { name: 'Dashboard', path: '/brand/dashboard', icon: LayoutDashboard },
    { name: 'Discover Creators', path: '/brand/discover', icon: Search },
    { name: 'Campaigns', path: '/brand/campaigns', icon: Megaphone },
    { name: 'Invitations', path: '/brand/invitations', icon: Mail, badge: pendingInvCount },
    { name: 'Negotiations', path: '/brand/negotiations', icon: MessageSquare, badge: activeNegCount },
    { name: 'Active Collaborations', path: '/brand/collaborations', icon: Briefcase },
    { name: 'Saved Creators', path: '/brand/saved', icon: Bookmark },
    { name: 'Reviews', path: '/brand/reviews', icon: Star },
    { name: 'Notifications', path: '/brand/notifications', icon: Bell, badge: unreadNotifCount },
    { name: 'Company Profile', path: '/brand/profile', icon: Building2 },
    { name: 'Settings', path: '/brand/settings', icon: Settings },
  ];

  const creatorNav: NavItem[] = [
    { name: 'Dashboard', path: '/creator/dashboard', icon: LayoutDashboard },
    { name: 'Discover Brands', path: '/creator/discover', icon: Search },
    { name: 'Collab Requests', path: '/creator/requests', icon: Mail, badge: pendingInvCount },
    { name: 'Negotiations', path: '/creator/negotiations', icon: MessageSquare, badge: activeNegCount },
    { name: 'Active Collaborations', path: '/creator/collaborations', icon: Briefcase },
    { name: 'Portfolio', path: '/creator/portfolio', icon: FolderKanban },
    { name: 'Pricing & Deliverables', path: '/creator/pricing', icon: IndianRupee },
    { name: 'Reviews', path: '/creator/reviews', icon: Star },
    { name: 'Notifications', path: '/creator/notifications', icon: Bell, badge: unreadNotifCount },
    { name: 'Profile', path: '/creator/profile', icon: User },
    { name: 'Settings', path: '/creator/settings', icon: Settings },
  ];

  const adminNav: NavItem[] = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Brands', path: '/admin/brands', icon: Building2 },
    { name: 'Manage Creators', path: '/admin/creators', icon: Users },
    { name: 'Campaigns', path: '/admin/campaigns', icon: Megaphone },
    { name: 'Collaborations', path: '/admin/collaborations', icon: Briefcase },
    { name: 'Reports', path: '/admin/reports', icon: ShieldAlert },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell, badge: unreadNotifCount },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const guestNav: NavItem[] = [
    { name: 'Discover Creators', path: '/brand/discover', icon: Search },
  ];

  const currentNav = isGuest
    ? guestNav
    : role === 'brand'
      ? brandNav
      : role === 'creator'
        ? creatorNav
        : adminNav;

  const renderContent = () => (
    <>
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
            CollabX
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {role}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isGuest && (
        <div className="p-3 mx-3 my-2 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
          <p className="text-[11px] font-semibold text-amber-800">Browsing as Guest</p>
          <p className="text-[10px] text-amber-700 leading-relaxed">
            You can explore creators. Sign in to invite, save, or collaborate.
          </p>
          <Link
            to="/login"
            onClick={onClose}
            className="block w-full py-2 text-center text-[11px] font-bold bg-[#EC4899] text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {currentNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? 'text-[#EC4899] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebarActiveBg"
                      className="absolute inset-0 bg-gradient-to-r from-pink-50/90 via-purple-50/50 to-white border border-pink-100/80 rounded-xl shadow-2xs -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-all duration-200 ${isActive ? 'text-[#EC4899] scale-110' : 'text-slate-400 group-hover:text-slate-700 group-hover:scale-110'}`} />
                    <span className="truncate tracking-tight">{item.name}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white shadow-xs">
                      {item.badge}
                    </span>
                  ) : null}
                  {isActive && (
                    <motion.span
                      layoutId="sidebarActiveBar"
                      className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-gradient-to-b from-[#EC4899] to-[#8B5CF6]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / User Summary */}
      {!isGuest && (
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <Link
          to={`/${role}/profile`}
          onClick={onClose}
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Avatar src={typeof user?.profileImage === 'object' ? user?.profileImage?.url : (user?.profileImage || user?.avatar)} name={user?.name || user?.fullName} size="w-9 h-9" textSize="text-xs" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.name || user?.fullName || 'Your Account'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider text-pink-600 capitalize">
              {role} Account
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </Link>
      </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-col h-screen sticky top-0 shrink-0 z-30 select-none">
        {renderContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10 select-none">
            {renderContent()}
          </aside>
        </div>
      )}
    </>
  );
};
