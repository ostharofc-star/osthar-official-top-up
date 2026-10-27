import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.1';
export const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
export const db=()=>createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
export const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json'}});
export async function user(req:Request){const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');if(!token)throw new Error('Unauthorized');const {data,error}=await db().auth.getUser(token);if(error||!data.user)throw new Error('Unauthorized');return data.user;}
export async function hash(value:string){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function admin(token:string){if(typeof token!=='string'||!token||token.length>256)throw new Error('Unauthorized');const {data}=await db().from('admin_sessions').select('expires_at').eq('token_hash',await hash(token)).single();if(!data||new Date(data.expires_at)<new Date())throw new Error('Unauthorized');}
export async function verifyPlayer(uid:string){
  if(!/^\d{6,15}$/.test(uid))throw new Error('Enter a valid numeric Player UID.');
  const url=new URL('https://osthar-top-up.zoroxofc1.workers.dev/');
  url.searchParams.set('uid',uid);
  let response:Response;
  try{response=await fetch(url,{signal:AbortSignal.timeout(10000)});}
  catch(error){console.error('[user-platform] player verification unavailable',String(error));throw new Error('Player verification is temporarily unavailable. Please try again.');}
  if(!response.ok)throw new Error('Unable to verify this UID. Please try again.');
  const data=await response.json();
  if(!data||data.success!==true)throw new Error('Player not found. Check your UID.');
  if(String(data.playerId)!==uid)throw new Error('Player verification returned a different UID. Please try again.');
  const nickname=data.playerName;
  if(typeof data.region!=='string'||!['sg','singapore'].includes(data.region.trim().toLowerCase()))throw new Error('Only verified Singapore accounts are supported.');
  if(typeof nickname!=='string'||!nickname.trim()||nickname.length>100)throw new Error('Player not found. Check your UID and Singapore server.');
  return nickname.trim();
}
export async function deliverNotifications(orderIds:string[]){
  const client=db();
  for(const id of orderIds){
    const {data:events}=await client.from('notification_outbox').select('*').eq('order_id',id).eq('delivered',false);
    const {data:o}=await client.from('orders').select('*').eq('id',id).single();if(!o)continue;
    for(const e of events??[]){
      try{
        if(e.event==='order_created'){
          const webhook=Deno.env.get('DISCORD_WEBHOOK_URL');const bot=Deno.env.get('DISCORD_BOT_TOKEN');const channel=Deno.env.get('DISCORD_CHANNEL_ID');
          if(!webhook&&!(bot&&channel))throw new Error('Discord delivery not configured');
          const payload:Record<string,unknown>={content:'New OSTHAR TOP UP order',allowed_mentions:{parse:[]},embeds:[{title:o.product_name_snapshot,description:`Order: ${o.id}\nQuantity: ${o.quantity}\nPlayer: ${o.verified_player_name} (${o.player_uid})\nServer: Singapore\nTotal: LKR ${(o.product_price_snapshot*o.quantity).toFixed(2)}`,color:581111}]};
          if(bot&&channel)payload.components=[{type:1,components:[{type:2,style:1,label:'Mark processing',custom_id:`osthar:processing:${o.id}`},{type:2,style:3,label:'Mark completed',custom_id:`osthar:completed:${o.id}`}]}];
          const res=await fetch(bot&&channel?`https://discord.com/api/v10/channels/${channel}/messages`:webhook!,{method:'POST',headers:{'Content-Type':'application/json',...(bot&&channel?{Authorization:`Bot ${bot}`}:{})},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)});
          if(!res.ok)throw new Error(`Discord delivery failed (${res.status})`);
        }else{
          const key=Deno.env.get('RESEND_API_KEY'),from=Deno.env.get('EMAIL_FROM');if(!key||!from)throw new Error('Completion email not configured');
          const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`osthar-${e.id}`},body:JSON.stringify({from,to:[o.customer_email],subject:'Your OSTHAR TOP UP order is complete',text:`Your order ${o.id} for ${o.product_name_snapshot} x ${o.quantity} is complete. Player: ${o.verified_player_name}. Thank you!`}),signal:AbortSignal.timeout(10000)});if(!res.ok)throw new Error(`Email delivery failed (${res.status})`);
        }
        await client.from('notification_outbox').update({delivered:true,error:null}).eq('id',e.id);
      }catch(error){console.error('[platform] notification deferred',{event:e.id,error:String(error)});await client.from('notification_outbox').update({error:String(error)}).eq('id',e.id);}
    }
  }
}
