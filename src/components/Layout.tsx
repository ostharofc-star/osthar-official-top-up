import {useEffect} from 'react';
import {Link,NavLink,Outlet,useLocation} from 'react-router-dom';
import {ShoppingCart,Wallet,Menu,MessageCircle,LogOut,UserRound,ChevronRight,Mail} from 'lucide-react';
import {motion,useReducedMotion} from 'framer-motion';
import {Sheet,SheetContent,SheetTrigger,SheetClose,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {PrimaryButton,ease} from './shared';
import {useBalance,usePlatform,useSettings,money} from '@/lib/platform';
import {supabase} from '@/integrations/supabase/client';
import {toast} from 'sonner';

function HeaderBrand({iconOnly=false}:{iconOnly?:boolean}){
  return <Link to="/" aria-label="OSTHAR TOP UP home" className="flex shrink-0 items-center gap-2.5"><img src="/assets/placeholder.svg" alt="placeholder" className="h-8 w-8 rounded-full border border-white/80 object-cover"/><span className={`${iconOnly?'hidden md:inline':''} text-base font-bold tracking-tight text-primary`}>OSTHAR <span className="text-violet-400">TOP UP</span></span></Link>;
}
export function Layout(){
  const {session,cart}=usePlatform();
  const {data:balance}=useBalance();
  const {data:settings}=useSettings();
  const location=useLocation();
  const reduced=useReducedMotion();
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});const names:Record<string,string>={'/':'Fast & Secure Gaming Top-Ups','/store':'Store','/wallet':'Wallet','/orders':'Your orders','/login':'Sign in','/register':'Register','/cart':'Your cart'};document.title=`${names[location.pathname]??'Gaming top-ups'} | OSTHAR TOP UP`;},[location.pathname]);
  useEffect(()=>{if(settings?.favicon){const icon=document.querySelector<HTMLLinkElement>('link[rel="icon"]');if(icon)icon.href=settings.favicon;}},[settings?.favicon]);
  const support=()=>{if(settings?.support_whatsapp)window.open(`https://wa.me/${String(settings.support_whatsapp).replace(/\D/g,'')}`,'_blank','noopener,noreferrer');else toast.info('WhatsApp support is being configured. Please check back soon.');};
  const links=[['/','Home'],['/store','Store'],['/wallet','Wallet'],['/orders','Orders']];
  return <>
    <header className="sticky top-0 z-40 border-b border-border/40 bg-card/95 backdrop-blur-xl">
      <div className="container-page flex h-[66px] items-center justify-between gap-3">
        <HeaderBrand iconOnly/>
        <nav className="hidden items-center gap-1 md:flex">{links.map(([url,name])=><NavLink key={url} to={url} end={url==='/'} className={({isActive})=>`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${isActive?'bg-primary/10 text-primary':'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>{name}</NavLink>)}</nav>
        <div className="flex items-center gap-2 md:gap-5">
          <Link to="/wallet" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/30 text-primary hover:bg-primary/10 md:hidden" aria-label="Open wallet"><Wallet size={20}/></Link>
          {session&&<Link to="/wallet" className="hidden items-center gap-2 text-xs text-primary md:flex"><Wallet size={16}/>{money(balance??0)}</Link>}
          <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/30 text-foreground hover:text-primary md:h-8 md:w-8 md:border-0 md:bg-transparent" aria-label="Shopping cart"><ShoppingCart size={20}/>{cart.length>0&&<span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">{cart.reduce((sum,item)=>sum+item.quantity,0)}</span>}</Link>
          {session?<><Link to="/profile" className="hidden text-muted-foreground hover:text-primary md:block" aria-label="Your profile"><UserRound size={18}/></Link><Button variant="ghost" size="icon" className="hidden rounded-xl md:flex" onClick={async()=>{await supabase.auth.signOut();toast.success('Signed out');}} aria-label="Sign out"><LogOut size={17}/></Button></>:<><Link to="/login" className="hidden text-xs hover:text-primary md:block">Login</Link><PrimaryButton asChild className="hidden h-8 rounded-xl px-4 text-xs md:flex"><Link to="/register">Register</Link></PrimaryButton></>}
          <Sheet><SheetTrigger asChild><Button size="icon" variant="outline" className="h-10 w-10 rounded-2xl border-border/70 bg-background/30 text-foreground hover:bg-secondary md:hidden" aria-label="Open menu"><Menu size={20}/></Button></SheetTrigger><SheetContent className="border-border bg-card"><SheetTitle className="sr-only">Store navigation</SheetTitle><SheetDescription className="sr-only">Navigate your store, wallet and account.</SheetDescription><HeaderBrand/><nav className="mt-10 flex flex-col gap-3">{[...links,['/cart','Cart'],...(session?[['/profile','Profile'],['/wallet/history','Wallet history']]:[['/login','Login'],['/register','Register']])].map(([url,name])=><SheetClose asChild key={url}><Link to={url} className="rounded-xl bg-secondary p-4 text-sm transition-colors hover:bg-primary/10 hover:text-primary">{name}</Link></SheetClose>)}{session&&<SheetClose asChild><Button onClick={()=>supabase.auth.signOut()} variant="outline" className="rounded-xl">Sign out</Button></SheetClose>}</nav></SheetContent></Sheet>
        </div>
      </div>
    </header>
    <main><motion.div key={location.pathname} initial={reduced?false:{opacity:0}} animate={{opacity:1}} transition={{duration:.35,ease}}><Outlet/></motion.div></main>
    <footer className="border-t border-border/60 bg-card">
      <div className="container-page grid gap-9 py-12 sm:grid-cols-2 lg:grid-cols-4"><div><HeaderBrand/><p className="mt-5 max-w-[290px] text-sm leading-6 text-muted-foreground">{settings?.footer_text||'Fast & secure gaming top-ups. Recharge your wallet and purchase gaming products instantly.'}</p></div><div><h4 className="mb-4 text-sm font-semibold">Quick Links</h4><div className="flex flex-col gap-3 text-sm text-muted-foreground">{links.map(([url,name])=><Link key={url} to={url} className="hover:text-primary">{name}</Link>)}</div></div><div><h4 className="mb-4 text-sm font-semibold">Payment Methods</h4><div className="space-y-3 text-sm text-muted-foreground"><Link to="/wallet/topup" className="block hover:text-primary">eZ Cash</Link><Link to="/wallet/topup" className="block hover:text-primary">Bank Transfer</Link></div></div><div><h4 className="mb-4 text-sm font-semibold">Support</h4><button onClick={support} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><MessageCircle size={15}/>WhatsApp Support</button>{settings?.support_email&&<a href={`mailto:${settings.support_email}`} className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><Mail size={15}/>Contact Us</a>}</div></div>
      <div className="container-page border-t border-border/60 py-8 text-center text-xs text-muted-foreground"><p>© {new Date().getFullYear()} OSTHAR TOP UP. All rights reserved.</p><div className="mt-4 flex justify-center gap-5 text-[11px]"><Link to="/terms">Terms & Conditions</Link><Link to="/privacy">Privacy Policy</Link><Link to="/admin">Admin <ChevronRight size={10} className="inline"/></Link></div></div>
    </footer>
    <button onClick={support} aria-label="WhatsApp support" className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-600"><MessageCircle size={27}/></button>
  </>;
}
