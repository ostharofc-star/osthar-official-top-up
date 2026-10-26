import {cors,json,db,hash,admin,deliverNotifications} from '../_shared/platform.ts';
const editable=['products','site_settings','payment_settings','update_slides'];
const readable=[...editable,'orders','wallet_topup_requests','profiles','wallets','wallet_transactions','admin_activity_log','notification_outbox'];
const searchColumns:Record<string,string>={products:'name',orders:'player_uid',wallet_topup_requests:'transaction_reference',wallet_transactions:'description',admin_activity_log:'description',notification_outbox:'error',update_slides:'title'};
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{headers:cors});
  try{
    const b=await req.json();const client=db();
    if(b.action==='login'){
      const password=Deno.env.get('ADMIN_PASSWORD');
      if(!password||password.length<12)throw new Error('Admin access is not configured. Set a strong ADMIN_PASSWORD secret (12+ characters).');
      const {count,error:rateError}=await client.from('admin_login_attempts').select('*',{count:'exact',head:true}).gte('created_at',new Date(Date.now()-60000).toISOString());if(rateError)throw rateError;
      if((count??0)>=10)throw new Error('Too many attempts. Please wait one minute.');
      const {error:attemptError}=await client.from('admin_login_attempts').insert({});if(attemptError)throw attemptError;
      if(await hash(String(b.password??''))!==await hash(password))throw new Error('Invalid admin password');
      const token=crypto.randomUUID()+crypto.randomUUID();const {error}=await client.from('admin_sessions').insert({token_hash:await hash(token),expires_at:new Date(Date.now()+8*3600000).toISOString()});if(error)throw error;
      await client.from('admin_activity_log').insert({action:'login',entity_type:'admin',description:'Admin signed in'});return json({token});
    }
    await admin(b.token);let result:unknown;
    if(b.action==='logout'){
      await client.from('admin_sessions').delete().eq('token_hash',await hash(b.token));await client.from('admin_activity_log').insert({action:'logout',entity_type:'admin',description:'Admin signed out'});result={success:true};
    }else if(b.action==='list'){
      if(!readable.includes(b.table))throw new Error('Invalid entity');
      const page=Number(b.page??0);if(!Number.isSafeInteger(page)||page<0)throw new Error('Invalid page');
      const search=String(b.search??'').slice(0,200);
      if(b.table==='profiles'){const {data,error}=await client.rpc('admin_customers',{p_search:search,p_page:page});if(error)throw error;result=data;}
      else{
        let query=client.from(b.table).select('*',{count:'exact'});
        if(b.group_id&&b.table==='orders')query=query.eq('cart_group_id',b.group_id);
        if(b.status&&b.status!=='all'){
          if(['orders','wallet_topup_requests'].includes(b.table))query=query.eq('status',b.status);
          else if(b.table==='wallet_transactions')query=query.eq('type',b.status);
          else if(b.table==='notification_outbox')query=query.eq('delivered',b.status==='delivered');
        }
        if(search){
          if(/^[0-9a-f-]{36}$/i.test(search))query=query.eq('id',search);
          else if(searchColumns[b.table])query=query.ilike(searchColumns[b.table],`%${search.replace(/[\\%_]/g,'')}%`);
        }
        query=query.order(['products','update_slides'].includes(b.table)?'display_order':['payment_settings','site_settings'].includes(b.table)?'id':'created_at',{ascending:['products','update_slides','payment_settings','site_settings'].includes(b.table)});
        const {data,error,count}=await query.range(page*25,page*25+(b.group_id?29:24));if(error)throw error;result={rows:data,total:count};
      }
    }else if(b.action==='dashboard'){
      const {data,error}=await client.rpc('admin_overview');if(error)throw error;result=data;
    }else if(b.action==='save'||b.action==='delete'){
      if(!editable.includes(b.table))throw new Error('Invalid entity');
      let query;
      if(b.action==='delete'){if(!['products','update_slides'].includes(b.table))throw new Error('Settings cannot be deleted');query=client.from(b.table).delete().eq('id',b.id);}
      else{
        const row={...b.data};if(!row.id)delete row.id;
        if(b.table==='products'){
          if(!String(row.name??'').trim()||!String(row.game??'').trim())throw new Error('Product name and game are required');
          if(!Number.isFinite(row.regular_price)||row.regular_price<=0||(row.sale_price!==null&&(!Number.isFinite(row.sale_price)||row.sale_price<=0||row.sale_price>=row.regular_price)))throw new Error('Invalid product prices');
          if(row.supported_server!=='Singapore')throw new Error('Only Singapore is supported');
        }
        if(b.table==='site_settings'){if(row.id!=='main')throw new Error('Invalid site settings');row.data.currency_label='LKR';if(typeof row.data.maintenance_mode!=='boolean')throw new Error('Invalid maintenance setting');}
        if(b.table==='payment_settings'&&!['ez_cash','bank_transfer'].includes(row.id))throw new Error('Invalid payment method');
        query=client.from(b.table).upsert(row).select();
      }
      const {data,error}=await query;if(error)throw error;
      await client.from('admin_activity_log').insert({action:b.action,entity_type:b.table,entity_id:String(b.id??data?.[0]?.id??''),description:`${b.action} ${b.table}`});result=data??{success:true};
    }else if(b.action==='order-status'){
      const {data,error}=await client.rpc('change_order',{p_id:b.id,p_status:b.status,p_reason:String(b.reason??'').slice(0,2000),p_actor:'superadmin'});if(error)throw error;result=data;await deliverNotifications([b.id]);
    }else if(b.action==='order-note'){
      const {error}=await client.from('orders').update({admin_note:String(b.note??'').slice(0,2000)}).eq('id',b.id);if(error)throw error;await client.from('admin_activity_log').insert({action:'note',entity_type:'orders',entity_id:b.id,description:'Updated admin note'});result={success:true};
    }else if(b.action==='topup-review'){
      const {data,error}=await client.rpc('review_topup',{p_id:b.id,p_status:b.status,p_amount:b.amount,p_note:String(b.note??'').slice(0,2000)});if(error)throw error;result=data;
    }else if(b.action==='adjust'){
      const {data,error}=await client.rpc('adjust_wallet',{p_user:b.user_id,p_amount:b.amount,p_note:String(b.note??'').slice(0,2000)});if(error)throw error;result=data;
    }else if(b.action==='receipt'){
      const {data,error}=await client.storage.from('receipts').createSignedUrl(b.path,300);if(error)throw error;await client.from('admin_activity_log').insert({action:'view_receipt',entity_type:'receipts',description:'Generated private receipt access'});result=data;
    }else if(b.action==='retry-notifications'){
      const {data,error}=await client.from('notification_outbox').select('order_id').eq('delivered',false).limit(100);if(error)throw error;await deliverNotifications([...new Set((data??[]).map(x=>x.order_id))]);await client.from('admin_activity_log').insert({action:'retry_notifications',entity_type:'notification_outbox',description:'Retried pending notifications'});result={success:true};
    }else throw new Error('Unknown action');
    return json(result);
  }catch(error){console.error('[admin-platform] request failed',String(error));return json({error:error.message??'Request failed'},error.message==='Unauthorized'?401:400);}
});
