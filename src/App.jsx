import { useEffect, useState } from "react";
import {
  Sparkles, MessageCircle, WandSparkles, ScanSearch, GraduationCap,
  UserRound, Menu, X, Copy, RefreshCw, ArrowUpRight, Heart,
  ShieldCheck, ChevronRight, Check, Send, Lightbulb, Star,
  Settings, LogOut, Volume2, Bookmark, Zap, MessageSquareText
} from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Sparkles },
  { id: "chat", label: "Charm Chat", icon: MessageCircle },
  { id: "studio", label: "Rizz Studio", icon: WandSparkles },
  { id: "analyser", label: "Chat Analyser", icon: ScanSearch },
  { id: "academy", label: "Academy", icon: GraduationCap },
  { id: "profile", label: "Profile", icon: UserRound }
];
const styles = ["Smooth", "Funny", "Romantic", "Bold", "Nonchalant", "Playful", "Mysterious"];

const examples = {
  Smooth: [
    "I was going to play it cool, but talking to you is becoming the best part of my day.",
    "You have a way of making a normal conversation feel different.",
    "Not even going to lie, your energy is refreshing."
  ],
  Funny: [
    "I had a smooth line ready, then you replied and my brain clocked out 😭",
    "Are you always this distracting or should I feel special?",
    "I was being productive until this conversation happened. Explain yourself 😂"
  ],
  Romantic: [
    "I like how easy it feels to talk to you. That's rare.",
    "Little things remind me of you, and I think that's becoming my favourite habit.",
    "I hope your day is as lovely as the energy you bring into mine."
  ],
  Bold: [
    "I'm enjoying this vibe. We should continue it over a proper date.",
    "I won't pretend I'm not interested. I'd like to get to know you better.",
    "You caught my attention. Now I'm curious about the person behind the smile."
  ],
  Nonchalant: [
    "You're cool to talk to, I can't even lie.",
    "I hear you 😂 what's the rest of the story though?",
    "No pressure, I'm just enjoying the conversation."
  ],
  Playful: [
    "So you're just going to be this interesting and expect me to act normal?",
    "I see the attitude is included for free 😂",
    "Okay, you've got my attention. What are you going to do with it?"
  ],
  Mysterious: [
    "There's something about your vibe I haven't figured out yet.",
    "I feel like there's a whole story behind that answer.",
    "Interesting... I have a feeling you're not telling me everything."
  ]
};

function makeReplies(context, style) {
  const base = examples[style] || examples.Smooth;
  if (!context.trim()) return base;
  return base.map((line, i) => [
    line,
    "I like that answer. What made you see it that way?",
    "Okay, now you've got me curious. Tell me more."
  ][i]);
}

