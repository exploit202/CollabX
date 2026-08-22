import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Send, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Badge } from './Badge';
import { Card } from './Card';
import { Avatar } from './Avatar';
import {
  getCreatorNegotiations,
  getBrandNegotiations,
  sendCreatorCounterOffer,
  sendBrandOffer,
  acceptCreatorOffer,
  acceptBrandOffer
} from '../../lib/api';

type Role = 'brand' | 'creator';
const badge = (s: string) => (s === 'agreed' ? 'emerald' : s === 'rejected' || s === 'cancelled' || s === 'closed' ? 'rose' : 'purple');

export const NegotiationRoom: React.FC<{ role: Role }> = ({ role }) => {
  const { user } = useAuth();
  const { formatCurrency, formatDateTime, refreshAppData } = useApp();
  const [searchParams] = useSearchParams();
  const targetIdParam = searchParams.get('id') || searchParams.get('invitationId');

  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'active' | 'completed'>('active');
  const [selected, setSelected] = useState('');
  const [price, setPrice] = useState<number>(2500);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const fetchNegotiations = async () => {
    try {
      const res = role === 'creator' ? await getCreatorNegotiations() : await getBrandNegotiations();
      if (res.success) {
        setNegotiations(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching negotiations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
  }, [role]);

  // Active negotiations include 'open', 'active', 'pending', and 'in_progress'
  const available = useMemo(
    () =>
      negotiations.filter((n) =>
        view === 'active'
          ? ['open', 'active', 'pending', 'in_progress'].includes(n.status)
          : ['agreed', 'rejected', 'cancelled', 'closed'].includes(n.status)
      ),
    [negotiations, view]
  );

  // Match targetIdParam if passed in URL query, otherwise fallback to currently selected or first available
  const current = useMemo(() => {
    if (targetIdParam) {
      const matched = available.find(
        (n) => String(n._id || n.id) === String(targetIdParam) || String(n.invitationId?._id || n.invitationId) === String(targetIdParam)
      );
      if (matched) return matched;
    }
    if (selected) {
      const matchedSelected = available.find((n) => String(n._id || n.id) === String(selected));
      if (matchedSelected) return matchedSelected;
    }
    return available[0];
  }, [available, targetIdParam, selected]);

  const latestOffer = useMemo(() => {
    if (!current || !current.offers || current.offers.length === 0) return null;
    return current.offers[current.offers.length - 1];
  }, [current]);

  const isLatestOfferMine = useMemo(() => {
    if (!latestOffer) return false;
    return (
      latestOffer.senderRole === role ||
      String(latestOffer.senderId?._id || latestOffer.senderId) === String(user?._id || user?.id)
    );
  }, [latestOffer, role, user]);

  const latestOfferPrice = useMemo(() => {
    if (!latestOffer) return current?.currentBudget || current?.currentPrice || 0;
    return latestOffer.proposedBudget || latestOffer.proposedPrice || latestOffer.price || 0;
  }, [latestOffer, current]);

  useEffect(() => {
    if (current) {
      const currId = current._id || current.id;
      setSelected(currId);
      const currPrice = current.currentBudget || current.currentPrice || current.proposedBudget || 0;
      if (currPrice > 0) {
        setPrice(currPrice);
      }
    }
  }, [current?._id, current?.id]);

  useEffect(() => {
    if (bottom.current) {
      bottom.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [current?.offers?.length, current?._id]);

  const partnerName = (n: any) => {
    if (!n) return 'Partner';
    if (role === 'brand') {
      return n.creatorName || n.creatorId?.fullName || 'Creator';
    }
    return n.brandName || n.brandId?.fullName || 'Brand';
  };

  const partnerAvatar = (n: any) => {
    if (!n) return null;
    if (role === 'brand') {
      const img = n.creatorAvatar || n.creatorId?.profileImage?.url || n.creatorId?.profileImage;
      return typeof img === 'object' ? img?.url : img || null;
    }
    const img = n.brandLogo || n.brandId?.profileImage?.url || n.brandId?.profileImage || n.brandId?.companyLogo;
    return typeof img === 'object' ? img?.url : img || null;
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || price <= 0) return;
    setSubmitting(true);
    try {
      const targetId = current._id || current.id;
      const payload = {
        proposedPrice: price,
        proposedBudget: price,
        notes: notes || `Counter offer submitted for $${price}.`,
        message: notes || `Counter offer submitted for $${price}.`
      };

      if (role === 'creator') {
        await sendCreatorCounterOffer(targetId, payload);
      } else {
        await sendBrandOffer(targetId, payload);
      }

      setNotes('');
      fetchNegotiations();
      refreshAppData();
    } catch (err) {
      console.error('Failed to send counter offer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async () => {
    if (!current) return;
    setAccepting(true);
    try {
      const targetId = current._id || current.id;
      const offerId = latestOffer?._id || latestOffer?.id;

      if (role === 'creator') {
        await acceptCreatorOffer(targetId, offerId);
      } else {
        await acceptBrandOffer(targetId, offerId);
      }

      fetchNegotiations();
      refreshAppData();
    } catch (err) {
      console.error('Failed to accept offer:', err);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Negotiation Deal Room</h1>
        <p className="text-xs text-slate-500">Review offers, counter-offers, accept agreements, and view history.</p>
      </div>

      <div className="inline-flex p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setView('active')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            view === 'active' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Negotiations
        </button>
        <button
          onClick={() => setView('completed')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            view === 'completed' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Completed Negotiations
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[560px] lg:h-[700px]">
          {/* Negotiations Sidebar */}
          <Card className="p-3 overflow-y-auto space-y-2">
            {available.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">No {view} negotiations found in MongoDB.</p>
            ) : (
              available.map((n) => {
                const isSelected = (current?._id || current?.id) === (n._id || n.id);
                const offerPrice = n.agreedBudget || n.currentBudget || n.currentPrice || n.proposedBudget || 0;
                return (
                  <button
                    key={n._id || n.id}
                    onClick={() => setSelected(n._id || n.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected ? 'border-[#EC4899] bg-pink-50/60 shadow-xs' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar src={partnerAvatar(n)} name={partnerName(n)} size="w-9 h-9" textSize="text-xs" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{partnerName(n)}</p>
                        <p className="text-[10px] text-slate-500 truncate">{n.campaignName || n.campaignTitle || 'Campaign'}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                      <Badge variant={badge(n.status) as any}>{n.status}</Badge>
                      <span className="text-xs font-black text-slate-900">{formatCurrency(offerPrice)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </Card>

          {/* Deal Room Discussion Area */}
          <Card className="lg:col-span-2 p-0 flex flex-col overflow-hidden">
            {current ? (
              <>
                <div className="p-4 bg-slate-50 border-b flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={partnerAvatar(current)} name={partnerName(current)} size="w-10 h-10" textSize="text-sm" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{partnerName(current)}</p>
                      <p className="text-[10px] text-slate-500">{current.campaignName || current.campaignTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={badge(current.status) as any}>{current.status}</Badge>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {current.status === 'agreed' ? 'Agreed Budget' : 'Current Offer'}
                    </p>
                    <p className="text-base font-black text-slate-900">
                      {formatCurrency(current.agreedBudget || current.currentBudget || current.currentPrice || current.proposedBudget || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 bg-slate-50/80 space-y-3">
                  {(current.offers || current.messages || []).map((m: any, i: number) => {
                    const mine =
                      m.senderRole === role ||
                      String(m.senderId?._id || m.senderId) === String(user?._id || user?.id);
                    const offerVal = m.proposedBudget || m.proposedPrice || m.price || 0;
                    const offerMsg = m.message || m.notes || 'Offer submitted.';

                    return (
                      <div key={m._id || i} className={`max-w-[85%] ${mine ? 'ml-auto' : ''}`}>
                        <div className={`flex gap-2 text-[10px] text-slate-400 mb-1 ${mine ? 'justify-end' : ''}`}>
                          <span>{mine ? 'You' : m.senderName || partnerName(current)}</span>
                          <span>
                            {formatDateTime(m.timestamp || m.createdAt)}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl border text-xs shadow-xs ${
                            m.status === 'accepted'
                              ? 'bg-emerald-600 border-emerald-600 text-white font-semibold'
                              : mine
                              ? role === 'brand'
                                ? 'bg-[#EC4899] border-pink-500 text-white'
                                : 'bg-purple-600 border-purple-600 text-white'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex justify-between gap-6 font-bold border-b border-current/20 pb-1">
                            <span>{m.status === 'accepted' ? 'Agreement Accepted' : i === 0 ? 'Initial offer' : 'Counter offer'}</span>
                            <span>{formatCurrency(offerVal)}</span>
                          </div>
                          <p className="mt-2 leading-relaxed">{offerMsg}</p>
                        </div>
                      </div>
                    );
                  })}
                  {current.status === 'agreed' && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold text-center flex justify-center items-center gap-2 shadow-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Agreement accepted — collaboration is now active.
                    </div>
                  )}
                  <div ref={bottom} />
                </div>

                {['open', 'active', 'pending', 'in_progress'].includes(current.status) && (
                  <form onSubmit={send} className="p-4 border-t bg-white space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {!isLatestOfferMine && latestOfferPrice > 0 && (
                        <button
                          type="button"
                          onClick={handleAccept}
                          disabled={accepting || submitting}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                        >
                          {accepting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Accept ${latestOfferPrice}
                        </button>
                      )}

                      <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                        <input
                          type="number"
                          min="1"
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          aria-label="Counter price"
                          className="w-28 bg-slate-50 border rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          disabled={submitting || accepting}
                        />
                        <input
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Write a counter offer message…"
                          className="flex-1 bg-slate-50 border rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          disabled={submitting || accepting}
                        />
                        <button
                          type="submit"
                          disabled={submitting || accepting}
                          className="p-2.5 rounded-xl text-white bg-[#EC4899] hover:bg-pink-600 transition-all font-bold"
                          title="Send Counter Offer"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="m-auto p-8 text-center text-xs text-slate-400">
                Choose a negotiation to see its deal room history.
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
