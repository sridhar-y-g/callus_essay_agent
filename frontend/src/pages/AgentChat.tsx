import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getApiUrl } from '../api';
import { Send, Loader2, FileText, Star, Pencil, GraduationCap, Download, ChevronRight, RotateCcw, User, Info, CheckCircle2, Share2, Save, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-ignore
import html2pdf from 'html2pdf.js';

type Tab = 'profile' | 'interview' | 'essay' | 'score' | 'refine' | 'supplemental';
interface Message { role: 'user' | 'assistant'; content: string; }
interface ScoreData {
  scores: { narrative: number; originality: number; emotional_impact: number; prompt_alignment: number; voice: number; };
  overall: number;
  strengths: string[];
  improvements: string[];
  verdict: string;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: '1. Profile', icon: <User className="w-4 h-4" /> },
  { id: 'interview', label: '2. Interview', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'essay', label: '3. Draft Essay', icon: <FileText className="w-4 h-4" /> },
  { id: 'score', label: '4. Score', icon: <Star className="w-4 h-4" /> },
  { id: 'refine', label: '5. Refine', icon: <Pencil className="w-4 h-4" /> },
  { id: 'supplemental', label: '6. Supplemental', icon: <ChevronRight className="w-4 h-4" /> },
];

export function AgentChat() {
  const { user, token, isLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');

  // Interview
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Essay
  const [essay, setEssay] = useState('');
  const [essayLoading, setEssayLoading] = useState(false);
  const [essayPrompt, setEssayPrompt] = useState('Common App personal statement');
  const essayRef = useRef<HTMLDivElement>(null);

  // Score
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  // Refine
  const [refineInstruction, setRefineInstruction] = useState('');
  const [refineLoading, setRefineLoading] = useState(false);

  // Supplemental
  const [school, setSchool] = useState('');
  const [suppPrompt, setSuppPrompt] = useState('');
  const [suppGuidance, setSuppGuidance] = useState('');
  const [suppLoading, setSuppLoading] = useState(false);
  const [studentContext, setStudentContext] = useState('');

  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
    if (user && !user.profile?.full_name && tab !== 'profile') {
      setTab('profile');
    }
  }, [user, isLoading, navigate, tab]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const universityTarget = user?.profile?.target_universities || 'Top Tier';
  useEffect(() => {
    if (user?.profile?.bio && !studentContext) {
      setStudentContext(user.profile.bio);
    }
  }, [user]);

  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;
    const newMsgs: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);
    setInput('');
    setChatLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/interview'), {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ messages: newMsgs, university_target: universityTarget })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      const reply = data.response as string;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      // Ready check is handled directly in render
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally { setChatLoading(false); }
  };

  const generateEssay = async () => {
    setEssayLoading(true);
    const transcript = messages.map(m => `${m.role === 'user' ? 'Student' : 'Counselor'}: ${m.content}`).join('\n\n');
    try {
      const res = await fetch(getApiUrl('/api/essay/generate'), {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ transcript, university_target: universityTarget, prompt: essayPrompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setEssay(data.essay);
      setTab('essay');
    } catch (e: any) { alert(e.message); }
    finally { setEssayLoading(false); }
  };

  const scoreEssay = async () => {
    if (!essay) { alert('Generate or paste an essay first.'); return; }
    setScoreLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/essay/score'), {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ essay, prompt: essayPrompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setScoreData(data);
    } catch (e: any) { alert(e.message); }
    finally { setScoreLoading(false); }
  };

  const refineEssay = async () => {
    if (!refineInstruction.trim()) return;
    setRefineLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/essay/refine'), {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ essay, instruction: refineInstruction })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setEssay(data.essay);
      setRefineInstruction('');
      setTab('essay');
    } catch (e: any) { alert(e.message); }
    finally { setRefineLoading(false); }
  };

  const getSupplemental = async () => {
    setSuppLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/essay/supplemental'), {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ school, prompt: suppPrompt, student_context: studentContext })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setSuppGuidance(data.guidance);
    } catch (e: any) { alert(e.message); }
    finally { setSuppLoading(false); }
  };

  const [savingDoc, setSavingDoc] = useState(false);
  const saveDocument = async (docType: 'essay' | 'guidance', title: string, content: string) => {
    setSavingDoc(true);
    try {
      const res = await fetch(getApiUrl('/api/documents'), {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ doc_type: docType, title, content })
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('Saved successfully to your profile!');
    } catch (e: any) { alert(e.message); }
    finally { setSavingDoc(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadPDF = () => {
    if (!essayRef.current) return;
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; color: black; line-height: 2;">
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px;">College Admission Essay</h1>
        <p style="font-style: italic; color: #555; margin-bottom: 20px;">Topic: ${essayPrompt}</p>
        <div style="font-size: 12pt; white-space: pre-wrap; text-align: justify;">${essay}</div>
      </div>
    `;
    const opt = {
      margin: 10,
      filename: 'College_Essay.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  const scoreBar = (label: string, val: number) => (
    <div key={label} className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-white/70">{label}</span>
        <span className="font-semibold text-white">{val}/10</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${val * 10}%` }} transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${val >= 8 ? 'bg-emerald-400' : val >= 6 ? 'bg-amber-400' : 'bg-red-400'}`} />
      </div>
    </div>
  );

  if (isLoading || !user) return null;

  return (
    <div className="relative z-10 flex flex-col h-[calc(100vh-80px)] max-w-6xl mx-auto w-full px-4 pt-4 pb-4">
      {/* CLOSE BUTTON */}
      <button onClick={() => navigate('/')} className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full z-50">
        <X className="w-5 h-5" />
      </button>

      {/* Step Wizard Nav */}
      <div className="flex gap-2 mb-6 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm overflow-x-auto scrollbar-hide">
        {TABS.map((t, idx) => {
          const isActive = tab === t.id;
          const isPast = TABS.findIndex(x => x.id === tab) > idx;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm transition-all duration-200 ${
                isActive ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]' :
                isPast ? 'text-white/80 hover:bg-white/10 bg-white/5' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {t.icon} <span className="whitespace-nowrap">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md flex flex-col relative">
        <AnimatePresence mode="wait">

          {/* ── 1. PROFILE TAB ── */}
          {tab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 h-full overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400"><Info className="w-5 h-5"/></div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Your Foundation</h2>
                    <p className="text-sm text-white/50">The AI uses this to personalize the interview and essays.</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/40 uppercase mb-1">Full Name</p>
                      <p className="text-white font-medium bg-black/20 p-3 rounded-xl">{user.profile?.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase mb-1">High School</p>
                      <p className="text-white font-medium bg-black/20 p-3 rounded-xl">{user.profile?.high_school || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase mb-1">Target Universities</p>
                    <p className="text-white font-medium bg-black/20 p-3 rounded-xl">{user.profile?.target_universities || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase mb-1">Bio / Context</p>
                    <p className="text-white font-medium bg-black/20 p-3 rounded-xl min-h-[80px]">{user.profile?.bio || 'Not set'}</p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-white/10 mt-4">
                    <Link to="/profile" className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-all font-medium">
                      Edit Profile
                    </Link>
                    <button onClick={() => setTab('interview')} className="flex-1 bg-white hover:bg-white/90 text-black py-3 rounded-xl transition-all font-medium">
                      Proceed to Interview →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 2. INTERVIEW TAB ── */}
          {tab === 'interview' && (
            <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 flex gap-3 items-start">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-medium">The Socratic Interview</p>
                  <p className="text-white/60 mt-1">Answer honestly and specifically. The AI will dig deep to find your unique 'hook'. After 4 messages, it will signal readiness to draft.</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-white/50">
                    <GraduationCap className="w-12 h-12 mb-4 opacity-50" />
                    <p>Ready to unearth your story?</p>
                    <button onClick={() => { setMessages([{ role: 'assistant', content: `Hi ${user.profile?.full_name ? user.profile.full_name.split(' ')[0] : 'there'}! Let's find the story only you can tell. Describe a moment in the last two years when you felt completely in your element.` }]); }} 
                      className="mt-6 bg-white text-black font-medium px-6 py-3 rounded-full hover:scale-105 transition-transform">
                      Start the Interview
                    </button>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[14.5px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' ? 'bg-white text-black rounded-tr-sm font-medium' : 'bg-black/40 border border-white/10 text-white/90 rounded-tl-sm'
                    }`}>
                      {msg.content.replace('[[READY]]', '').trim()}
                      {msg.content.includes('[[READY]]') && (
                        <div className="mt-4 pt-3 border-t border-white/20">
                          <span className="text-sm text-emerald-400 font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Ready to draft! Proceed to the next step.</span>
                          <button onClick={() => { setTab('essay'); generateEssay(); }} className="mt-3 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors">
                            Generate Draft Now →
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start"><div className="bg-black/40 border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm"><Loader2 className="w-4 h-4 animate-spin text-white/50"/></div></div>
                )}
                <div ref={bottomRef} />
              </div>

              {messages.length > 0 && (
                <div className="flex gap-2">
                  <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="Share your thoughts... (Shift+Enter for new line)" rows={2} className="flex-1 bg-black/40 border border-white/10 rounded-2xl pl-5 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none" />
                  <button onClick={sendMessage} disabled={chatLoading || !input.trim()} className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-white/90 transition-colors disabled:opacity-50 shrink-0 self-end">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── 3. ESSAY TAB ── */}
          {tab === 'essay' && (
            <motion.div key="essay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6 gap-4">
               <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-violet-400" />
                  <div><p className="text-white font-medium text-sm">Your Draft</p><p className="text-white/50 text-xs">Generated from your interview.</p></div>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <input value={essayPrompt} onChange={e => setEssayPrompt(e.target.value)} placeholder="Essay Prompt (e.g. Common App)" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                  {messages.length > 0 && !essay && (
                    <button onClick={generateEssay} disabled={essayLoading} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center gap-2">
                      {essayLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Now'}
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                   <button onClick={downloadPDF} disabled={!essay} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-2"><Download className="w-4 h-4"/> PDF</button>
                   <button onClick={() => setTab('score')} disabled={!essay} className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 flex items-center gap-2">Score It →</button>
                </div>
              </div>
              <div className="flex-1 relative" ref={essayRef}>
                <textarea value={essay} onChange={e => setEssay(e.target.value)} placeholder={essayLoading ? "Crafting your narrative..." : "Your essay will appear here. You can also paste one directly to score it."}
                  className="w-full h-full bg-black/20 border border-white/10 rounded-2xl p-6 text-white/90 text-[15px] leading-[1.8] placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none font-serif" />
              </div>
            </motion.div>
          )}

          {/* ── 4. SCORE TAB ── */}
          {tab === 'score' && (
            <motion.div key="score" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto p-6">
              {!scoreData && (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                  <Star className="w-12 h-12 text-amber-400 mb-4" />
                  <h3 className="text-xl text-white font-medium mb-2">Admissions Committee Review</h3>
                  <p className="text-white/60 text-sm mb-6">The AI will evaluate your essay across 5 crucial dimensions used by top-tier admissions officers.</p>
                  <button onClick={scoreEssay} disabled={!essay || scoreLoading} className="bg-white text-black w-full py-3 rounded-xl font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {scoreLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : 'Evaluate Draft'}
                  </button>
                </div>
              )}
              {scoreData && !scoreLoading && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-6">
                     <div>
                       <h2 className="text-3xl text-white font-semibold">
                         {typeof scoreData.overall === 'object' ? JSON.stringify(scoreData.overall) : scoreData.overall} 
                         <span className="text-white/40 text-lg font-normal">/10</span>
                       </h2>
                       <p className="text-white/50 text-sm mt-1">Overall Strength</p>
                     </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => saveDocument('essay', `Essay - Score: ${scoreData.overall}/10`, essay)} 
                          disabled={savingDoc}
                          className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors"
                        >
                          <Save className="w-4 h-4"/> {savingDoc ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                          onClick={() => copyToClipboard(essay)} 
                          className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors"
                        >
                          <Share2 className="w-4 h-4"/> Share
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <button onClick={() => setScoreData(null)} className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors"><RotateCcw className="w-4 h-4"/> Reset</button>
                        <button onClick={() => setTab('refine')} className="bg-white text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 shadow-lg shadow-white/5">Refine Draft →</button>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-white font-medium mb-5">Dimensions</h3>
                      {scoreBar('Narrative Strength', Number(scoreData.scores?.narrative) || 0)}
                      {scoreBar('Originality', Number(scoreData.scores?.originality) || 0)}
                      {scoreBar('Emotional Impact', Number(scoreData.scores?.emotional_impact) || 0)}
                      {scoreBar('Prompt Alignment', Number(scoreData.scores?.prompt_alignment) || 0)}
                      {scoreBar('Voice & Authenticity', Number(scoreData.scores?.voice) || 0)}
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                      <h3 className="text-white font-medium mb-3">AO Verdict</h3>
                      <p className="text-white/70 text-sm leading-relaxed italic border-l-2 border-amber-500/50 pl-4 py-1">
                        "{typeof scoreData.verdict === 'string' ? scoreData.verdict : JSON.stringify(scoreData.verdict || 'No verdict provided.')}"
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                      <h3 className="text-emerald-300 font-medium mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> What's Working</h3>
                      <ul className="space-y-3">
                        {(Array.isArray(scoreData.strengths) ? scoreData.strengths : typeof scoreData.strengths === 'string' ? [scoreData.strengths] : []).map((s: any, i: number) => (
                          <li key={i} className="text-white/70 text-sm pl-4 relative before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-emerald-400/50 before:rounded-full">
                            {typeof s === 'string' ? s : JSON.stringify(s)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                      <h3 className="text-amber-300 font-medium mb-4 flex items-center gap-2"><Star className="w-4 h-4"/> Areas to Improve</h3>
                      <ul className="space-y-3">
                        {(Array.isArray(scoreData.improvements) ? scoreData.improvements : typeof scoreData.improvements === 'string' ? [scoreData.improvements] : []).map((s: any, i: number) => (
                          <li key={i} className="text-white/70 text-sm pl-4 relative before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-amber-400/50 before:rounded-full">
                            {typeof s === 'string' ? s : JSON.stringify(s)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── 5. REFINE TAB ── */}
          {tab === 'refine' && (
            <motion.div key="refine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 w-full">
                  <p className="text-white/70 text-sm mb-2 font-medium">Editing Instruction based on Score feedback:</p>
                  <div className="flex gap-2">
                    <input value={refineInstruction} onChange={e => setRefineInstruction(e.target.value)} onKeyDown={e => e.key === 'Enter' && refineEssay()}
                      placeholder='e.g. "Fix the hook to be more sensory" or "Shorten by 100 words"' className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                    <button onClick={refineEssay} disabled={refineLoading || !refineInstruction.trim() || !essay}
                      className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-white/90 disabled:opacity-50 flex items-center gap-2 shrink-0">
                      {refineLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refine Essay'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <textarea value={essay} onChange={e => setEssay(e.target.value)} placeholder="Your essay draft..."
                  className="w-full h-full bg-black/20 border border-white/10 rounded-2xl p-6 text-white/90 text-[15px] leading-[1.8] focus:outline-none focus:border-white/30 resize-none font-serif" />
              </div>
            </motion.div>
          )}

          {/* ── 6. SUPPLEMENTAL TAB ── */}
          {tab === 'supplemental' && (
            <motion.div key="supplemental" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6 gap-4">
               <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3 mb-2">
                  <GraduationCap className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-medium text-sm">Targeted Supplemental Guidance</h3>
                    <p className="text-white/50 text-xs mt-1">Get precise angles for "Why Us" and specific school prompts.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input value={school} onChange={e => setSchool(e.target.value)} placeholder="School (e.g. MIT, Yale)" className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white" />
                  <input value={studentContext} onChange={e => setStudentContext(e.target.value)} placeholder="Context (e.g. robotics captain)" className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white" />
                </div>
                <textarea value={suppPrompt} onChange={e => setSuppPrompt(e.target.value)} rows={2} placeholder='Paste the exact prompt here…' className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white resize-none" />
                <button onClick={getSupplemental} disabled={suppLoading || !school || !suppPrompt}
                  className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {suppLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Strategic Guidance'}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-black/20 border border-white/10 rounded-2xl p-6">
                {!suppGuidance && !suppLoading && (
                  <div className="h-full flex items-center justify-center text-white/30 text-sm">Guidance will appear here formatted as a professional report.</div>
                )}
                 {suppGuidance && (
                  <div className="space-y-4">
                    <div className="flex justify-end gap-3 pb-4 border-b border-white/10">
                      <button 
                        onClick={() => saveDocument('guidance', `Strategic Guidance: ${school}`, suppGuidance)} 
                        disabled={savingDoc}
                        className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors"
                      >
                        <Save className="w-4 h-4"/> {savingDoc ? 'Saving...' : 'Save to Profile'}
                      </button>
                      <button 
                        onClick={() => copyToClipboard(suppGuidance)} 
                        className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors"
                      >
                        <Share2 className="w-4 h-4"/> Copy Content
                      </button>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white/80 prose-li:text-white/80 prose-table:text-white/80 prose-th:text-white prose-td:text-white/80 prose-strong:text-white">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {suppGuidance}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
