import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import App from "./App.jsx";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function AuthGate() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState("choices");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    let alive = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
      setSession(nextSession);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const googleSignIn = async () => {
    setBusy(true); setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (authError) { setError(authError.message); setBusy(false); }
  };

  const [confirmationPending, setConfirmationPending] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  const emailAuth = async (event) => {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const cleanEmail = email.trim().toLowerCase();
      const result = mode === "signup"
        ? await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: { emailRedirectTo: window.location.origin }
          })
        : await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (result.error) {
        setError(result.error.message);
        return;
      }
      if (mode === "signup" && !result.data.session) {
        setConfirmationPending(true);
        setMessage("Your account request was received. Check your inbox and Spam folder for the confirmation email. After confirming, return here and sign in.");
        setMode("login");
      } else if (result.data.session) {
        setConfirmationPending(false);
        setMessage("You're signed in. Welcome to CharmAI.");
      }
    } catch (err) {
      setError("Connection problem. Check your internet and try again.");
    } finally {
      setBusy(false);
    }
  };

  const sendPasswordReset = async () => {
    if (!supabase || !email.trim()) { setError("Enter your account email first."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: window.location.origin });
      if (resetError) setError(resetError.message);
      else setMessage("If an account exists for this email, a password reset link has been sent. Check your inbox and Spam folder.");
    } catch { setError("Could not send the reset email. Check your connection and try again."); }
    finally { setBusy(false); }
  };

  const saveNewPassword = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) setError(updateError.message);
      else { setRecoveryMode(false); setPassword(""); setMessage("Password updated successfully."); }
    } catch { setError("Could not update your password. Open the latest reset link and try again."); }
    finally { setBusy(false); }
  };

  const resendConfirmation = async () => {
    if (!supabase || !email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setBusy(true); setError(""); setMessage("");
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: window.location.origin }
      });
      if (resendError) setError(resendError.message);
      else setMessage("If this account still needs confirmation, a new email has been requested. Check Inbox, Spam and Promotions.");
    } catch (err) {
      setError("Could not request another email. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => { if (supabase) await supabase.auth.signOut(); };

  if (checking) return <div className="splash-screen"><div className="splash-logo"><span>C</span><i>✦</i></div><div className="splash-brand">Charm<span>AI</span></div><div className="splash-tagline">YOUR AI WINGMAN</div><div className="splash-loader"><span/></div><div className="splash-status">PREPARING YOUR NEXT GREAT CONVERSATION</div></div>;

  if (session && !recoveryMode) return <App authUser={session.user} onSignOut={signOut} />;

  const styles = { page:{minHeight:"100svh",display:"grid",placeItems:"center",padding:"28px 18px",background:"radial-gradient(ellipse at 50% 0%,#39205f 0%,#1d1235 38%,#100b20 78%)",color:"#f8f5ff",fontFamily:"inherit"}, card:{width:"min(100%,440px)",padding:"32px 25px",border:"1px solid #ffffff1c",borderRadius:24,background:"linear-gradient(145deg,#211832,#171124)",boxShadow:"0 24px 90px #0006"}, button:{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid #ffffff24",background:"#ffffff0b",color:"#fff",fontWeight:700,fontSize:14,marginTop:12,display:"flex",alignItems:"center",justifyContent:"center",gap:10}, input:{width:"100%",padding:"14px",borderRadius:10,border:"1px solid #ffffff24",background:"#100b20",color:"#fff",fontSize:14,marginTop:8,outline:"none"}, link:{border:0,background:"none",color:"#d2b6ff",fontWeight:700,padding:"10px 4px",cursor:"pointer"}, primary:{width:"100%",padding:"14px",border:0,borderRadius:12,background:"linear-gradient(100deg,#8955f5,#c34be2 65%,#f04aa9)",color:"#fff",fontWeight:800,fontSize:14,marginTop:18}};
  return <div style={styles.page}><div style={styles.card}>
    <div style={{textAlign:"center",marginBottom:28}}>
      <div className="splash-logo" style={{width:76,height:76,borderRadius:24,margin:"0 auto 18px"}}><span style={{fontSize:58}}>C</span><i>✦</i></div>
      <div style={{fontSize:27,fontWeight:800,letterSpacing:2}}>Charm<span style={{color:"#d2b6ff"}}>AI</span></div>
      <div style={{fontSize:10,letterSpacing:3,color:"#c8b6e8",marginTop:8}}>YOUR AI WINGMAN</div>
      <h1 style={{fontSize:25,margin:"28px 0 8px"}}>{mode==="choices"?"Welcome to your new favourite wingman.":mode==="signup"?"Create your account.":"Welcome back."}</h1>
      <p style={{fontSize:13,lineHeight:1.6,color:"#b6a9ca",margin:0}}>{mode==="choices"?"Sign in to save your CharmAI experience and pick up where you left off.":"Your next great conversation starts here."}</p>
    </div>
    {recoveryMode ? <form onSubmit={saveNewPassword}><label style={{display:"block",fontSize:12,fontWeight:700,marginTop:15}}>New password</label><input style={styles.input} type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/><button style={styles.primary} disabled={busy}>{busy?"Saving...":"Update password"}</button>{message&&<p role="status" style={{color:"#9be8c1",fontSize:12}}>{message}</p>}{error&&<p role="alert" style={{color:"#ffb2c2",fontSize:12}}>{error}</p>}</form> : !supabase ? <div style={{padding:15,borderRadius:12,background:"#ffb84d12",border:"1px solid #ffb84d55",color:"#ffd59b",fontSize:13,lineHeight:1.6}}>Authentication setup is not finished yet. Add <b>VITE_SUPABASE_URL</b> and <b>VITE_SUPABASE_ANON_KEY</b> to the Vercel project, then redeploy. Your sign-in screen is ready, but sign-in cannot work until this is connected.</div> : <>
      {mode==="choices" ? <>
        <button style={{...styles.button,background:"#fff",color:"#241b30",border:0}} onClick={googleSignIn} disabled={busy}><span style={{fontWeight:900,fontSize:17}}>G</span>{busy?"Connecting...":"Continue with Google"}</button>
        <button style={styles.button} onClick={()=>{setMode("login");setError("");}}>✉ Continue with Email</button>
        <p style={{fontSize:11,color:"#988ba9",textAlign:"center",lineHeight:1.6,marginTop:22}}>By continuing, you agree to use CharmAI respectfully. CharmAI is for adults aged 18+.</p>
      </> : <form onSubmit={emailAuth}>
        <label style={{display:"block",fontSize:12,fontWeight:700,marginTop:15}}>Email address</label>
        <input style={styles.input} type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
        <label style={{display:"block",fontSize:12,fontWeight:700,marginTop:16}}>Password</label>
        <input style={styles.input} type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/>
        <button style={styles.primary} disabled={busy}>{busy?"Please wait...":mode==="signup"?"Create account":"Sign in"}</button>
        {mode==="login"&&<button type="button" style={{...styles.link,display:"block",margin:"8px auto"}} onClick={sendPasswordReset} disabled={busy}>Forgot password? Send reset link</button>}
        <button type="button" style={{...styles.button,marginTop:10}} onClick={()=>{setMode("choices");setError("");}}>Back to sign-in options</button>
        <p style={{textAlign:"center",fontSize:12,color:"#b6a9ca"}}>{mode==="signup"?"Already have an account?":"New to CharmAI?"} <button type="button" style={styles.link} onClick={()=>{setMode(mode==="signup"?"login":"signup");setError("");setMessage("");}}>{mode==="signup"?"Sign in":"Create account"}</button></p>
      </form>}
      {message&&<p role="status" style={{color:"#9be8c1",fontSize:12,lineHeight:1.5}}>{message}</p>}
      {confirmationPending&&<button type="button" style={styles.button} onClick={resendConfirmation} disabled={busy}>{busy?"Sending...":"Resend confirmation email"}</button>}
      {error&&<p role="alert" style={{color:"#ffb2c2",fontSize:12,lineHeight:1.5}}>{error}</p>}
    </>}
    <div style={{textAlign:"center",marginTop:25,color:"#756987",fontSize:10,letterSpacing:1}}>CONFIDENCE · CONNECTION · YOUR STYLE</div>
  </div></div>;
}
