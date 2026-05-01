import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, GraduationCap, User, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';

export function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };
  const active = (p: string) => location.pathname === p;

  const linkCls = (p: string) =>
    `relative text-sm font-medium transition-all duration-200 ${active(p) ? 'text-white' : 'text-white/50 hover:text-white'}`;

  return (
    <>
      {/* ── NAVBAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'border-b border-white/8' : ''
        }`}
        style={scrolled ? { background: 'rgba(4,12,26,0.75)', backdropFilter: 'blur(24px)' } : {}}
      >
        <div className="flex items-center justify-between px-5 sm:px-10 h-16 max-w-7xl mx-auto">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <GraduationCap className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-xl font-semibold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Callus<sup className="text-[9px] font-normal opacity-60">®</sup>
            </span>
          </Link>

          {/* Desktop centre links */}
          <nav className="hidden md:flex items-center gap-7">
            <Link to="/" className={linkCls('/')}>
              Home
              {active('/') && <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-0 right-0 h-px bg-white rounded-full" />}
            </Link>
            {user ? (
              <>
                <Link to="/chat" className={linkCls('/chat')}>
                  Studio
                  {active('/chat') && <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-0 right-0 h-px bg-white rounded-full" />}
                </Link>
                <Link to="/profile" className={linkCls('/profile')}>
                  Profile
                  {active('/profile') && <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-0 right-0 h-px bg-white rounded-full" />}
                </Link>
                {user.is_admin && (
                  <Link to="/admin" className={linkCls('/admin')}>
                    Admin
                    {active('/admin') && <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-0 right-0 h-px bg-white rounded-full" />}
                  </Link>
                )}
              </>
            ) : (
              <>
                <a href="#services" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Services</a>
                <a href="#how-it-works" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Guide</a>
              </>
            )}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold text-white">
                    {user.email[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-white/60 max-w-[120px] truncate">{user.email}</span>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors px-3 py-1.5">
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/50 hover:text-white font-medium transition-colors px-2">Log In</Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register"
                    className="btn-glow text-sm px-5 py-2 inline-block"
                    style={{ boxShadow: '0 0 20px rgba(255,255,255,0.12)' }}>
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(v => !v)}
            className="md:hidden text-white/70 hover:text-white transition-colors p-2 -mr-2">
            <AnimatePresence mode="wait" initial={false}>
              {open
                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-5 h-5" /></motion.div>
                : <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-5 h-5" /></motion.div>
              }
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-20 left-4 right-4 z-50 rounded-2xl overflow-hidden"
              style={{ background: 'rgba(8,18,36,0.96)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(32px)' }}
            >
              <div className="p-3 flex flex-col gap-1">
                {[
                  { to: '/', label: 'Home', icon: <GraduationCap className="w-4 h-4" /> },
                  ...(user ? [
                    { to: '/chat', label: 'Studio', icon: <GraduationCap className="w-4 h-4" /> },
                    { to: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
                    ...(user.is_admin ? [{ to: '/admin', label: 'Admin', icon: <LayoutDashboard className="w-4 h-4" /> }] : []),
                  ] : [
                    { to: '/login', label: 'Log In', icon: <LogIn className="w-4 h-4" /> },
                    { to: '/register', label: 'Sign Up', icon: <UserPlus className="w-4 h-4" /> },
                  ]),
                ].map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={item.to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        active(item.to) ? 'text-white' : 'text-white/55 hover:text-white hover:bg-white/8'
                      }`}
                      style={active(item.to) ? { background: 'rgba(255,255,255,0.1)' } : {}}>
                      {item.icon} {item.label}
                    </Link>
                  </motion.div>
                ))}
                {user && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/55 hover:text-white hover:bg-white/8 transition-colors">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
