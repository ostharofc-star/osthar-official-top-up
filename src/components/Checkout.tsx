import {useEffect,useState,useRef,FormEvent} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useQueryClient} from '@tanstack/react-query';
import {ShieldCheck,CheckCircle2,Wallet,ArrowRight} from 'lucide-react';
import {api,CartItem,money,useBalance,usePlatform} from '@/lib/platform';
import {PrimaryButton,Spinner} from './shared';
import {toast} from 'sonner';

export default function Checkout({items,onSuccess}:{items:CartItem[];onSuccess?:()=>void}){
  const {session}=usePlatform();
  const {data:balance=0}=useBalance();
  const requestId=useRef(crypto.randomUUID());
  const [uid,setUid]=useState('');
  const [player,setPlayer]=useState<{uid:string;name:string}|null>(null);
  const [whatsapp,setWhatsapp]=useState(session?.user.user_metadata.whatsapp_number||'');
  const [note,setNote]=useState('');
  const [busy,setBusy]=useState(false);
  const [verifying,setVerifying]=useState(false);
  const [error,setError]=useState('');
  const [verifyError,setVerifyError]=useState('');
  const [retry,setRetry]=useState(0);
  const query=useQueryClient();
  const navigate=useNavigate();
  const total=items.reduce((s,i)=>s+(i.product.sale_price??i.product.regular_price)*i.quantity,0);
  const validUid=/^\d{6,15}$/.test(uid);
  const verified=player?.uid===uid;

  useEffect(()=>{
    let active=true;
    setPlayer(null);
    setVerifyError('');
    setVerifying(false);
    if(!session||!/^\d{6,15}$/.test(uid))return;
    const timer=setTimeout(async()=>{
      setVerifying(true);
      try{
        const data=await api({action:'verify',uid});
        if(active)setPlayer({uid,name:data.name});
      }catch(e){if(active)setVerifyError((e as Error).message);}
      finally{if(active)setVerifying(false);}
    },650);
    return()=>{active=false;clearTimeout(timer);};
  },[uid,retry,session?.user.id]);

  const submit=async(e:FormEvent)=>{
    e.preventDefault();
    if(busy||verifying||!verified)return;
    setBusy(true);
    setError('');
    try{
      const data=await api({action:'checkout',request_id:requestId.current,items:items.map(i=>({product_id:i.product.id,quantity:i.quantity})),uid,whatsapp,note});
      query.invalidateQueries({queryKey:['balance']});
      query.invalidateQueries({queryKey:['orders']});
      toast.success('Order placed. Your next upgrade is on its way!');
      onSuccess?.();
      navigate(`/orders/${data.orders[0]}`);
    }catch(e){setError((e as Error).message);}
    finally{setBusy(false);}
  };
  if(!session)return <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center"><ShieldCheck className="mx-auto mb-3 text-primary"/><h3 className="font-semibold">Your next win is one login away.</h3><p className="mb-5 mt-3 text-xs text-muted-foreground">Sign in to verify your player and pay securely with your wallet.</p><PrimaryButton asChild><Link to="/login">Login to continue <ArrowRight size={15}/></Link></PrimaryButton></div>;
  return <form onSubmit={submit} className="space-y-5">
    <div className="flex items-center gap-2 border-b border-border pb-4 text-sm font-semibold"><ShieldCheck size={17} className="text-primary"/>Secure wallet checkout</div>
    <div>
      <label htmlFor="player-uid" className="label">Player UID <span className="text-primary">*</span></label>
      <div className="flex gap-2">
        <input id="player-uid" required inputMode="numeric" pattern="[0-9]{6,15}" maxLength={15} value={uid} disabled={busy} aria-describedby="player-uid-help" onChange={e=>{setUid(e.target.value.trim());setPlayer(null);setVerifyError('');}} className="field min-w-0" placeholder="Enter your Free Fire UID"/>
        <PrimaryButton type="button" className="h-auto px-4 text-xs" disabled={verifying||busy||!validUid} onClick={()=>setRetry(value=>value+1)}>{verifying?<Spinner/>:verified?'Recheck':'Verify'}</PrimaryButton>
      </div>
      <p id="player-uid-help" className="mt-2 text-[10px] text-muted-foreground">Automatically verifies after you finish typing. Singapore server only.</p>
      <div aria-live="polite">
        {verifying&&<p className="mt-3 flex items-center gap-2 text-xs text-primary"><Spinner/>Checking player UID…</p>}
        {verified&&player&&<p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-400"><CheckCircle2 size={15}/>{player.name} · Singapore verified</p>}
      </div>
      {verifyError&&<p role="alert" className="mt-2 text-xs leading-6 text-red-400">{verifyError}</p>}
    </div>
    <div><label htmlFor="whatsapp" className="label">WhatsApp number <span className="text-primary">*</span></label><input id="whatsapp" required type="tel" pattern="\+[0-9]{8,15}" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="field" placeholder="+94771234567"/><p className="mt-2 text-[10px] text-muted-foreground">Include your country code. Used for delivery updates.</p></div>
    <div><label htmlFor="order-note" className="label">Order note <span className="text-muted-foreground">(optional)</span></label><textarea id="order-note" maxLength={1000} rows={2} value={note} onChange={e=>setNote(e.target.value)} className="field resize-none" placeholder="Anything we should know?"/></div>
    <div className="flex justify-between rounded-xl bg-background p-3 text-xs"><span className="flex items-center gap-2 text-muted-foreground"><Wallet size={14}/>Wallet balance</span><Link to="/wallet" className="font-semibold text-primary">{money(balance)}</Link></div>
    {balance<total&&<p className="text-xs text-amber-300">Not enough funds. <Link to="/wallet/topup" className="underline">Top up your wallet</Link> to continue.</p>}
    {error&&<p role="alert" className="text-xs leading-6 text-red-400">{error}</p>}
    <PrimaryButton type="submit" className="w-full" disabled={busy||verifying||!verified||balance<total||!items.length}>{busy?<Spinner/>:<Wallet size={15}/>}Pay {money(total)}</PrimaryButton>
    <p className="text-center text-[9px] leading-5 text-muted-foreground">Your UID is re-verified on submit. Prices and wallet balance are checked securely on our server.</p>
  </form>;
}
