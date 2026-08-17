import React, { useState, useEffect } from 'react';
import { getBrandCollaborationActivity, getCreatorCollaborationActivity } from '../lib/api';
import { History, Clock, CheckCircle2, FileText, RotateCcw, Mail, DollarSign, Star, Loader2 } from 'lucide-react';

interface CollaborationActivityProps {
  collaborationId: string;
  role: 'brand' | 'creator';
}

export const CollaborationActivity: React.FC<CollaborationActivityProps> = ({ collaborationId, role }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const res = role === 'brand'
        ? await getBrandCollaborationActivity(collaborationId)
        : await getCreatorCollaborationActivity(collaborationId);
      if (res.success) {
        setActivities(res.activities || []);
      }
    } catch (err) {
      console.error('Failed to fetch activity timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivity();
    }
  }, [isOpen, collaborationId]);

  const getEventIcon = (type: string) => {
    if (type.includes('invitation')) return <Mail className="w-3.5 h-3.5 text-pink-500" />;
    if (type.includes('submitted')) return <FileText className="w-3.5 h-3.5 text-purple-500" />;
    if (type.includes('revision')) return <RotateCcw className="w-3.5 h-3.5 text-rose-500" />;
    if (type.includes('approved') || type.includes('completed')) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    if (type.includes('payment')) return <DollarSign className="w-3.5 h-3.5 text-amber-500" />;
    if (type.includes('review')) return <Star className="w-3.5 h-3.5 text-yellow-500" />;
    return <Clock className="w-3.5 h-3.5 text-slate-500" />;
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-all"
      >
        <History className="w-3.5 h-3.5 text-pink-500" />
        {isOpen ? 'Hide Collaboration Activity History' : 'View Collaboration Activity History'}
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
          <h5 className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Collaboration Timeline</h5>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No activity records recorded yet.</p>
          ) : (
            <div className="relative pl-4 border-l-2 border-slate-200 space-y-3">
              {activities.map((act, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full bg-white border border-slate-300 flex items-center justify-center">
                    {getEventIcon(act.type || '')}
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{act.title || act.type}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
