import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../api';
import { Mail, Lock, ArrowRight, Loader2, UserPlus, LogIn, ShieldCheck, RefreshCw } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'otp';

export function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/register') setAuthMode('register');
    else setAuthMode('login');
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || 'Something went wrong');

      if (authMode === 'login') {
        await login(data.access_token);
        navigate('/chat');
      } else {
        setAuthMode('otp');
        setMessage('A 6-digit code has been sent to your email.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Verification failed');
      setAuthMode('login');
      setOtp(['', '', '', '', '', '']);
      setMessage('Email verified! You can now log in.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to resend code');
      setMessage('A new code has been sent to your email.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setError('');
    setMessage('');
    navigate(authMode === 'login' ? '/register' : '/login');
  };

  const headerConfig = {
    login: { icon: <LogIn className="w-7 h-7 text-white" />, title: 'Welcome Back', subtitle: 'Enter your details to access your account' },
    register: { icon: <UserPlus className="w-7 h-7 text-white" />, title: 'Join Callus', subtitle: 'Begin your journey to top-tier universities' },
    otp: { icon: <ShieldCheck className="w-7 h-7 text-white" />, title: 'Check your email', subtitle: `We sent a 6-digit code to ${email}` }
  };
  const { icon, title, subtitle } = headerConfig[authMode];

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem] overflow-hidden p-8 sm:p-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={authMode + '-header'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="mb-8 text-center flex flex-col items-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-5 shadow-inner ring-1 ring-white/20">
                  {icon}
                </div>
                <h2 className="text-4xl tracking-tight text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {title}
                </h2>
                <p className="text-white/60 text-sm font-medium px-2">{subtitle}</p>
              </motion.div>
            </AnimatePresence>

            {/* Alerts */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm text-center overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
              {message && (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 px-4 py-3 rounded-xl text-sm text-center overflow-hidden"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* OTP Screen */}
            <AnimatePresence mode="wait">
              {authMode === 'otp' ? (
                <motion.div
                  key="otp-form"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all caret-white"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.join('').length !== 6}
                    className="group w-full flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl px-4 py-3.5 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>}
                  </button>

                  <div className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center gap-2">
                    <p className="text-sm text-white/50">Didn't receive the code?</p>
                    <button
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="flex items-center gap-1.5 text-white text-sm font-medium hover:text-white/80 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Resend code
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Login / Register Form */
                <motion.form
                  key="auth-form"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.35 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="group">
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="Email address"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/10 text-white placeholder:text-white/40 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/10 text-white placeholder:text-white/40 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl px-4 py-3.5 mt-2 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                      <span>{authMode === 'login' ? 'Log In' : 'Sign Up'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>}
                  </button>

                  <div className="mt-4 pt-5 border-t border-white/10 flex flex-col items-center gap-2">
                    <p className="text-sm text-white/60">
                      {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                      type="button"
                      onClick={toggleAuthMode}
                      className="text-white text-sm font-medium hover:text-white/80 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all hover:after:w-full"
                    >
                      {authMode === 'login' ? 'Create an account' : 'Log in instead'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
