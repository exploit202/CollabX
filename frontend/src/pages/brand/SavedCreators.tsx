import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { Star, Trash2, Loader2, Bookmark, Flag } from 'lucide-react';
import { getSavedCreators, removeSavedCreator, reportCreator } from '../../lib/api';
import { ReportUserModal } from '../../components/modals/ReportUserModal';
import { useApp } from '../../context/AppContext';

export const SavedCreators: React.FC = () => {
  const [savedCreators, setSavedCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);
  const { refreshAppData, addToast } = useApp();

  const fetchSavedCreators = async () => {
    try {
      const res = await getSavedCreators();
      if (res.success) {
        setSavedCreators(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching saved creators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCreators();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await removeSavedCreator(id);
      await refreshAppData();
      fetchSavedCreators();
    } catch (err) {
      console.error('Error removing saved creator:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved & Shortlisted Creators</h1>
        <p className="text-xs text-slate-500">Bookmarked creators for quick campaign outreach</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCreators.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={Bookmark}
                title="No Saved Creators"
                description="Browse Discover Creators to bookmark and shortlist top talent for your upcoming campaigns."
              />
            </div>
          ) : (
            savedCreators.map((item) => {
              const creator = item.creatorId || item;
              const creatorId = creator.userId?._id || creator.userId?.id || (typeof creator.userId === 'string' ? creator.userId : null) || creator._id || creator.id || item.creatorId || item._id || item.id;
              const name = creator.userId?.fullName || creator.fullName || creator.name || 'Creator';
              const category = creator.category || creator.primaryContentNiche || 'Content Creator';
              const rawAvatar = creator.profileImage?.url || creator.userId?.profileImage?.url || creator.avatar || creator.profileImage || creator.userId?.profileImage;

              return (
                <Card key={item._id || item.id || creatorId} hoverable className="p-5 border-slate-200/90 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={typeof rawAvatar === 'object' ? rawAvatar?.url : rawAvatar}
                      name={name}
                      size="w-12 h-12"
                      textSize="text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{name}</h3>
                      <Badge variant="purple">{category}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setReportTarget({ id: creatorId, name: creator.name || 'Creator' })}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Report Creator"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(creatorId)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-slate-500 font-medium">Rating:</span>
                    <span className="font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {creator.rating || 5.0}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/brand/creator/${creatorId}`}
                      className="py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                      Profile
                    </Link>
                    <Link
                      to={`/brand/creator/${creatorId}`}
                      className="py-2 text-center text-xs font-bold text-white bg-[#EC4899] hover:bg-pink-600 rounded-xl transition-all"
                    >
                      Invite
                    </Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {reportTarget && (
        <ReportUserModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetName={reportTarget.name}
          targetRole="creator"
          onSubmit={async (data) => {
            try {
              await reportCreator({ reportedAgainst: reportTarget.id, ...data });
              addToast('success', 'Report Submitted', `Your report against ${reportTarget.name} has been submitted for admin review.`);
            } catch (err: any) {
              addToast('error', 'Report Failed', err?.message || 'Failed to submit report.');
            }
          }}
        />
      )}
    </div>
  );
};
