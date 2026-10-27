import {useEffect,useState,FormEvent} from 'react';
import {Link,useNavigate,useSearchParams} from 'react-router-dom';
import {ArrowLeft,Mail} from 'lucide-react';
import {supabase} from '@/integrations/supabase/client';
import {PrimaryButton,Spinner} from '@/components/shared';
import AuthEmailLogin from '@/components/AuthEmailLogin';
import {Consent,Social} from '@/components/AuthControls';
import {authErrorMessage} from '@/lib/auth-errors';
import {usePlatform} from '@/lib/platform';
import {toast} from 'sonner';

type Mode='login'|'register'|'forgot'|'reset'|'otp';
export default function AuthPage({mode='login'}:{mode?:Mode}){
  const {session,loading}=usePlatform();const navigate=useNavigate();const [params]=useSearchParams();
  const [consent,setConsent]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [email,setEmail]=useState(params.get('email')||'');const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [name,setName]=useState('');const [whatsapp,setWhatsapp]=useState('');const [otp,setOtp]=useState('');const [sent,setSent]=useState(false);const [cooldown,setCooldown]=useState(0);const [recovering,setRecovering]=useState(mode==='reset'&&params.has('code'));
  useEffect(()=>{if(mode!=='reset')return;const code=new URLSearchParams(window.location.search).get('code');const hash=new URLSearchParams(window.location.hash.slice(1));const linkError=hash.get('error_description')||params.get('error_description');if(linkError){setError(linkError);setRecovering(false);return;}if(code){supabase.auth.exchangeCodeForSession(code).then(({error})=>{if(error)setError(authErrorMessage(error));else window.history.replaceState({},'',window.location.pathname);}).catch(e=>setError(authErrorMessage(e))).finally(()=>setRecovering(false));}},[mode,params]);
  useEffect(()=>{if(session&&!loading&&['login','register','otp'].includes(mode))navigate(sessionStorage.getItem('osthar-recovery')?'/reset-password':'/',{replace:true});},[session,loading,mode,navigate]);
  useEffect(()=>{if(cooldown<=0)return;const timer=setTimeout(()=>setCooldown(c=>c-1),1000);return()=>clearTimeout(timer);},[cooldown]);
  const resend=async()=>{if(busy||cooldown)return;setError('');setBusy(true);try{const {error}=await supabase.auth.resend({type:'signup',email:email.trim(),options:{emailRedirectTo:new URL('/auth/callback',window.location.origin).href}});if(error)throw error;setCooldown(60);toast.success('Confirmation email sent. Check your inbox and spam folder.');}catch(e){setError(authErrorMessage(e));}finally{setBusy(false);}};
  const submit=async(e:FormEvent)=>{
    e.preventDefault();if(busy)return;setError('');if(mode==='register'&&!consent){setError('Please agree to the Terms & Conditions and Privacy Policy.');return;}setBusy(true);
    try{
      if(mode==='register'){
        if(password!==confirm)throw new Error('Passwords do not match.');if(password.length<8)throw new Error('Use at least 8 characters.');
        if(whatsapp.trim()&&!/^\+\d{8,15}$/.test(whatsapp.trim()))throw new Error('WhatsApp should include country code, e.g. +94771234567.');
        const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:new URL('/auth/callback',window.location.origin).href,data:{full_name:name.trim(),whatsapp_number:whatsapp.trim()}}});if(error)throw error;
        if(data.session){toast.success('Account created');navigate('/',{replace:true});}else navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      }else if(mode==='forgot'){
        const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:new URL('/reset-password',window.location.origin).href});if(error)throw error;setSent(true);
      }else if(mode==='reset'){
        if(!session)throw new Error('Open the latest password reset link from your email first.');if(password.length<8)throw new Error('Use at least 8 characters.');if(password!==confirm)throw new Error('Passwords do not match.');
        const {error}=await supabase.auth.updateUser({password});if(error)throw error;sessionStorage.removeItem('osthar-recovery');toast.success('Password updated');navigate('/',{replace:true});
      }else if(mode==='otp'){
        const {error}=await supabase.auth.verifyOtp({email:email.trim(),token:otp.trim(),type:'signup'});if(error)throw error;toast.success('Email verified');navigate('/',{replace:true});
      }
    }catch(e){setError(authErrorMessage(e));}finally{setBusy(false);}
  };
  const title={login:'Welcome back.',register:'Create your account.',forgot:'Forgot your password?',reset:'Choose a new password.',otp:'Check your inbox.'}[mode];
  return <div className="grid-bg min-h-[calc(100svh-66px)] px-4 py-12 sm:py-16"><div className="mx-auto w-full max-w-[450px]"><div className="mb-8 text-center"><Link to="/" aria-label="OSTHAR TOP UP home" className="mx-auto mb-5 block w-fit"><img src="/assets/osthar-logo.png" alt="OSTHAR TOP UP" className="h-[60px] w-[60px] rounded-full object-contain"/></Link><h1 className="text-[28px] font-bold tracking-tight sm:text-[30px]"><span className="text-primary">OSTHAR</span> <span className="text-violet-400">TOP UP</span></h1><p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{mode==='login'?'Welcome back! Log in to your account.':mode==='register'?'Create your account and start gaming.':title}</p></div><div className="rounded-2xl border border-primary/20 bg-card/95 p-6 shadow-[0_0_24px_hsl(var(--primary)/0.04)] sm:p-8">
    {mode==='login'?<><AuthEmailLogin disabled={!consent}/><Consent checked={consent} onChange={setConsent}/><Social disabled={!consent}/><p className="mt-7 text-center text-sm text-muted-foreground">Don’t have an account? <Link to="/register" className="font-semibold text-primary hover:underline">Register</Link></p></>:<form onSubmit={submit} className="space-y-4"><fieldset disabled={busy||recovering} className="space-y-4">
      {['register','forgot','otp'].includes(mode)&&<div><label htmlFor="auth-email" className="label">Email address</label><input id="auth-email" required type="email" autoComplete="email" className="field" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>}
      {mode==='register'&&<><div><label htmlFor="auth-name" className="label">Full name <span className="text-muted-foreground">(optional)</span></label><input id="auth-name" className="field" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div><div><label htmlFor="auth-whatsapp" className="label">WhatsApp <span className="text-muted-foreground">(optional)</span></label><input id="auth-whatsapp" type="tel" autoComplete="tel" className="field" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+94771234567"/></div></>}
      {['register','reset'].includes(mode)&&<><div><label htmlFor="auth-password" className="label">Password</label><input id="auth-password" required minLength={8} type="password" autoComplete="new-password" className="field" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></div><div><label htmlFor="auth-confirm" className="label">Confirm password</label><input id="auth-confirm" required minLength={8} type="password" autoComplete="new-password" className="field" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter your password"/></div></>}
      {mode==='otp'&&<div><label htmlFor="auth-otp" className="label">Email verification code</label><input id="auth-otp" required className="field text-center tracking-[.3em]" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Email OTP"/></div>}
      {mode==='register'&&<Consent checked={consent} onChange={setConsent}/>}</fieldset>
      {error&&<p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs leading-6 text-red-400">{error}</p>}
      {mode==='reset'&&!loading&&!session&&!recovering&&!error&&<p className="text-xs leading-6 text-amber-300">Open the latest reset link from your inbox to set a new password. <Link to="/forgot-password" className="underline">Request a new link</Link>.</p>}
      {sent&&<p role="status" className="rounded-xl bg-primary/5 p-3 text-xs leading-6 text-primary">If an account exists for this address, a reset email will arrive shortly. Check your inbox and spam folder.</p>}
      <PrimaryButton type="submit" className="w-full" disabled={busy||recovering||(mode==='register'&&!consent)||(mode==='reset'&&!session)}>{(busy||recovering)&&<Spinner/>}{mode==='register'?'Create account':mode==='forgot'?'Send reset link':mode==='reset'?'Update password':'Verify email'}</PrimaryButton>
      {mode==='otp'&&<button type="button" disabled={busy||cooldown>0||!email.trim()} onClick={resend} className="flex w-full items-center justify-center gap-2 py-2 text-xs text-primary disabled:opacity-40"><Mail size={14}/>{cooldown?`Resend available in ${cooldown}s`:'Resend confirmation email'}</button>}
      {mode==='register'&&<Social disabled={!consent||busy}/>}<Link to="/login" className="flex justify-center gap-2 pt-3 text-xs text-muted-foreground"><ArrowLeft size={13}/>Back to sign in</Link>
    </form>}
    </div></div></div>;
}
export function AuthCallback(){const navigate=useNavigate();const [error,setError]=useState('');useEffect(()=>{let active=true;const run=async()=>{try{const p=new URLSearchParams(window.location.search);const hash=new URLSearchParams(window.location.hash.slice(1));const callbackError=p.get('error_description')||hash.get('error_description');if(callbackError)throw new Error(callbackError);const recovery=p.get('type')==='recovery'||hash.get('type')==='recovery'||!!sessionStorage.getItem('osthar-recovery');const code=p.get('code');if(code){const {error}=await supabase.auth.exchangeCodeForSession(code);if(error)throw error;}const {data,error}=await supabase.auth.getSession();if(error)throw error;if(!data.session)throw new Error('No session found. Please sign in again or request a new confirmation link.');if(active)navigate(recovery?'/reset-password':'/',{replace:true});}catch(e){if(active)setError(authErrorMessage(e));}};run();return()=>{active=false;};},[navigate]);return <div className="container-page py-20 text-center">{error?<><p role="alert" className="text-red-400">{error}</p><Link to="/login" className="mt-5 block text-primary">Back to login</Link></>:<div className="flex justify-center gap-3 text-sm"><Spinner/>Completing secure sign in…</div>}</div>}
