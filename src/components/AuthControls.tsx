import {useState} from 'react';
import {Link} from 'react-router-dom';
import {supabase} from '@/integrations/supabase/client';
import SocialIcon from './SocialIcon';
import {Spinner} from './shared';
import {Button} from './ui/button';
import {toast} from 'sonner';
import {authErrorMessage} from '@/lib/auth-errors';

export function Consent({checked,onChange}:{checked:boolean;onChange:(value:boolean)=>void}){
  return <div className="flex items-start gap-2.5 text-[11px] leading-5 text-muted-foreground"><input id="auth-consent" aria-label="Agree to Terms and Privacy Policy" type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-cyan-400"/><div><label htmlFor="auth-consent">I agree to the </label><Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></div></div>;
}
export function Social({disabled}:{disabled:boolean}){
  const [busy,setBusy]=useState(false);
  const signIn=async()=>{
    if(disabled||busy)return;
    setBusy(true);
    try{const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:new URL('/auth/callback',window.location.origin).href}});if(error)throw error;}
    catch(error){toast.error(authErrorMessage(error));setBusy(false);}
  };
  return <><div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-border/60"/><span className="text-[11px] uppercase text-muted-foreground">Or continue with</span><span className="h-px flex-1 bg-border/60"/></div><Button type="button" variant="outline" disabled={disabled||busy} className="h-11 w-full gap-2.5 rounded-xl border-border bg-background text-sm font-medium hover:border-primary/40 hover:bg-secondary disabled:opacity-40" onClick={signIn}>{busy?<Spinner/>:<SocialIcon provider="google"/>}Continue with Google</Button></>;
}
