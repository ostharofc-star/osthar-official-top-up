import {db,deliverNotifications} from '../_shared/platform.ts';
const response=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
function bytes(hex:string){if(!/^[0-9a-f]+$/i.test(hex)||hex.length%2)throw new Error('Invalid signature');return new Uint8Array(hex.match(/.{2}/g)!.map(x=>parseInt(x,16)));}
Deno.serve(async req=>{
  try{
    const key=Deno.env.get('DISCORD_PUBLIC_KEY');const timestamp=req.headers.get('X-Signature-Timestamp');const signature=req.headers.get('X-Signature-Ed25519');
    if(!key||!timestamp||!signature||Math.abs(Date.now()/1000-Number(timestamp))>300||!Number.isFinite(Number(timestamp)))return response({error:'Unauthorized'},401);
    const body=await req.text();const publicKey=await crypto.subtle.importKey('raw',bytes(key),{name:'Ed25519'},false,['verify']);
    if(!await crypto.subtle.verify('Ed25519',publicKey,bytes(signature),new TextEncoder().encode(timestamp+body)))return response({error:'Unauthorized'},401);
    const interaction=JSON.parse(body);if(interaction.type===1)return response({type:1});
    const guild=Deno.env.get('DISCORD_GUILD_ID');const role=Deno.env.get('DISCORD_ADMIN_ROLE_ID');
    if(!guild||!role||interaction.guild_id!==guild||!interaction.member?.roles?.includes(role))return response({type:4,data:{content:'You do not have permission to manage orders.',flags:64}});
    const match=/^osthar:(processing|completed):([0-9a-f-]{36})$/i.exec(interaction.data?.custom_id??'');
    if(interaction.type!==3||!match)return response({type:4,data:{content:'Unsupported action.',flags:64}});
    const [,status,id]=match;
    EdgeRuntime.waitUntil((async()=>{
      let content='';
      try{
        const {error}=await db().rpc('change_order',{p_id:id,p_status:status,p_reason:'',p_actor:`discord:${interaction.member.user.id}`});if(error)throw error;
        content=`Order ${id} marked ${status}.`;await deliverNotifications([id]);
      }catch(e){console.error('[discordInteractions] action failed',String(e));content='Unable to update order. It may already be completed or cancelled. Please check the admin workspace.';}
      const result=await fetch(`https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({content})});
      if(!result.ok)console.error('[discordInteractions] response update failed',result.status);
    })());
    return response({type:5,data:{flags:64}});
  }catch(error){console.error('[discordInteractions] rejected request',String(error));return response({error:'Invalid request'},401);}
});
