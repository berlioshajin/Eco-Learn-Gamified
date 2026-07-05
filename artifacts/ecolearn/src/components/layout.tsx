import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Leaf, LogOut, LayoutDashboard, BookOpen, Trophy, Award, Target, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!user || user.role !== 'student') {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/learn', label: 'Learn', icon: BookOpen },
    { href: '/quiz', label: 'Quizzes', icon: Target },
    { href: '/challenges', label: 'Challenges', icon: Leaf },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/badges', label: 'Badges', icon: Award },
    { href: '/profile', label: 'Profile', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">EcoLearn</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive cursor-pointer transition-colors duration-200" onClick={logout}>
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Log out</span>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-primary">EcoLearn</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-foreground">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-card pt-16 flex flex-col"
          >
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-colors duration-200 ${isActive ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>
                    <Icon className="w-6 h-6" />
                    <span className="text-lg">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-destructive/10 text-destructive cursor-pointer" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                <LogOut className="w-6 h-6" />
                <span className="font-semibold text-lg">Log out</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user || user.role !== 'admin') {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/lessons', label: 'Lessons', icon: BookOpen },
    { href: '/admin/quizzes', label: 'Quizzes', icon: Target },
    { href: '/admin/challenges', label: 'Challenges', icon: Leaf },
    { href: '/admin/students', label: 'Students', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-foreground text-background p-2 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">EcoAdmin</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== '/admin' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive ? 'bg-foreground text-background font-semibold shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive cursor-pointer transition-colors duration-200" onClick={logout}>
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Log out</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
