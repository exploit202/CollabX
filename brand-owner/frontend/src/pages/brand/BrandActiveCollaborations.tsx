import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { WriteReviewModal } from '../../components/modals/WriteReviewModal';
import {
  Briefcase,
  ExternalLink,
  CheckCircle2,
  Clock,
  Star,
  FileText,
} from 'lucide-react';

export const BrandActiveCollaborations: React.FC = () => {
  const { collaborations, approveDeliverable } = useApp();
  const [selectedCollabForReview, setSelectedCollabForReview] = useState<{
    creatorId: string;
    creatorName: string;
    campaignTitle: string;
    collabId: string;
  } | null>(null);

  const stagesOrder = [
    'agreement_finalized',
    'content_in_progress',
    'content_submitted',
    'completed',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Collaborations</h1>
        <p className="text-xs text-slate-500">
          Monitor content production, review submitted drafts, approve deliverables, and leave reviews
        </p>
      </div>

      <div className="space-y-4">
        {collaborations.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No active collaborations currently in progress.
          </Card>
        ) : (
          collaborations.map((collab) => {
            return (
              <Card key={collab.id} className="p-6 border-slate-200/90 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={collab.creatorAvatar}
                      alt={collab.creatorName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{collab.creatorName}</h3>
                      <p className="text-xs text-slate-500">Campaign: {collab.campaignTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant={collab.stage === 'completed' ? 'emerald' : 'purple'}>
                      Stage: {collab.stage.replace('_', ' ')}
                    </Badge>
                    <span className="text-lg font-black text-slate-900">₹{collab.agreedPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Stepper Progress Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-[10px] font-bold">
                  <div className={`py-1.5 px-1 rounded-xl ${collab.stage !== 'invitation_sent' ? 'bg-pink-100 text-pink-700' : 'bg-white text-slate-400'}`}>
                    1. Agreement
                  </div>
                  <div className={`py-1.5 px-1 rounded-xl ${['content_in_progress', 'content_submitted', 'completed'].includes(collab.stage) ? 'bg-pink-100 text-pink-700' : 'bg-white text-slate-400'}`}>
                    2. Content Creation
                  </div>
                  <div className={`py-1.5 px-1 rounded-xl ${['content_submitted', 'completed'].includes(collab.stage) ? 'bg-pink-100 text-pink-700' : 'bg-white text-slate-400'}`}>
                    3. Content Submitted
                  </div>
                  <div className={`py-1.5 px-1 rounded-xl ${collab.stage === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-400'}`}>
                    4. Completed & Paid
                  </div>
                </div>

                {/* Submitted Content Preview */}
                {collab.submissionUrl && (
                  <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-600" /> Submitted Content Draft Link
                      </span>
                      <a
                        href={collab.submissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        Preview Post <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-purple-800 text-[11px]">"{collab.submissionNotes}"</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400">Deadline: {collab.deadline}</span>

                  <div className="flex items-center gap-2">
                    {collab.stage === 'content_submitted' && (
                      <button
                        onClick={() => {
                          approveDeliverable(collab.id, 'Great work, approved!');
                          setSelectedCollabForReview({
                            creatorId: collab.creatorId,
                            creatorName: collab.creatorName,
                            campaignTitle: collab.campaignTitle,
                            collabId: collab.id,
                          });
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve Content & Release Payment
                      </button>
                    )}

                    {collab.stage === 'completed' && (
                      <button
                        onClick={() =>
                          setSelectedCollabForReview({
                            creatorId: collab.creatorId,
                            creatorName: collab.creatorName,
                            campaignTitle: collab.campaignTitle,
                            collabId: collab.id,
                          })
                        }
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                      >
                        <Star className="w-4 h-4" /> Rate & Review Creator
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {selectedCollabForReview && (
        <WriteReviewModal
          isOpen={!!selectedCollabForReview}
          onClose={() => setSelectedCollabForReview(null)}
          creatorId={selectedCollabForReview.creatorId}
          creatorName={selectedCollabForReview.creatorName}
          campaignTitle={selectedCollabForReview.campaignTitle}
        />
      )}
    </div>
  );
};
