import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Bookmark, Star, Send, Trash2 } from 'lucide-react';

export const SavedCreators: React.FC = () => {
  const { creators, savedCreatorIds, toggleSaveCreator } = useApp();

  const savedCreators = creators.filter((c) => savedCreatorIds.includes(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved & Shortlisted Creators</h1>
        <p className="text-xs text-slate-500">Bookmarked creators for quick campaign outreach</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedCreators.length === 0 ? (
          <Card className="col-span-3 p-8 text-center text-xs text-slate-400">
            No saved creators yet. Browse Discover Creators to bookmark top talent!
          </Card>
        ) : (
          savedCreators.map((creator) => (
            <Card key={creator.id} className="p-5 border-slate-200/90 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{creator.name}</h3>
                  <Badge variant="purple">{creator.category}</Badge>
                </div>
                <button
                  onClick={() => toggleSaveCreator(creator.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-500 font-medium">Rating:</span>
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {creator.rating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/brand/creator/${creator.id}`}
                  className="py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Profile
                </Link>
                <Link
                  to={`/brand/discover`}
                  className="py-2 text-center text-xs font-bold text-white bg-[#EC4899] hover:bg-pink-600 rounded-xl"
                >
                  Invite
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
