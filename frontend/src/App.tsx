import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Nav } from './components/Nav';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { AgentChat } from './pages/AgentChat';
import { motion } from 'framer-motion';

function AppShell() {
  const { isLoading } = useAuth();

  // Show a minimal branded loader while session restores
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'hsl(201,100%,5%)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div className="flex gap-1">
            {[0, 0.15, 0.3].map((d, i) => (
              <motion.div key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: d }}
                className="w-1.5 h-1.5 rounded-full bg-white/50"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'hsl(201,100%,4%)' }}>
      {/* Background video — brighter opacity */}
      <video autoPlay loop muted playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.75 }}>
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
      </video>

      {/* Subtle dark tint — much lighter than before */}
      <div className="fixed inset-0 z-[1]"
        style={{ background: 'linear-gradient(160deg, rgba(2,10,22,0.35) 0%, rgba(2,10,22,0.1) 50%, rgba(2,10,22,0.4) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Nav />
        <main className="flex-grow flex flex-col pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/chat" element={<AgentChat />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
