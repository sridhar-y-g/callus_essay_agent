import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../api';
import { User, BookOpen, Target, FileText, CheckCircle2, ArrowRight, Loader2, Save, Trash2, ExternalLink, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const inputCls = "w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
  + " bg-white/5 border border-white/10 focus:bg-white/8 focus:border-white/25";

export function Profile() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ full_name: '', high_school: '', target_universities: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'saved'>('profile');
  const [docs, setDocs] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setFormData({
      full_name: user.profile?.full_name || '',
      high_school: user.profile?.high_school || '',
      target_universities: user.profile?.target_universities || '',
      bio: user.profile?.bio || '',
    });
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'saved') fetchDocs();
  }, [activeTab]);

  const fetchDocs = async () => {
    setDocsLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/documents'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch (err) { console.error(err); }
    finally { setDocsLoading(false); }
  };

  const deleteDoc = async (id: number) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/documents/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setDocs(prev => prev.filter(d => d.id !== id));
    } catch (err) { console.error(err); }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.target_universities.trim()) {
      setError('Full name and target universities are required.');
      return;
    }
    setLoading(true); setError(''); setSaved(false);
    try {
      const res = await fetch(getApiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update profile');
      // Re-fetch user to update context
      const meRes = await fetch(getApiUrl('/api/auth/me'), { headers: { 'Authorization': `Bearer ${token}` } });
      if (meRes.ok) {
        // Force context refresh by re-calling login with existing token
        await login(token!);
      }
      setSaved(true);
      setTimeout(() => navigate('/chat'), 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isComplete = !!(user?.profile?.full_name && user?.profile?.target_universities);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <User className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h1>
          <p className="text-white/45 text-sm">Manage your profile and saved admissions work</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-8">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${activeTab === 'profile' ? 'bg-white text-black font-semibold' : 'text-white/50 hover:text-white'}`}
          >
            <User className="w-4 h-4" /> Profile Info
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${activeTab === 'saved' ? 'bg-white text-black font-semibold' : 'text-white/50 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Saved Work
          </button>
        </div>

        {activeTab === 'profile' ? (
          <>
        {/* Why this matters */}
        <div className="mb-6 p-4 rounded-2xl flex gap-3"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <span className="text-blue-400 text-lg mt-0.5">ℹ</span>
          <div>
            <p className="text-blue-300 text-xs font-semibold mb-1">Why complete your profile?</p>
            <p className="text-white/50 text-xs leading-relaxed">
              The AI uses your name, school, and target universities to ask better interview questions,
              write a more targeted essay, and give school-specific supplemental advice.
              The Studio will prompt you to complete this first.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-7 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-5 px-4 py-3 rounded-xl text-red-200 text-sm text-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </motion.div>
            )}
            {saved && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-5 px-4 py-3 rounded-xl text-emerald-200 text-sm text-center flex items-center justify-center gap-2"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle2 className="w-4 h-4" /> Saved! Taking you to the Studio…
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                <User className="w-3 h-3" /> Full Name <span className="text-red-400">*</span>
              </label>
              <input type="text" value={formData.full_name} onChange={set('full_name')} placeholder="e.g. Priya Sharma" className={inputCls} />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                <BookOpen className="w-3 h-3" /> High School
              </label>
              <input type="text" value={formData.high_school} onChange={set('high_school')} placeholder="e.g. Delhi Public School, Bangalore" className={inputCls} />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                <Target className="w-3 h-3" /> Target Universities <span className="text-red-400">*</span>
              </label>
              <input type="text" value={formData.target_universities} onChange={set('target_universities')} placeholder="e.g. MIT, Stanford, Harvard, Yale" className={inputCls} />
              <p className="text-white/25 text-xs mt-1.5 ml-1">Comma-separated. Be specific — used to tailor your essay.</p>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                <FileText className="w-3 h-3" /> Short Bio & Interests
              </label>
              <textarea value={formData.bio} onChange={set('bio')} rows={3}
                placeholder="e.g. Robotics team captain, interested in ML and climate tech, founded a coding club..."
                className={inputCls} />
              <p className="text-white/25 text-xs mt-1.5 ml-1">Helps the AI start with context about you. 2-3 sentences max.</p>
            </div>

            <motion.button type="submit" disabled={loading || saved}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-white/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" />
                : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                : <><Save className="w-4 h-4" /> Save & Go to Studio <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>
        </div>

        {isComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
            <button onClick={() => navigate('/chat')} className="text-sm text-white/40 hover:text-white transition-colors">
              Skip → Go to Studio
            </button>
          </motion.div>
        )}
        </>
        ) : (
          <div className="space-y-4">
            {docsLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-white/30">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Loading your documents...</p>
              </div>
            )}
            {!docsLoading && docs.length === 0 && (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40">You haven't saved any work yet.</p>
                <button onClick={() => navigate('/chat')} className="mt-4 text-blue-400 text-sm hover:underline">Start in the Studio →</button>
              </div>
            )}
            {!docsLoading && docs.map(doc => (
              <div key={doc.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:bg-white/8">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${doc.doc_type === 'essay' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
                      {doc.doc_type === 'essay' ? <FileText className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{doc.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-white/30 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(doc.created_at).toLocaleDateString()}</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span>{doc.doc_type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }} className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedDoc === doc.id ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedDoc === doc.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10 bg-black/20"
                    >
                      <div className="p-6">
                        {doc.doc_type === 'essay' ? (
                          <div className="bg-white/95 text-black p-8 rounded-xl font-serif text-[14px] leading-relaxed shadow-inner max-h-[400px] overflow-y-auto">
                            <div className="whitespace-pre-wrap">{doc.content}</div>
                          </div>
                        ) : (
                          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white/80 prose-li:text-white/80 prose-table:text-white/80">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {doc.content}
                            </ReactMarkdown>
                          </div>
                        )}
                        <div className="mt-4 flex justify-end">
                           <button 
                            onClick={() => {
                              navigator.clipboard.writeText(doc.content);
                              alert('Copied to clipboard!');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-all"
                           >
                            <ExternalLink className="w-3 h-3" /> Copy Full Text
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
