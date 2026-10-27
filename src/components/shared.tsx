import {ReactNode,useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion,useInView,animate} from 'framer-motion';
import {Link} from 'react-router-dom';
import {ArrowUpRight,Diamond,ShoppingCart,PackageOpen,Loader2,Zap} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Product,money,usePlatform,useSettings} from '@/lib/platform';
import {toast} from 'sonner';

export const ease=[.22,1,.36,1] as const;

export function Reveal({children,className='',delay=0}:{children:ReactNode;className?:string;delay?:number}){
  const reduced=useReducedMotion();
  return <motion.div initial={reduced?false:{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-60px'}} transition={{duration:.6,ease,delay}} className={className}>{children}</motion.div>
}

export function Brand({small=false,large=false}:{small?:boolean;large?:boolean}){
  const {data:settings}=useSettings();
  return <Link to="/" className={`group flex shrink-0 items-center ${large?'flex-col gap-4 text-center':'gap-3'}`} aria-label="OSTHAR TOP UP home">
    <div className="relative">
      <img src={settings?.logo||'/assets/osthar-logo.png'} alt="" width={large?96:48} height={large?96:48} className={`shrink-0 rounded-xl object-cover ${large?'h-24 w-24 shadow-[0_0_40px_rgba(8,217,247,0.5)]':small?'h-12 w-12':'h-14 w-14'}`}/>
      {large&&<span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary/25 ring-2 ring-background ring-offset-2"/>}
    </div>
    <span className={`font-display font-bold leading-tight tracking-tight ${large?'text-[30px] sm:text-[36px]':'text-[18px] sm:text-[22px]'}`}>
      OSTHAR
      <span className={`block mt-1.5 text-primary tracking-[.35em] uppercase ${large?'text-[13px] sm:text-[11px]':'text-[10px]'}`}>TOP UP</span>
    </span>
  </Link>
}

export function PrimaryButton({children,className='',...props}:React.ComponentProps<typeof Button>){
  return <Button className={`h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-none hover:bg-primary/85 ${className}`} {...props}>{children}</Button>
}

export function SectionHeader({eyebrow,title,description,link}:{eyebrow:string;title:string;description?:string;link?:string}){
  return <div className="mb-8 flex items-end justify-between gap-4">
    <div>
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-2xl font-bold tracking-tight sm:text-[30px]">{title}</h2>
      {description&&<p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>}
    </div>
    {link&&<Link to={link} className="hidden items-center gap-2 whitespace-nowrap text-xs font-semibold text-primary sm:flex">View all products <ArrowUpRight size={16/></Link>}
  </div>
}

export function ProductCard({product:p,index=0}:{product:Product;index?:number}){
  const {add}=usePlatform();
  const reduced=useReducedMotion();
  return <Reveal delay={Math.min(index%4*.07,.21)}>
    <motion.div whileHover={reduced||!matchMedia('(hover: hover)').matches?undefined:{y:-5}} transition={{duration:.2,ease}} className="group overflow-hidden rounded-2xl border border-border bg-card">
      <Link to={`/product/${p.id}`} className="relative block aspect-[1.45] overflow-hidden bg-[#0c1421]">
        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover"/>
        <span className="absolute left-3 top-3 rounded-md border border-white/10 bg-background/80 px-2 py-1 text-[9px] font-bold tracking-wider text-white backdrop-blur-md">{p.game.toUpperCase()}</span>
        {p.sale_price&&<span className="absolute right-3 top-3 rounded-md bg-primary px-2 py-1 text-[9px] font-bold text-background">SAVE {Math.round((1-p.sale_price/p.regular_price)*100)}%</span>}
      </Link>
      <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><Diamond size={12} className="text-primary"/> {p.package_type}</span>
          <span className={`flex items-center gap-1 text-[9px] ${p.stock_status==='in_stock'?'text-emerald-400':'text-red-400'}`}>
            <span className="h-1 w-1 rounded-full bg-current"/>{p.stock_status==='in_stock'?'In stock':'Sold out'}
          </span>
        </div>
        <Link to={`/product/${p.id}`}><h3 className="text-sm font-semibold sm:text-base">{p.name}</h3></Link>
        <p className="mt-1.5 text-[10px] text-muted-foreground">Singapore server · Fast delivery</p>
        <div className="mt-4 flex flex-wrap items-baseline gap-2">
          <span className="font-display text-sm font-bold text-primary sm:text-base">{money(p.sale_price??p.regular_price)}</span>
          {p.sale_price&&<span className="text-[10px] text-muted-foreground line-through">{money(p.regular_price)}</span>}
        </div>
        <div className="mt-4 flex gap-2">
          <PrimaryButton className="h-9 flex-1 rounded-lg px-2 text-[11px]" disabled={p.stock_status!=='in_stock'} onClick={()=>{add(p);toast.success(`${p.name} added to cart`);}}>
            <ShoppingCart size={13/>Add to cart
          </PrimaryButton>
          <Button asChild variant="outline" className="h-9 w-9 rounded-lg border-border bg-transparent p-0 hover:bg-secondary">
            <Link to={`/product/${p.id}`} aria-label={`View ${p.name}`}><ArrowUpRight size={15/></Link>
          </Button>
        </div>
      </div>
    </motion.div>
  </Reveal>
}

export function StatusBadge({status}:{status:string}){
  const color=status==='completed'||status==='approved'?'border-emerald-500/20 bg-emerald-500/10 text-emerald-400':status==='cancelled'||status==='rejected'?'border-red-500/20 bg-red-500/10 text-red-400':status==='processing'?'border-purple-400/20 bg-purple-400/10 text-purple-300':'border-amber-400/20 bg-amber-400/10 text-amber-300';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${color}`}>{status}</span>
}

export function EmptyState({title,description,children}:{title:string;description:string;children?:ReactNode}){
  return <div className="panel flex flex-col items-center py-16 text-center">
    <PackageOpen className="mb-5 h-10 w-10 text-muted-foreground"/>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mb-6 mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    {children}
  </div>
}

export function Spinner(){
  return <Loader2 className="h-4 w-4 animate-spin"/>
}

export function PageHeading({label,title,description}:{label:string;title:string;description?:string}){
  return <div className="mb-9">
    <p className="eyebrow mb-3">{label}</p>
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
    {description&&<p className="mt-3 text-sm text-muted-foreground">{description}</p>}
  </div>
}

export function Count({value}:{value:number}){
  const ref=useRef<HTMLSpanElement>(null);
  const view=useInView(ref,{once:true});
  const [n,setN]=useState(0);
  const reduced=useReducedMotion();
  useEffect(()=>{
    if(!view)return;
    if(reduced){setN(value);return;}
    const a=animate(0,value,{duration:1.1,ease,onUpdate:v=>setN(Math.round(v))});
    return()=>a.stop();
  },[view,value,reduced]);
  return <span ref={ref}>{n.toLocaleString()}</span>
}
