import {useRef,useState} from 'react';
import {Auth} from '@supabase/auth-ui-react';
import {ThemeSupa} from '@supabase/auth-ui-shared';
import {Eye,EyeOff} from 'lucide-react';
import {Link} from 'react-router-dom';
import {supabase} from '@/integrations/supabase/client';
import './auth-page.css';

export default function AuthEmailLogin({disabled}:{disabled:boolean}){
  const ref=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  const togglePassword=()=>{
    const input=ref.current?.querySelector<HTMLInputElement>('input[name="password"]');
    if(input){input.type=visible?'password':'text';setVisible(!visible);}
  };
  return <>
    <fieldset disabled={disabled} className="min-w-0">
      <div ref={ref} className="osthar-email-auth">
        <Auth
          supabaseClient={supabase}
          providers={[]}
          view="sign_in"
          showLinks={false}
          redirectTo={new URL('/auth/callback',window.location.origin).href}
          theme="dark"
          localization={{variables:{sign_in:{email_label:'Email',password_label:'Password',email_input_placeholder:'you@example.com',password_input_placeholder:'••••••••',button_label:'Login',loading_button_label:'Logging in…'}}}}
          appearance={{
            theme:ThemeSupa,
            variables:{default:{
              colors:{brand:'#08d9f7',brandAccent:'#06b8cf',brandButtonText:'#060a13',inputBackground:'#080d16',inputBorder:'#222d40',inputText:'#f4f7fb',inputLabelText:'#f4f7fb',messageText:'#a8b6cb',messageTextDanger:'#f87171'},
              radii:{borderRadiusButton:'10px',inputBorderRadius:'10px'},
              fonts:{bodyFontFamily:'Inter, sans-serif',buttonFontFamily:'Inter, sans-serif'},
            }},
          }}
        />
      </div>
    </fieldset>
    <div className="mb-5 mt-3 flex items-center justify-between text-xs">
      <button type="button" onClick={togglePassword} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary" aria-pressed={visible}>
        {visible?<EyeOff size={14}/>:<Eye size={14}/>}
        {visible?'Hide password':'Show password'}
      </button>
      <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
    </div>
  </>;
}
