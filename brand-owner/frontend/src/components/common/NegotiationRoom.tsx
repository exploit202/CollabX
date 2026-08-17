import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Download, FileText, Paperclip, Send, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from './Badge';
import { Card } from './Card';

type Role = 'brand' | 'creator';
const badge = (s: string) => s === 'agreed' ? 'emerald' : s === 'cancelled' ? 'rose' : 'purple';

import { joinNegotiationRoom, subscribeToOffers, subscribeToStatus } from '../../services/socket';

export const NegotiationRoom: React.FC<{ role: Role }> = ({ role }) => {
  const { negotiations, addCounterOffer, finalizeAgreement, addToast, refreshData } = useApp();
  const { user } = useAuth();
  const [view, setView] = useState<'active' | 'completed'>('active');
  const available = useMemo(
    () => negotiations.filter((n) => (view === 'active' ? n.status === 'active' : n.status !== 'active')),
    [negotiations, view]
  );
  const [selected, setSelected] = useState('');
  const [price, setPrice] = useState(2500);
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const current = available.find((n) => n.id === selected) || available[0];

  useEffect(() => {
    if (current) setSelected(current.id);
  }, [current?.id]);

  // Socket.IO Room Integration
  useEffect(() => {
    if (!current?.id) return;

    joinNegotiationRoom(current.id, (res) => {
      if (res?.success) {
        console.log(`Joined socket room for negotiation ${current.id}`);
      }
    });

    const unsubOffers = subscribeToOffers((data) => {
      if (data.negotiationId === current.id) {
        refreshData();
      }
    });

    const unsubStatus = subscribeToStatus((data) => {
      if (data.negotiationId === current.id) {
        refreshData();
      }
    });

    return () => {
      unsubOffers();
      unsubStatus();
    };
  }, [current?.id]);

  useEffect(() => {
    if (bottom.current) {
      bottom.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [current?.offers.length, current?.id]);

  const partnerName = (n: (typeof negotiations)[number]) => (role === 'brand' ? n.creatorName : n.brandName);
  const partnerAvatar = (n: (typeof negotiations)[number]) => (role === 'brand' ? n.creatorAvatar : n.brandLogo);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || price <= 0) return;
    addCounterOffer(current.id, {
      senderId: user?.id || `${role}-1`,
      senderRole: role,
      senderName: role === 'brand' ? (user as any)?.companyName || 'Your Brand' : user?.name || 'You',
      senderAvatar: role === 'brand' ? (user as any)?.logo || '' : user?.avatar || '',
      proposedPrice: price,
      deliverablesSummary: 'Updated offer',
      notes: notes || `Updated proposal for ₹${price.toLocaleString('en-IN')}.`,
      status: 'offered',
    });
    if (attachment) addToast('info', 'Attachment queued', `${attachment.name} is shown in the chat UI only.`);
    setNotes('');
    setAttachment(null);
  };
 return <div className="space-y-6"><div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Negotiation Deal Room</h1><p className="text-xs text-slate-500">Review offers, attachments, and the complete agreement history.</p></div><div className="inline-flex p-1 bg-slate-100 rounded-xl"><button onClick={()=>setView('active')} className={`px-4 py-2 rounded-lg text-xs font-bold ${view==='active'?'bg-white shadow text-slate-900':'text-slate-500'}`}>Active Negotiations</button><button onClick={()=>setView('completed')} className={`px-4 py-2 rounded-lg text-xs font-bold ${view==='completed'?'bg-white shadow text-slate-900':'text-slate-500'}`}>Completed Negotiations</button></div>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[560px] lg:h-[700px]"><Card className="p-3 overflow-y-auto space-y-2">{available.length===0?<p className="p-8 text-center text-xs text-slate-400">No {view} negotiations.</p>:available.map(n=><button key={n.id} onClick={()=>setSelected(n.id)} className={`w-full text-left p-3 rounded-xl border ${current?.id===n.id?'border-[#EC4899] bg-pink-50':'border-slate-100 hover:bg-slate-50'}`}><div className="flex items-center gap-2"><img src={partnerAvatar(n)} className="w-9 h-9 rounded-full object-cover"/><div className="min-w-0 flex-1"><p className="text-xs font-bold truncate">{partnerName(n)}</p><p className="text-[10px] text-slate-500 truncate">{n.campaignTitle}</p></div></div><div className="flex justify-between mt-2 pt-2 border-t border-slate-100"><Badge variant={badge(n.status) as any}>{n.status}</Badge><span className="text-xs font-black">₹{n.currentPrice.toLocaleString('en-IN')}</span></div></button>)}</Card>
 <Card className="lg:col-span-2 p-0 flex flex-col overflow-hidden">{current?<><div className="p-4 bg-slate-50 border-b flex justify-between gap-3"><div className="flex items-center gap-3"><img src={partnerAvatar(current)} className="w-10 h-10 rounded-full object-cover"/><div><p className="text-sm font-bold">{partnerName(current)}</p><p className="text-[10px] text-slate-500">{current.campaignTitle}</p></div></div><div className="text-right"><Badge variant={badge(current.status) as any}>{current.status}</Badge><p className="text-[10px] text-slate-400 mt-1">Current offer</p><p className="text-base font-black">₹{current.currentPrice.toLocaleString('en-IN')}</p>{current.status==='active'&&<button onClick={()=>finalizeAgreement(current.id)} className="mt-1 text-[10px] font-bold text-emerald-700">Accept agreement</button>}</div></div>
 <div className="flex-1 overflow-y-auto p-5 bg-slate-50/80 space-y-3">{current.offers.map((m,i)=>{const mine=m.senderRole===role;return <div key={m.id} className={`max-w-[85%] ${mine?'ml-auto':''}`}><div className={`flex gap-2 text-[10px] text-slate-400 mb-1 ${mine?'justify-end':''}`}><span>{m.senderName}</span><span>{new Date(m.timestamp).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span></div><div className={`p-3 rounded-2xl border text-xs ${mine?(role==='brand'?'bg-[#EC4899] border-pink-500 text-white':'bg-purple-600 border-purple-600 text-white'):'bg-white border-slate-200 text-slate-700'}`}><div className="flex justify-between gap-6 font-bold border-b border-current/20 pb-1"><span>{i===0?'Initial offer':'Counter offer'}</span><span>₹{m.proposedPrice.toLocaleString('en-IN')}</span></div><p className="mt-2 leading-relaxed">{m.notes}</p>{i===0&&<div className="mt-2 flex items-center gap-2 text-[10px] opacity-90"><FileText className="w-3.5 h-3.5"/>Brief.pdf <button className="underline flex gap-1"><Download className="w-3 h-3"/>Download</button></div>}</div></div>})}{current.status==='agreed'&&<div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold text-center flex justify-center gap-2"><ShieldCheck className="w-4 h-4"/>Agreement accepted — chat is now closed.</div>}<div ref={bottom}/></div>
 {current.status==='active'&&<form onSubmit={send} className="p-4 border-t bg-white"><div className="flex gap-2"><input type="number" min="1" value={price} onChange={e=>setPrice(Number(e.target.value))} aria-label="Counter price" className="w-28 bg-slate-50 border rounded-xl px-3 text-xs font-bold"/><input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Write a counter offer…" className="flex-1 bg-slate-50 border rounded-xl px-3 py-2.5 text-xs"/><label className="p-2.5 cursor-pointer rounded-xl border text-slate-500" title="Attach image, PDF, or DOC"><Paperclip className="w-4 h-4"/><input type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={e=>setAttachment(e.target.files?.[0]||null)}/></label><button className="p-2.5 rounded-xl text-white bg-[#EC4899]"><Send className="w-4 h-4"/></button></div>{attachment&&<p className="text-[10px] text-slate-500 mt-2 flex gap-1"><FileText className="w-3 h-3"/>{attachment.name} ready to attach</p>}</form>}</>:<p className="m-auto text-xs text-slate-400">Choose a negotiation to see its history.</p>}</Card></div></div>;
};
