import {Link} from 'react-router-dom';
import {ArrowRight,Wallet,UserPlus,ShoppingBag,Smartphone,Landmark,Shield,BadgeCheck,Package,Zap,MessageCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {PrimaryButton,Reveal} from '@/components/shared';

function Heading({label,title,description}:{label:string;title:React.ReactNode;description?:string}){
  return <div className="mb-12 text-center sm:mb-16"><p className="eyebrow mb-3">{label}</p><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2><div className="mx-auto mt-5 h-0.5 w-12 bg-primary/50"/>{description&&<p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>}</div>;
}
const steps=[
  {icon:UserPlus,title:'Create Account & Recharge',text:'Register your account and top up your wallet securely via eZ Cash or Bank Transfer.',link:'/register'},
  {icon:ShoppingBag,title:'Select & Order Product',text:'Browse the store, verify your Free Fire player ID, and place your order with wallet balance.',link:'/store'},
  {icon:Wallet,title:'Fast Admin Delivery',text:'Our admin team processes and delivers your top-up quickly with real-time order tracking.',link:'/orders'},
];
const advantages=[
  {icon:Shield,title:'Secure Wallet System',text:'A secure wallet with a clear history of every transaction.'},
  {icon:BadgeCheck,title:'Verified Player Details',text:'Player UID verification ensures accurate delivery'},
  {icon:Package,title:'Easy Order Tracking',text:'Track your orders from pending to completion'},
  {icon:Zap,title:'Fast Admin Processing',text:'Quick approval and order processing'},
  {icon:Smartphone,title:'Mobile-Friendly Service',text:'Optimized for all devices and screen sizes'},
  {icon:MessageCircle,title:'WhatsApp Support',text:'Get help via WhatsApp from our support team'},
];
export default function Index(){return <>
  <section className="relative overflow-hidden border-b border-border/50">
    <div className="grid-bg pointer-events-none absolute inset-0"/>
    <div className="container-page relative py-16 sm:py-24 lg:min-h-[596px]">
      <div className="hero-entrance"><span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>Trusted by gamers nationwide</span>
      <h1 className="mt-6 text-[38px] font-extrabold leading-[1.05] tracking-[-.045em] sm:text-[56px]">Fast &amp; Secure<span className="mt-1 block text-primary">Gaming <span className="text-violet-400">Top-Ups</span></span></h1>
      <p className="mt-6 max-w-[620px] text-base leading-7 text-muted-foreground sm:text-lg">Recharge your wallet and purchase gaming products instantly.<br className="hidden sm:block"/> Verified player IDs, secure transactions, and fast admin processing.</p>
      <div className="mt-8 flex flex-wrap gap-3"><PrimaryButton asChild className="h-12 gap-4 px-8 text-sm"><Link to="/store">Shop Now<ArrowRight size={16}/></Link></PrimaryButton><Button asChild variant="outline" className="motion-button h-12 gap-3 rounded-xl border-border bg-card/60 px-8 text-sm hover:bg-secondary"><Link to="/wallet/topup"><Wallet size={16}/>Recharge Wallet</Link></Button></div>
      <div className="mt-10 flex gap-7 sm:gap-8">{[['24/7','Support'],['100%','Secure'],['Instant','Delivery']].map(([value,label],i)=><div key={label} className={i?'border-l border-border pl-7 sm:pl-8':''}><p className="text-xl font-bold">{value}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p></div>)}</div></div>
    </div>
  </section>
  <div className="overflow-hidden border-b border-border/50 bg-card/40 py-3.5" aria-label="OSTHAR TOP UP"><div className="flex w-max gap-12">{Array.from({length:12},(_,i)=><span key={i} aria-hidden="true" className="whitespace-nowrap text-sm font-bold tracking-[.3em] text-slate-500">OSTHAR TOP UP<span className="ml-7 text-primary/50">·</span></span>)}</div></div>
  <div className="container-page">
    <Reveal className="py-20 sm:py-20"><Heading label="What We Support" title={<>Supported <span className="text-primary">Games</span></>}/><div className="mx-auto grid max-w-[512px] grid-cols-2 gap-4 sm:gap-6">{['Free Fire','Free Fire MAX'].map(game=><Link key={game} to={`/store?game=${encodeURIComponent(game)}`} className="motion-card group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card"><img src={game==='Free Fire MAX'?'/assets/free-fire-max.png':'/assets/free-fire.png'} alt={game} className="h-full w-full object-cover"/><span className="absolute inset-x-0 bottom-0 bg-card/95 p-4 text-center text-sm font-bold">{game}</span></Link>)}</div></Reveal>
    <Reveal className="py-16 sm:py-20"><Heading label="Simple Process" title="How It Works" description="Get your gaming top-ups delivered in three simple steps"/><div className="mx-auto grid max-w-[1024px] gap-6 md:grid-cols-3">{steps.map((step,i)=><Link to={step.link} key={step.title} className="motion-card relative rounded-2xl border border-border/60 bg-card p-8 md:translate-y-[var(--offset)]" style={{'--offset':`${i*12}px`} as React.CSSProperties}><span className="absolute right-6 top-3 text-5xl font-extrabold text-primary/10">0{i+1}</span><div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary"><step.icon size={26}/></div><h3 className="text-lg font-semibold leading-6">{step.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p></Link>)}</div></Reveal>
    <Reveal className="py-16 sm:py-24"><Heading label="Easy Top-Ups" title="Payment Methods" description="Choose from our convenient payment options to recharge your wallet"/><div className="mx-auto grid max-w-[768px] gap-6 sm:grid-cols-2">{[{icon:Smartphone,title:'eZ Cash',text:'Quick and easy mobile payment via eZ Cash. Upload your receipt and get your wallet credited after admin approval.'},{icon:Landmark,title:'Bank Transfer',text:'Transfer to our bank account and upload the receipt. Your wallet will be credited after admin verification.'}].map(item=><Link key={item.title} to="/wallet/topup" className="motion-card rounded-2xl border border-border/60 bg-card p-8 text-center"><div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary"><item.icon size={26}/></div><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p></Link>)}</div></Reveal>
    <Reveal className="pb-20 pt-16 sm:pb-32 sm:pt-20"><Heading label="Our Advantages" title="Why Choose Us" description="We provide a premium gaming top-up experience you can trust"/><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{advantages.map(item=><div key={item.title} className="motion-card flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-6"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary"><item.icon size={20}/></div><div><h3 className="text-base font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p></div></div>)}</div></Reveal>
  </div>
</>;}
