import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BarChart3, Search,
  User, LogOut, Brain, Menu, X, Moon, Sun, BookOpen
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/search',    icon: Search,          label: 'Search' },
  { to: '/analytics', icon: BarChart3,        label: 'Analytics' },
  { to: '/profile',   icon: User,            label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display font-bold text-lg gradient-text">
            StudyAI
          </motion.span>
        )}
        <button onClick={() => setCollapsed(c => !c)} className="ml-auto text-slate-500 hover:text-white transition-colors hidden lg:block">
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative
                ${active
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-500 rounded-r-full" />}
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-400' : 'group-hover:text-white'}`} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        {/* Theme toggle */}
        <button onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User + Logout */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          )}
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden glass rounded-xl p-2 text-slate-300"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden border-r border-white/10"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0 border-r border-white/10 overflow-hidden"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
