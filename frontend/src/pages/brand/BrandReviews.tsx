import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { AlertCircle, MessageSquare, Star } from 'lucide-react';
import { getReviews } from '../../lib/api';

const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <span className="flex text-amber-400 gap-0.5">
    {[1, 2, 3, 4, 5].map((x) => (
      <Star
        key={x}
        className={`w-3.5 h-3.5 ${x <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
      />
    ))}
  </span>
);

export const BrandReviews: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewData, setReviewData] = useState<{
    reviews: any[];
    total: number;
    average: number;
    distribution: { rating: number; count: number }[];
  }>({
    reviews: [],
    total: 0,
    average: 0,
    distribution: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0 }))
  });

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getReviews(user?.id);
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          const reviewsArr = res.data;
          const total = reviewsArr.length;
          const average = total > 0 ? reviewsArr.reduce((s: number, r: any) => s + r.rating, 0) / total : 0;
          const distribution = [5, 4, 3, 2, 1].map((rating) => ({
            rating,
            count: reviewsArr.filter((r: any) => r.rating === rating).length
          }));
          setReviewData({ reviews: reviewsArr, total, average, distribution });
        } else {
          setReviewData({
            reviews: res.data.reviews || [],
            total: res.data.total || 0,
            average: res.data.average || 0,
            distribution: res.data.distribution || [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: 0 }))
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to load brand reviews:', err);
      setError(err?.message || 'Failed to load creator feedback reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-36 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Reviews could not be loaded"
        description={error}
        actionLabel="Try again"
        onAction={fetchReviews}
      />
    );
  }

  const { reviews, total, average, distribution } = reviewData;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Brand Reputation & Reviews</h1>
        <p className="text-xs text-slate-500">Verified feedback submitted by creators from completed campaigns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Rating Card */}
        <Card className="md:col-span-1 p-6 bg-purple-950 text-white flex flex-col justify-between">
          <div>
            <p className="text-xs text-purple-200 font-medium">Brand Rating Score</p>
            <div className="flex items-end gap-2 mt-3">
              <span className="text-4xl font-black text-amber-400">{average.toFixed(1)}</span>
              <Stars rating={average} />
            </div>
          </div>
          <p className="text-[10px] text-purple-300 mt-4">
            Based on {total} total verified creator {total === 1 ? 'review' : 'reviews'}
          </p>
        </Card>

        {/* Rating Distribution */}
        <Card className="md:col-span-2 p-5">
          <h2 className="text-xs font-bold text-slate-800 mb-4">Rating distribution</h2>
          <div className="space-y-2.5">
            {distribution.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3 text-[11px]">
                <span className="w-10 flex items-center gap-1 font-bold text-slate-600">
                  {rating}
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-right font-bold text-slate-400">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No creator reviews yet"
            description="Complete campaigns with creators to start building your brand reputation."
          />
        ) : (
          reviews.map((review) => (
            <Card key={review._id || review.id} className="p-5 border-slate-200/90 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm border border-purple-200">
                    {review.reviewerName?.[0] || 'C'}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{review.reviewerName}</h2>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {review.date} {review.campaignTitle ? ` · Campaign: ${review.campaignTitle}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Stars rating={review.rating} />
                  <p className="text-[10px] font-bold text-amber-600 mt-1">{review.rating}.0 / 5.0</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-normal">
                “{review.comment || review.review}”
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