function Logo({ small = false }) {
  return <div className={`brand-mark ${small ? "brand-small" : ""}`}><span className="brand-c">C</span><span className="brand-spark">✦</span></div>;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [style, setStyle] = useState("Smooth");
  const [context, setContext] = useState("");
  const [replies, setReplies] = useState([]);
  const [copied, setCopied] = useState(-1);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [name, setName] = useState("Alex");
  const [analysisText, setAnalysisText] = useState("");
  const [analysis, setAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [completed, setCompleted] = useState([]);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 5200);
    return () => window.clearTimeout(timer);
  }, []);

  const current = navItems.find(n => n.id === page);
  const lessons = [
    { title: "The art of asking better questions", time: "4 min", tag: "Conversation" },
    { title: "Confidence without pretending", time: "5 min", tag: "Mindset" },
    { title: "Listening is attractive", time: "3 min", tag: "Connection" },
    { title: "Respecting boundaries and reading the room", time: "6 min", tag: "Respect" }
  ];

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  const callCharmAI = async (payload) => {
    const response = await fetch(apiBase + "/api/charm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "CHARM AI could not respond. Please try again.");
    return data;
  };
  const generate = async () => {
    setAiLoading(true); setAiError(""); setReplies([]); setCopied(-1);
    try { const data = await callCharmAI({ action: "generate", context, style }); if (!data.replies || !data.replies.length) throw new Error("No reply ideas returned."); setReplies(data.replies); }
    catch (error) { setAiError(error.message || "Could not connect to CHARM AI."); }
    finally { setAiLoading(false); }
  };
  const runAnalysis = async () => {
    setAiLoading(true); setAiError(""); setAnalysis(false); setAnalysisResult("");
    try { const data = await callCharmAI({ action: "analyse", context: analysisText, style }); setAnalysisResult(data.note || "Ask a clear and respectful question rather than assuming."); setAnalysis(true); }
    catch (error) { setAiError(error.message || "Could not analyse this conversation."); }
    finally { setAiLoading(false); }
  };
  const copyReply = async (reply, i) => {
    try { await navigator.clipboard.writeText(reply); setCopied(i); }
    catch { setCopied(-1); }
  };
  const toggleSaved = (reply) => setSaved(prev => prev.includes(reply) ? prev.filter(x => x !== reply) : [...prev, reply]);
  const go = id => { setPage(id); setMobileMenu(false); };

  const PageTitle = ({ eyebrow, title, subtitle }) => <div className="page-heading"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>;

  const renderHome = () => <div className="page-content">
    <section className="welcome-card">
      <div className="welcome-copy"><div className="eyebrow light">YOUR AI WINGMAN <span className="live-dot" /></div><h1>Make every<br/><span>conversation</span><br/>count.</h1><p>Confidence looks good on you. Let's find your words.</p><button className="primary-btn" onClick={() => go("chat")}>Start a conversation <ArrowUpRight size={17}/></button></div>
      <div className="orb-wrap"><div className="orb"><div className="orb-core"><Logo/></div></div><span className="orbit-dot dot-one"/><span className="orbit-dot dot-two"/><span className="orbit-dot dot-three"/></div>
      <div className="welcome-glow"/>
    </section>
    <div className="section-row"><div><div className="eyebrow">YOUR TOOLKIT</div><h2>What are we working on?</h2></div><span className="muted tiny">01 — 06</span></div>
    <div className="feature-grid">
      <button className="feature-card feature-main" onClick={() => go("chat")}><span className="feature-icon purple"><MessageCircle/></span><span className="feature-tag">MOST POPULAR</span><h3>Charm Chat</h3><p>Find the right words for your next message.</p><span className="feature-arrow"><ArrowUpRight/></span></button>
      <button className="feature-card" onClick={() => go("studio")}><span className="feature-icon pink"><WandSparkles/></span><h3>Rizz Studio</h3><p>Choose a vibe. Make it yours.</p><span className="feature-arrow"><ArrowUpRight/></span></button>
      <button className="feature-card" onClick={() => go("analyser")}><span className="feature-icon blue"><ScanSearch/></span><h3>Chat Analyser</h3><p>Get a fresh perspective on your chat.</p><span className="feature-arrow"><ArrowUpRight/></span></button>
      <button className="feature-card" onClick={() => go("academy")}><span className="feature-icon gold"><GraduationCap/></span><h3>Charm Academy</h3><p>Build real confidence and connection.</p><span className="feature-arrow"><ArrowUpRight/></span></button>
    </div>
    <section className="quote-strip"><div className="quote-icon"><Heart size={18}/></div><div><strong>Real connection beats perfect lines.</strong><p>Be curious. Be kind. Be yourself.</p></div><span className="quote-spark">✦</span></section>
    <div className="section-row"><div><div className="eyebrow">QUICK START</div><h2>Pick your energy</h2></div></div>
    <div className="style-pills">{styles.map(s => <button key={s} className={style===s?"style-pill active":"style-pill"} onClick={() => {setStyle(s);go("chat");}}>{s}</button>)}</div>
  </div>;

  const renderChat = () => <div className="page-content">
    <PageTitle eyebrow="CHARM CHAT / 01" title={<>Your words.<br/><span className="gradient-text">With more confidence.</span></>} subtitle="Tell us what's happening. We'll help you find a reply that sounds like you."/>
    <div className="workspace">
      <div className="panel"><div className="panel-label"><span className="step-number">01</span> THE CONTEXT</div><label htmlFor="context">What's the conversation about?</label><textarea id="context" value={context} onChange={e=>setContext(e.target.value)} placeholder="E.g. They said they had a long day. I want to be sweet but not too much..." rows="5"/><div className="field-foot"><span>Keep it natural. Remove private details.</span><span>{context.length}/500</span></div></div>
      <div className="panel"><div className="panel-label"><span className="step-number">02</span> CHOOSE YOUR VIBE</div><div className="style-grid">{styles.map(s=><button key={s} className={style===s?"choice active":"choice"} onClick={()=>setStyle(s)}>{s}{style===s&&<Check size={14}/>}</button>)}</div><button className="primary-btn wide" onClick={generate} disabled={aiLoading}>{aiLoading?<RefreshCw size={17}/>:<Sparkles size={17}/>} {aiLoading?"CHARM is thinking...":"Generate reply ideas"}</button><p className="privacy-note"><ShieldCheck size={14}/> Secure AI connection</p>{aiError&&<p className="ai-error" role="alert">{aiError}</p>}</div>
      {replies.length>0&&<div className="results-panel"><div className="results-head"><div><div className="eyebrow">YOUR REPLY IDEAS</div><h2>Pick what feels like you.</h2></div><button className="icon-btn" onClick={generate} aria-label="Regenerate"><RefreshCw size={17}/></button></div>{replies.map((r,i)=><div className="reply-card" key={i}><div className="reply-top"><span>OPTION 0{i+1}</span><button className={saved.includes(r)?"save-btn saved":"save-btn"} onClick={()=>toggleSaved(r)}><Bookmark size={15}/></button></div><p>{r}</p><div className="reply-actions"><button onClick={()=>copyReply(r,i)}>{copied===i?<Check size={15}/>:<Copy size={15}/>} {copied===i?"Copied":"Copy reply"}</button><button onClick={()=>setContext(context+"\nMake this sound more like me.")}>Refine <ArrowUpRight size={14}/></button></div></div>)}</div>}
    </div>
  </div>;

  const renderStudio = () => <div className="page-content"><PageTitle eyebrow="RIZZ STUDIO / 02" title={<>Find your<br/><span className="gradient-text">own kind of charm.</span></>} subtitle="Different moments call for different energy. Pick a style and explore."/><div className="studio-grid">{styles.map((s,i)=><button key={s} className={style===s?"studio-tile selected":"studio-tile"} onClick={()=>{setStyle(s);setReplies(makeReplies(context,s));}}><span className={`studio-number n${i}`}>0{i+1}</span><span className="studio-emoji">{["✧","☻","♡","⚡","☁","✦","◌"][i]}</span><h3>{s}</h3><p>{["Effortless and genuine","Light-hearted and witty","Warm and thoughtful","Clear and confident","Relaxed and easy","Cheeky and fun","Intriguing and subtle"][i]}</p><span className="tile-link">Choose style <ArrowUpRight size={15}/></span></button>)}</div><div className="studio-cta"><div><div className="eyebrow">CURRENT STYLE</div><h2>{style}</h2><p>Take this energy into Charm Chat and make it your own.</p></div><button className="primary-btn" onClick={()=>go("chat")}>Open Charm Chat <ArrowUpRight size={16}/></button></div></div>;

  const renderAnalyser = () => <div className="page-content"><PageTitle eyebrow="CHAT ANALYSER / 03" title={<>Read the vibe.<br/><span className="gradient-text">Not minds.</span></>} subtitle="Get a thoughtful second opinion on the tone and flow of a conversation. No one can know another person's feelings from texts alone."/><div className="analyser-layout"><div className="panel"><div className="panel-label"><span className="step-number">01</span> PASTE AN ANONYMISED CHAT</div><textarea rows="8" value={analysisText} onChange={e=>{setAnalysisText(e.target.value);setAnalysis(false);}} placeholder={"You: How was your day?\nThem: It was actually pretty good, thanks for asking!\nYou: ..."} /><div className="field-foot"><span>Remove names, phone numbers and personal details.</span><span>{analysisText.length}/1500</span></div><button className="primary-btn wide" disabled={!analysisText.trim()||aiLoading} onClick={runAnalysis}>{aiLoading?<RefreshCw size={17}/>:<ScanSearch size={17}/>} {aiLoading?"Analysing...":"Analyse conversation"}</button>{aiError&&<p className="ai-error" role="alert">{aiError}</p>}</div><div className="insight-card"><div className="insight-icon"><Lightbulb/></div><div className="eyebrow">A HEALTHIER WAY TO READ TEXTS</div><h3>Look for patterns, not hidden meanings.</h3><p>A late reply doesn't automatically mean disinterest. A short message doesn't tell the whole story. Context and honest communication matter.</p><div className="insight-rule"/><div className="insight-point"><Check size={15}/> Notice mutual effort</div><div className="insight-point"><Check size={15}/> Ask instead of assuming</div><div className="insight-point"><Check size={15}/> Respect boundaries</div></div></div>{analysis&&<div className="analysis-result"><div className="eyebrow">DEMO REFLECTION</div><h2>Here's a useful way to think about it.</h2><p>Your conversation has been received. In this demo, we don't connect to an AI model yet, so we can't assess the actual messages. When the AI service is connected, this area can offer a balanced reflection on tone, conversational balance and possible next steps — without claiming to know what someone feels.</p></div>}</div>;

  const renderAcademy = () => <div className="page-content"><PageTitle eyebrow="CHARM ACADEMY / 04" title={<>The best charm<br/><span className="gradient-text">is the real you.</span></>} subtitle="Small lessons. Better conversations. Stronger confidence."/><div className="academy-banner"><div className="academy-symbol"><GraduationCap size={36}/></div><div><div className="eyebrow light">YOUR LEARNING PATH</div><h2>Connection starts with curiosity.</h2><p>{completed.length} of {lessons.length} lessons completed</p><div className="progress-track"><span style={{width:(completed.length/lessons.length*100)+"%"}}/></div></div></div><div className="lesson-list">{lessons.map((l,i)=><div className="lesson-row" key={l.title}><div className="lesson-num">{completed.includes(i)?<Check size={18}/>:String(i+1).padStart(2,"0")}</div><div className="lesson-info"><span className="eyebrow">{l.tag} · {l.time}</span><h3>{l.title}</h3></div><button className={completed.includes(i)?"complete-btn done":"complete-btn"} onClick={()=>setCompleted(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i])}>{completed.includes(i)?"Completed":"Mark done"} <ChevronRight size={16}/></button></div>)}</div><div className="respect-note"><ShieldCheck/><p><strong>Charm with respect.</strong> Confidence is never pressure. A good connection makes room for both people to be comfortable, honest and heard.</p></div></div>;

  const renderProfile = () => <div className="page-content"><PageTitle eyebrow="YOUR SPACE / 05" title={<>Make it<br/><span className="gradient-text">feel like yours.</span></>} subtitle="A few settings for your CHARM AI experience."/><div className="profile-card"><div className="avatar"><UserRound size={32}/></div><div><h2>{name||"Your name"}</h2><p>CHARM AI member · Demo profile</p></div><span className="profile-spark"><Sparkles/></span></div><div className="panel settings-panel"><div className="panel-label">PERSONAL DETAILS</div><label htmlFor="displayname">Display name</label><input id="displayname" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name"/><div className="settings-divider"/><div className="settings-line"><div><strong>Saved replies</strong><p>{saved.length} saved in this session</p></div><Bookmark size={18}/></div><div className="settings-line"><div><strong>Learning progress</strong><p>{completed.length} lessons completed</p></div><GraduationCap size={18}/></div></div><div className="panel settings-panel preference-panel"><div className="panel-label">CONVERSATION PREFERENCES</div><label>Default reply vibe</label><p className="preference-help">Choose the personality CHARM starts with when you open a new chat.</p><div className="preference-grid">{styles.map(s=><button key={s} className={style===s?"choice active":"choice"} onClick={()=>setStyle(s)}>{s}{style===s&&<Check size={14}/>}</button>)}</div><div className="settings-divider"/><div className="settings-line"><div><strong>Signature appearance</strong><p>Midnight Violet · Electric Pink · Cloud White</p></div><span className="palette-dots"><i/><i/><i/></span></div></div><div className="respect-note"><ShieldCheck/><p><strong>Your privacy matters.</strong> This demo stores interaction state only in the current app session. Don't paste sensitive personal information.</p></div></div>;

  if (isLoading) return <div className="splash-screen" role="status" aria-label="Loading CHARM AI">
    <div className="splash-noise" />
    <div className="splash-orbit splash-orbit-one" /><div className="splash-orbit splash-orbit-two" />
    <div className="splash-logo"><span>C</span><i>✦</i></div>
    <div className="splash-brand">CHARM<span> AI</span></div>
    <div className="splash-tagline">YOUR AI WINGMAN</div>
    <div className="splash-loader"><span /></div>
    <div className="splash-status">PREPARING YOUR NEXT GREAT CONVERSATION</div>
    <div className="splash-foot">CONFIDENCE. CONNECTION. YOUR STYLE.</div>
  </div>;

  return <div className="app-shell">
    <aside className={mobileMenu?"sidebar open":"sidebar"}><div className="sidebar-brand"><Logo/><div><strong>CHARM<span> AI</span></strong><small>YOUR AI WINGMAN</small></div><button className="close-menu" onClick={()=>setMobileMenu(false)}><X/></button></div><div className="nav-caption">WORKSPACE</div><nav>{navItems.map(item=>{const Icon=item.icon;return <button key={item.id} className={page===item.id?"nav-link active":"nav-link"} onClick={()=>go(item.id)}><Icon size={19}/><span>{item.label}</span>{page===item.id&&<span className="nav-active-dot"/>}</button>;})}</nav><div className="sidebar-bottom"><div className="sidebar-tip"><div className="tip-icon"><Heart size={16}/></div><strong>Keep it genuine.</strong><p>The right words start with good intentions.</p></div><button className="user-mini" onClick={()=>go("profile")}><div className="mini-avatar">{(name||"A").charAt(0).toUpperCase()}</div><div><strong>{name||"Your profile"}</strong><small>Free demo plan</small></div><Settings size={16}/></button></div></aside>
    {mobileMenu&&<button className="mobile-overlay" onClick={()=>setMobileMenu(false)} aria-label="Close menu"/>}
    <main className="main-area"><header className="topbar"><button className="mobile-menu-btn" onClick={()=>setMobileMenu(true)}><Menu/></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>{current?.label||"Home"}</strong></div><div className="topbar-right"><span className="demo-status"><span/> DEMO MODE</span><button className="top-avatar" onClick={()=>go("profile")}>{(name||"A").charAt(0).toUpperCase()}</button></div></header>{page==="home"?renderHome():page==="chat"?renderChat():page==="studio"?renderStudio():page==="analyser"?renderAnalyser():page==="academy"?renderAcademy():renderProfile()}<footer className="app-footer"><span>© 2026 CHARM AI</span><span>Built for genuine connection <Heart size={12}/></span></footer></main>
  </div>;
}

export default App;