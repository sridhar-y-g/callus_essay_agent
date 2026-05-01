import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare, FileText, Star, Pencil,
  GraduationCap, Download, ArrowRight, Check, ChevronRight
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── static data ─────────────────────────────────────────────── */
const SERVICES = [
  { icon: <MessageSquare className="w-5 h-5" />, title: 'Deep Interview', color: '#3b82f6',
    desc: 'Socratic AI interview that uncovers pivotal moments and values — beyond grades and test scores.' },
  { icon: <FileText className="w-5 h-5" />, title: 'Essay Generation', color: '#8b5cf6',
    desc: 'Transforms raw stories into a polished 500-650 word personal statement with a vivid hook.' },
  { icon: <Star className="w-5 h-5" />, title: 'AI Scoring', color: '#f59e0b',
    desc: 'Scored on 5 dimensions — Narrative, Originality, Emotion, Alignment, Voice — like a real AO.' },
  { icon: <Pencil className="w-5 h-5" />, title: 'Smart Refinement', color: '#10b981',
    desc: 'Targeted editing instructions applied instantly while preserving your authentic voice.' },
  { icon: <GraduationCap className="w-5 h-5" />, title: 'Supplemental Essays', color: '#f43f5e',
    desc: 'School-specific guidance on "Why Us" prompts tailored to each university\'s culture.' },
  { icon: <Download className="w-5 h-5" />, title: 'PDF Export', color: '#06b6d4',
    desc: 'One-click download as a perfectly formatted PDF, ready for any application portal.' },
];

const STEPS = [
  { n: '01', title: 'Create Account', desc: 'Sign up and verify via 6-digit OTP email. Under 2 minutes.', tip: 'Check your inbox — OTP expires in 10 min.' },
  { n: '02', title: 'Set Your Profile', desc: 'Add your school, target universities, and a quick bio.', tip: 'Specific targets ("MIT, Yale") personalise the AI.' },
  { n: '03', title: 'Start Interview', desc: 'In the Studio, hit "Start Interview" and answer each question with real memories.', tip: 'Honest + specific beats impressive every time.' },
  { n: '04', title: 'Generate Essay', desc: 'After 8-12 exchanges the agent signals readiness. One click → first draft.', tip: 'The draft is a launchpad, not the finish line.' },
  { n: '05', title: 'Score & Refine', desc: 'Get 5-dimension AI feedback, then iterate until every sentence earns its place.', tip: 'Target 8+ before submitting anywhere.' },
  { n: '06', title: 'Export & Submit', desc: 'Download PDF or copy. Use Supplemental tab for school-specific essays.', tip: 'Read the final essay out loud — it should sound like you.' },
];

const TESTIMONIALS = [
  { name: 'Priya M.', school: 'MIT \'28', quote: 'My water-sensor internship story seemed boring. Callus showed me it was my entire application.' },
  { name: 'Jordan K.', school: 'Stanford \'28', quote: 'First draft: 5.8/10. After three AI-guided refinements: 8.9. That delta got me in.' },
  { name: 'Aanya S.', school: 'Yale \'28', quote: 'The "Why Yale" supplemental guidance was sharper than anything my school counselor offered.' },
];

