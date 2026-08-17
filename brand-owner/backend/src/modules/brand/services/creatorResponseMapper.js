function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toSocials(socialLinks = {}, followers = 0, engagementRate = 0) {
  const entries = Object.entries(socialLinks || {}).filter(([, val]) => typeof val === 'string' && val.trim());

  if (!entries.length) {
    return [
      {
        platform: 'instagram',
        handle: 'creator-profile',
        followers: toNumber(followers, 0),
        engagementRate: toNumber(engagementRate, 0),
        url: ''
      }
    ];
  }

  return entries.map(([platform, url]) => ({
    platform,
    handle: url ? url.replace(/^https?:\/\//i, '').replace(/\/+$/, '') : platform,
    followers: toNumber(followers, 0),
    engagementRate: toNumber(engagementRate, 0),
    url: url || ''
  }));
}

function toPortfolio(portfolio = []) {
  if (!Array.isArray(portfolio)) return [];

  return portfolio.map((item, index) => {
    const value = typeof item === 'string' ? item : item?.url || item?.link || '';
    const title = typeof item === 'object' && item?.title ? item.title : `Portfolio item ${index + 1}`;
    const description = typeof item === 'object' && item?.description ? item.description : '';
    const mediaType = typeof item === 'object' && item?.mediaType ? item.mediaType : /\.(mp4|mov|webm|avi)$/i.test(value) ? 'video' : 'image';

    return {
      id: typeof item === 'object' && item?._id ? String(item._id) : `portfolio-${index + 1}`,
      title,
      brandName: typeof item === 'object' && item?.brandName ? item.brandName : '',
      brandLogo: typeof item === 'object' && item?.brandLogo ? item.brandLogo : '',
      category: typeof item === 'object' && item?.category ? item.category : '',
      mediaType,
      thumbnail: value || '',
      mediaUrl: value || '',
      views: typeof item === 'object' && item?.views ? item.views : '',
      likes: typeof item === 'object' && item?.likes ? item.likes : '',
      comments: typeof item === 'object' && item?.comments ? item.comments : '',
      description,
      date: typeof item === 'object' && item?.date ? item.date : ''
    };
  });
}

function mapCreatorForFrontend(profile) {
  if (!profile) return null;

  const user = profile.userId || {};
  const firstNiche = Array.isArray(profile.niche) && profile.niche.length ? profile.niche[0] : 'General';

  return {
    id: String(profile._id),
    _id: String(profile._id),
    name: user.fullName || '',
    fullName: user.fullName || '',
    email: user.email || '',
    avatar: user.profileImage || '',
    profileImage: user.profileImage || '',
    verified: Boolean(user.isVerified),
    isVerified: Boolean(user.isVerified),
    bio: profile.bio || '',
    category: firstNiche,
    niche: Array.isArray(profile.niche) ? profile.niche : [],
    country: profile.location?.country || '',
    city: profile.location?.city || '',
    location: profile.location || {},
    language: [],
    rating: 0,
    reviewCount: 0,
    totalCollaborations: 0,
    socials: toSocials(profile.socialLinks, profile.followers, profile.engagementRate),
    pricing: [],
    portfolio: toPortfolio(profile.portfolio),
    reviews: [],
    followers: toNumber(profile.followers, 0),
    engagementRate: toNumber(profile.engagementRate, 0),
    featured: false,
    matchScore: undefined,
    matchReasons: []
  };
}

module.exports = {
  mapCreatorForFrontend
};
