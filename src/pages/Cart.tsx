import {Link} from 'react-router-dom';
import {Minus,Plus,Trash2,ArrowRight} from 'lucide-react';
import {usePlatform,money} from '@/lib/platform';
import {PageHeading,EmptyState,PrimaryButton} from '@/components/shared';
import Checkout from '@/components/Checkout';

export default function Cart(){
  const {cart,update,clear}=usePlatform();
  const total=cart.reduce((s,i)=>s+(i.product.sale_price??i.product.regular_price)*i.quantity,0);

  // 🟢 Green API හරහා WhatsApp Group එකට Message එක යවන Function එක
  const sendWhatsAppNotification = async () => {
    const idInstance = "710722781919"; // ඔබේ Green API Instance ID එක දමන්න
    const apiTokenInstance = "de0bf8b533b1479a82d1734a9a5aa80b281a77c483a64a5f98"; // ඔබේ Green API Token එක දමන්න
    const chatId = "120363412515094330@g.us"; // ඔබේ WhatsApp Group ID එක දමන්න (අවසානයට @g.us තිබිය යුතුය)

    // Cart එකේ තියෙන items වල විස්තර එකතු කර Message එක සකස් කිරීම
    let itemsList = cart.map(i => `• ${i.product.name} × ${i.quantity} (${money((i.product.sale_price??i.product.regular_price)*i.quantity)})`).join('\n');

    const message = `
🛒 *NEW TOP-UP ORDER RECEIVED!* 🛒

📦 *Items:*
${itemsList}

💰 *Total Amount:* ${money(total)}

⏳ _Please process this order as soon as possible!_
    `.trim();

    const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chatId: chatId,
                message: message
            })
        });

        const result = await response.json();
        console.log("WhatsApp Notification Sent:", result);
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
    }
  };

  // Order එක සාර්ථක වූ විට cart එක clear කිරීමත් සමඟ WhatsApp notification එක යැවීම
  const handleOrderSuccess = async () => {
    await sendWhatsAppNotification();
    clear();
  };

  return (
    <div className="container-page py-12">
      <PageHeading label="YOUR LOADOUT" title="Ready for the upgrade?" description="One checkout. All your favorite packages."/>
      {!cart.length ? (
        <EmptyState title="Your cart is waiting." description="Find a package you love and add it here.">
          <PrimaryButton asChild>
            <Link to="/store">Browse store <ArrowRight size={15}/></Link>
          </PrimaryButton>
        </EmptyState>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_1fr]">
          <div className="space-y-4">
            {cart.map(i=>(
              <div key={i.product.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <img src={i.product.image} alt={i.product.name} className="h-20 w-20 rounded-xl object-cover"/>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-primary">{i.product.game}</p>
                  <Link to={`/product/${i.product.id}`} className="mt-1 block text-sm font-semibold">{i.product.name}</Link>
                  <p className="mt-2 text-xs text-primary">{money(i.product.sale_price??i.product.regular_price)}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center rounded-lg border border-border">
                      <button aria-label="Decrease quantity" className="p-2" onClick={()=>update(i.product.id,i.quantity-1)}><Minus size={11}/></button>
                      <span className="px-2 text-xs">{i.quantity}</span>
                      <button aria-label="Increase quantity" className="p-2" onClick={()=>update(i.product.id,i.quantity+1)}><Plus size={11}/></button>
                    </div>
                    <button aria-label={`Remove ${i.product.name}`} className="text-muted-foreground hover:text-red-400" onClick={()=>update(i.product.id,0)}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/store" className="inline-block pt-3 text-xs text-primary">← Keep browsing</Link>
          </div>
          <div className="panel">
            <h2 className="mb-6 text-lg font-semibold">Order summary</h2>
            <div className="mb-6 space-y-3 border-b border-border pb-5 text-xs">
              {cart.map(i=>(
                <div key={i.product.id} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{i.product.name} × {i.quantity}</span>
                  <span>{money((i.product.sale_price??i.product.regular_price)*i.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">{money(total)}</span>
              </div>
            </div>
            {/* මෙහි onSuccess මඟින් කලින් තිබූ clear වෙනුවට අලුත් handleOrderSuccess function එක ලබා දී ඇත */}
            <Checkout items={cart} onSuccess={handleOrderSuccess}/>
          </div>
        </div>
      )}
    </div>
  );
}