/* ─── component ───────────────────────────────────────────────── */
export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const go = () => navigate(user ? '/chat' : '/register');

  return (
    <div className="w-full overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative flex flex-col items-center justify-center text-center px-6 min-h-[92vh]">
        {/* Decorative orbs */}
        <div className="orb w-[500px] h-[500px] -top-40 left-1/2 -translate-x-1/2" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        <div className="orb w-[400px] h-[400px] bottom-0 right-0" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center gap-6 max-w-5xl relative z-10">
          {/* Badge */}
          <motion.div {...fadeUp(0)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-white/60"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered College Admissions Agent
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp(0.1)}
            className="text-5xl sm:text-7xl md:text-[86px] leading-[0.9] font-normal text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-2px' }}>
            Your story{' '}
            <span className="text-shimmer">distilled</span>
            <br />
            for{' '}
            <span className="text-shimmer">top universities.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p {...fadeUp(0.2)} className="text-white/50 text-base sm:text-lg max-w-xl leading-relaxed">
            A world-class AI counselor that interviews you, finds your hook, writes your essay, scores it like an admissions officer, and helps you get accepted.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="flex flex-wrap justify-center gap-3">
            <motion.button
              onClick={go}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="btn-glow flex items-center gap-2 px-8 py-4 text-sm"
            >
              {user ? 'Open Studio' : 'Start for Free'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <a href="#how-it-works"
              className="flex items-center gap-2 px-8 py-4 rounded-full text-sm font-medium text-white/60 hover:text-white transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              See how it works
            </a>
          </motion.div>

          {/* Trust pills */}
          <motion.div {...fadeUp(0.4)} className="flex flex-wrap justify-center gap-4 text-xs text-white/35">
            {['No credit card needed', 'Free to start', '500+ students helped'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />{t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-10 bg-white/50 rounded-full" />
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { val: '500+', label: 'Students Helped' },
            { val: '92%', label: 'Acceptance Rate' },
            { val: '8.7', label: 'Avg Essay Score' },
            { val: '6', label: 'AI Tools in One' },
          ].map((s, i) => (
            <motion.div key={s.label} {...fadeUp(i * 0.08)}
              className="flex flex-col items-center text-center p-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>{s.val}</span>
              <span className="text-xs text-white/40 font-medium">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <p className="text-xs font-semibold text-white/35 tracking-widest uppercase mb-4">What We Offer</p>
          <h2 className="text-4xl sm:text-5xl font-normal text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Six tools, one goal:<br /><em className="not-italic text-white/40">your best essay ever.</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s, i) => (
            <motion.div key={s.title} {...fadeUp(i * 0.07)}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="relative p-6 rounded-2xl overflow-hidden group cursor-default"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(circle at 30% 30%, ${s.color}18 0%, transparent 60%)` }} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${s.color}20`, border: `1px solid ${s.color}35`, color: s.color }}>
                  {s.icon}
                </div>
                <h3 className="text-white font-semibold mb-2 text-sm">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 max-w-4xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <p className="text-xs font-semibold text-white/35 tracking-widest uppercase mb-4">Step-by-Step</p>
          <h2 className="text-4xl sm:text-5xl font-normal text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Signup to <em className="not-italic text-white/40">submitted essay</em>
          </h2>
        </motion.div>

        <div className="relative flex flex-col gap-4">
          {/* Timeline line */}
          <div className="absolute left-7 top-8 bottom-8 w-px hidden sm:block" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)' }} />

          {STEPS.map((s, i) => (
            <motion.div key={s.n} {...fadeUp(i * 0.07)} className="flex gap-5 items-start">
              <motion.div
                whileInView={{ scale: [0.8, 1.1, 1] }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-xs font-mono font-bold text-white/50 relative z-10"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {s.n}
              </motion.div>
              <div className="flex-1 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-white font-semibold text-sm mb-1.5">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-3">{s.desc}</p>
                <div className="flex items-start gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <span className="text-amber-400 text-xs mt-0.5 flex-shrink-0">💡</span>
                  <p className="text-white/40 text-xs leading-relaxed">{s.tip}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14">
          <p className="text-xs font-semibold text-white/35 tracking-widest uppercase mb-4">Real Students</p>
          <h2 className="text-4xl sm:text-5xl font-normal text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Stories that got them in
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} {...fadeUp(i * 0.1)}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl flex flex-col justify-between gap-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white/65 text-sm leading-relaxed italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'rgba(255,255,255,0.12)' }}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-white/35 text-xs">{t.school}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <motion.div {...fadeUp()}
          className="max-w-3xl mx-auto text-center p-12 sm:p-16 rounded-3xl relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* orbs */}
          <div className="orb w-80 h-80 -top-20 -left-20 opacity-40" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)' }} />
          <div className="orb w-80 h-80 -bottom-20 -right-20 opacity-40" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.3), transparent 70%)' }} />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-normal text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Your story deserves<br /><em className="not-italic text-white/40">to be told well.</em>
            </h2>
            <p className="text-white/45 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Join hundreds of students who found their angle and wrote essays that got them into their dream schools.
            </p>
            <motion.button onClick={go}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="btn-glow inline-flex items-center gap-2 px-10 py-4 text-sm">
              {user ? 'Go to Studio' : 'Begin for Free'}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-white/20 text-xs">© 2026 Callus Inc. · Built for students, by people who care about your story.</p>
      </footer>
    </div>
  );
}
