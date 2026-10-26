import {FormEvent, useState} from 'react';
import {Field} from './admin-fields';
import {PrimaryButton, Spinner} from './shared';
import {api} from '@/lib/platform';
import {toast} from 'sonner';

export default function AdminEditor({fields, initial, table, nested=false, onSaved}:{fields:Field[];initial:Record<string,any>;table:string;nested?:boolean;onSaved:()=>void}) {
  const [values,setValues]=useState<Record<string,any>>(()=>{const value={...(nested?initial.data:initial)};if(typeof value.social_links==='object')value.social_links=JSON.stringify(value.social_links,null,2);return value;});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const submit=async(e:FormEvent)=>{
    e.preventDefault();setBusy(true);setError('');
    try {
      const data:Record<string,any>={};
      for(const field of fields){const v=values[field.key];data[field.key]=field.type==='boolean'?!!v:field.type==='number'?(v===''||v==null?null:Number(v)):v??'';}
      if(table==='site_settings'){data.social_links=data.social_links?JSON.parse(data.social_links):{};if(!data.social_links||typeof data.social_links!=='object'||Array.isArray(data.social_links))throw new Error('Social links must be a JSON object.');data.currency_label='LKR';}
      if(table==='products'&&(data.regular_price<=0||(data.sale_price!==null&&(data.sale_price<=0||data.sale_price>=data.regular_price))))throw new Error('Regular price must be positive. A sale price must be lower than the regular price.');
      await api({action:'save',table,data:nested?{id:initial.id,data}:{...data,...(initial.id?{id:initial.id}:{})}},true);
      toast.success('Changes saved');onSaved();
    } catch(e){setError((e as Error).message);}finally{setBusy(false);}
  };
  return <form onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">{fields.map(f=><div key={f.key} className={f.type==='textarea'?'sm:col-span-2':''}><label htmlFor={`admin-${f.key}`} className="label text-xs">{f.label}{f.required?' *':''}</label>{f.type==='boolean'?<label className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-xs"><input id={`admin-${f.key}`} type="checkbox" checked={!!values[f.key]} onChange={e=>setValues(v=>({...v,[f.key]:e.target.checked}))} className="accent-cyan-400"/>{values[f.key]?'Enabled':'Disabled'}</label>:f.type==='select'?<select id={`admin-${f.key}`} className="field" value={values[f.key]??f.options?.[0]} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}>{f.options?.map(o=><option key={o}>{o}</option>)}</select>:f.type==='textarea'?<textarea id={`admin-${f.key}`} className="field min-h-28" value={values[f.key]??''} required={f.required} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}/>:<input id={`admin-${f.key}`} className="field" type={f.type==='number'?'number':'text'} step={f.type==='number'?'0.01':undefined} value={values[f.key]??''} required={f.required} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}/>}</div>)}</div>{error&&<p role="alert" className="text-xs text-red-400">{error}</p>}<PrimaryButton type="submit" disabled={busy} className="w-full">{busy&&<Spinner/>}Save changes</PrimaryButton></form>;
}
