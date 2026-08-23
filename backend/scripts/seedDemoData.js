/**
 * CollabX Complete Demo Seed Data Generator
 * Seeds realistic Brands, Creators, Campaigns, Invitations, Negotiations, Collaborations, Notifications, Portfolios, Pricing, and Reviews.
 * Rebalanced for presentation-friendly academic demo amounts.
 * Run with: npm run seed:demo
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const connectDB = require('../src/config/db');
const {
  User,
  BrandProfile,
  CreatorProfile,
  Campaign,
  Invitation,
  Negotiation,
  Collaboration,
  Notification,
  Portfolio,
  Pricing,
  Review
} = require('../src/models');

async function seed() {
  console.log('🔄 Connecting to MongoDB via connectDB...');
  await connectDB();
  console.log('✅ Connected to MongoDB.');

  console.log('🧹 Cleaning up old demo data...');
  const demoEmailFilter = { email: { $regex: '@collabx\\.demo$' } };
  const demoUsers = await User.find(demoEmailFilter);
  const demoUserIds = demoUsers.map((u) => u._id);

  if (demoUserIds.length > 0) {
    await BrandProfile.deleteMany({ userId: { $in: demoUserIds } });
    await CreatorProfile.deleteMany({ userId: { $in: demoUserIds } });
    await Campaign.deleteMany({ brandId: { $in: demoUserIds } });
    await Invitation.deleteMany({ $or: [{ brandId: { $in: demoUserIds } }, { creatorId: { $in: demoUserIds } }] });
    await Negotiation.deleteMany({ $or: [{ brandId: { $in: demoUserIds } }, { creatorId: { $in: demoUserIds } }] });
    await Collaboration.deleteMany({ $or: [{ brandId: { $in: demoUserIds } }, { creatorId: { $in: demoUserIds } }] });
    await Notification.deleteMany({ $or: [{ userId: { $in: demoUserIds } }, { senderId: { $in: demoUserIds } }] });
    await Portfolio.deleteMany({ creator: { $in: demoUserIds } });
    await Pricing.deleteMany({ creatorId: { $in: demoUserIds } });
    await Review.deleteMany({ $or: [{ reviewerId: { $in: demoUserIds } }, { reviewedUserId: { $in: demoUserIds } }, { creatorId: { $in: demoUserIds } }] });
    await User.deleteMany(demoEmailFilter);
  }

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // ==========================================
  // 1. BRANDS (6)
  // ==========================================
  console.log('🏢 Creating Brands (6)...');
  const brandsData = [
    {
      fullName: 'Nike India',
      email: 'brand.nike@collabx.demo',
      companyName: 'Nike India Private Limited',
      industry: 'Fashion & Athleisure',
      aboutBrand: 'Nike is the world leader in athletic footwear, apparel, and sports equipment. Just Do It.',
      companyLogo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80',
      website: 'https://www.nike.com/in',
      city: 'Bengaluru',
      country: 'India',
      contactName: 'Rohan Mehra',
      contactRole: 'Brand Marketing Director',
      targetAudience: 'Athletes, fitness enthusiasts, and youth aged 16-35 looking for premium athletic performance and style.'
    },
    {
      fullName: 'boAt Lifestyle',
      email: 'brand.boat@collabx.demo',
      companyName: 'Imagine Marketing (boAt)',
      industry: 'Consumer Electronics & Audio',
      aboutBrand: 'India’s #1 earwear and wearable audio brand designed for the young, spirited audio lovers.',
      companyLogo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80',
      website: 'https://www.boat-lifestyle.com',
      city: 'Mumbai',
      country: 'India',
      contactName: 'Aman Verma',
      contactRole: 'Head of Influencer Partnerships',
      targetAudience: 'Tech-savvy Gen-Z and millennials passionate about music, gaming, and lifestyle.'
    },
    {
      fullName: 'Zomato',
      email: 'brand.zomato@collabx.demo',
      companyName: 'Zomato Limited',
      industry: 'Food & Dining Tech',
      aboutBrand: 'Better food for more people. Connecting millions of foodies with India’s best restaurants and culinary experiences.',
      companyLogo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
      website: 'https://www.zomato.com',
      city: 'Gurugram',
      country: 'India',
      contactName: 'Pooja Sharma',
      contactRole: 'VP Brand Growth',
      targetAudience: 'Urban food lovers, office professionals, and families seeking quick dining and delivery.'
    },
    {
      fullName: 'Swiggy',
      email: 'brand.swiggy@collabx.demo',
      companyName: 'Bundl Technologies (Swiggy)',
      industry: 'Quick Commerce & Logistics',
      aboutBrand: 'Instant delivery platform delivering food, groceries through Instamart, and dining reservations in minutes.',
      companyLogo: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=150&auto=format&fit=crop&q=80',
      website: 'https://www.swiggy.com',
      city: 'Bengaluru',
      country: 'India',
      contactName: 'Ananya Rao',
      contactRole: 'Campaign Lead',
      targetAudience: 'Fast-paced urban dwellers demanding ultra-convenient grocery and meal delivery.'
    },
    {
      fullName: 'Mamaearth',
      email: 'brand.mamaearth@collabx.demo',
      companyName: 'Honasa Consumer (Mamaearth)',
      industry: 'Beauty & Personal Care',
      aboutBrand: 'Toxin-free, natural, and cruelty-free skincare, haircare, and baby care products backed by nature.',
      companyLogo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80',
      website: 'https://mamaearth.in',
      city: 'Gurugram',
      country: 'India',
      contactName: 'Varun Alagh',
      contactRole: 'Chief Marketing Officer',
      targetAudience: 'Eco-conscious consumers and families seeking safe, chemical-free personal care.'
    },
    {
      fullName: 'Noise',
      email: 'brand.noise@collabx.demo',
      companyName: 'Nexxbase Marketing (Noise)',
      industry: 'Smart Wearables & Tech',
      aboutBrand: 'India’s leading connected lifestyle brand creating cutting-edge smartwatches and wireless earbuds.',
      companyLogo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80',
      website: 'https://www.gonoise.com',
      city: 'Gurugram',
      country: 'India',
      contactName: 'Gaurav Khatri',
      contactRole: 'Co-founder & Marketing Lead',
      targetAudience: 'Fitness trackers, college students, and young professionals monitoring active lifestyles.'
    }
  ];

  const createdBrands = [];
  for (const b of brandsData) {
    const user = await User.create({
      fullName: b.fullName,
      email: b.email,
      password: hashedPassword,
      role: 'brand',
      isVerified: true,
      isActive: true,
      registrationStatus: 'completed',
      profileImage: b.companyLogo
    });

    const profile = await BrandProfile.create({
      userId: user._id,
      companyName: b.companyName,
      industry: b.industry,
      aboutBrand: b.aboutBrand,
      companyLogo: b.companyLogo,
      profileImage: { url: b.companyLogo },
      website: b.website,
      location: { city: b.city, country: b.country },
      contactName: b.contactName,
      contactRole: b.contactRole,
      targetAudience: b.targetAudience,
      preferredCreatorCategories: ['Tech & Gadgets', 'Fashion & Lifestyle', 'Fitness & Wellness', 'Gaming', 'Travel', 'Beauty & Skincare'],
      preferredPlatforms: ['instagram', 'youtube', 'twitter']
    });

    createdBrands.push({ user, profile });
  }
  console.log(`✅ Seeded ${createdBrands.length} Brands.`);

  // ==========================================
  // 2. CREATORS (12 across 3 Tiers)
  // ==========================================
  console.log('🎨 Creating Creators (12 across 3 Tiers)...');
  const creatorsData = [
    // TIER 1 (Highest)
    {
      fullName: 'Shlok Srivastava (Tech Burner)',
      email: 'creator.techburner@collabx.demo',
      tier: 'Tier 1',
      niche: ['Tech & Gadgets'],
      category: 'Tech',
      followers: 1250000,
      engagementRate: 5.8,
      package1Price: 25000,
      package2Price: 50000,
      bio: 'Simplifying tech with energetic reviews, unboxings, and futuristic gadget tests. Tech that makes life exciting!',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'youtube', link: 'https://youtube.com/@techburner' },
        { platform: 'instagram', link: 'https://instagram.com/techburner' },
        { platform: 'twitter', link: 'https://x.com/tech_burner' }
      ],
      city: 'New Delhi',
      rating: 4.9,
      totalReviews: 28
    },
    {
      fullName: 'Naman Mathur (Mortal)',
      email: 'creator.mortal@collabx.demo',
      tier: 'Tier 1',
      niche: ['Gaming', 'Tech & Gadgets'],
      category: 'Gaming',
      followers: 3400000,
      engagementRate: 8.5,
      package1Price: 25000,
      package2Price: 48000,
      bio: 'Esports athlete, live streamer, and gaming gear connoisseur. India’s leading gaming content hub.',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'youtube', link: 'https://youtube.com/@mortal' },
        { platform: 'instagram', link: 'https://instagram.com/ig_mortal' }
      ],
      city: 'Mumbai',
      rating: 5.0,
      totalReviews: 42
    },
    {
      fullName: 'Tanmay Bhat',
      email: 'creator.tanmay@collabx.demo',
      tier: 'Tier 1',
      niche: ['Tech & Gadgets', 'Gaming'],
      category: 'Tech',
      followers: 2300000,
      engagementRate: 9.6,
      package1Price: 24000,
      package2Price: 48000,
      bio: 'Comedian, tech investor, and internet culture observer. High-engagement viral campaigns and comedy integrations.',
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'youtube', link: 'https://youtube.com/@tanmaybhat' },
        { platform: 'instagram', link: 'https://instagram.com/tanmaybhat' }
      ],
      city: 'Mumbai',
      rating: 5.0,
      totalReviews: 38
    },
    {
      fullName: 'Dhruv Rathee',
      email: 'creator.dhruv@collabx.demo',
      tier: 'Tier 1',
      niche: ['Tech & Gadgets', 'Travel'],
      category: 'Tech',
      followers: 2900000,
      engagementRate: 8.2,
      package1Price: 22000,
      package2Price: 45000,
      bio: 'Educator, documentary filmmaker, and travel vlogger explaining complex global stories simply.',
      profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'youtube', link: 'https://youtube.com/@dhruvrathee' },
        { platform: 'twitter', link: 'https://x.com/dhruv_rathee' }
      ],
      city: 'New Delhi',
      rating: 4.9,
      totalReviews: 40
    },

    // TIER 2 (Mid-Tier)
    {
      fullName: 'Kritika Khurana (ThatBohoGirl)',
      email: 'creator.kritika@collabx.demo',
      tier: 'Tier 2',
      niche: ['Fashion & Lifestyle'],
      category: 'Fashion',
      followers: 890000,
      engagementRate: 6.4,
      package1Price: 18000,
      package2Price: 35000,
      bio: 'Bohemian fashion inspiration, daily lifestyle lookbooks, and sustainable wardrobe styling tips.',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'instagram', link: 'https://instagram.com/thatbohogirl' },
        { platform: 'youtube', link: 'https://youtube.com/@thatbohogirl' }
      ],
      city: 'New Delhi',
      rating: 4.8,
      totalReviews: 19
    },
    {
      fullName: 'Kusha Kapila',
      email: 'creator.kusha@collabx.demo',
      tier: 'Tier 2',
      niche: ['Fashion & Lifestyle'],
      category: 'Fashion',
      followers: 1540000,
      engagementRate: 9.1,
      package1Price: 18000,
      package2Price: 35000,
      bio: 'Digital creator, actress, and comedy creator. Curating relatable lifestyle, viral humor, and brand partnerships.',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'instagram', link: 'https://instagram.com/kushakapila' },
        { platform: 'youtube', link: 'https://youtube.com/@kushakapila' }
      ],
      city: 'Mumbai',
      rating: 4.9,
      totalReviews: 25
    },
    {
      fullName: 'Gaurav Taneja (Flying Beast)',
      email: 'creator.gaurav@collabx.demo',
      tier: 'Tier 2',
      niche: ['Fitness & Wellness', 'Travel'],
      category: 'Fitness',
      followers: 1850000,
      engagementRate: 5.5,
      package1Price: 16000,
      package2Price: 32000,
      bio: 'Commercial pilot, national bodybuilder, and family vlogger bringing daily motivation and fitness discipline.',
      profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'youtube', link: 'https://youtube.com/@flyingbeast' },
        { platform: 'instagram', link: 'https://instagram.com/taneja.gaurav' }
      ],
      city: 'New Delhi',
      rating: 4.8,
      totalReviews: 30
    },

    // TIER 3 (Specialized & Emerging)
    {
      fullName: 'Ranveer Allahbadia (BeerBiceps)',
      email: 'creator.ranveer@collabx.demo',
      tier: 'Tier 3',
      niche: ['Fitness & Wellness', 'Tech & Gadgets'],
      category: 'Fitness',
      followers: 2150000,
      engagementRate: 7.2,
      package1Price: 15000,
      package2Price: 28000,
      bio: 'Podcaster, fitness motivator, and self-improvement enthusiast. Unlocking human potential and mental wellness.',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'youtube', link: 'https://youtube.com/@beerbiceps' },
        { platform: 'instagram', link: 'https://instagram.com/beerbiceps' }
      ],
      city: 'Mumbai',
      rating: 4.9,
      totalReviews: 34
    },
    {
      fullName: 'Shreya Jain',
      email: 'creator.shreya@collabx.demo',
      tier: 'Tier 3',
      niche: ['Beauty & Skincare'],
      category: 'Beauty',
      followers: 780000,
      engagementRate: 6.8,
      package1Price: 12000,
      package2Price: 24000,
      bio: 'Unfiltered, honest skincare and beauty makeup tutorials. Science-backed ingredient breakdowns and routine reviews.',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'youtube', link: 'https://youtube.com/@shreyajain' },
        { platform: 'instagram', link: 'https://instagram.com/shreyajain26' }
      ],
      city: 'New Delhi',
      rating: 4.9,
      totalReviews: 22
    },
    {
      fullName: 'Dolly Singh',
      email: 'creator.dolly@collabx.demo',
      tier: 'Tier 3',
      niche: ['Fashion & Lifestyle'],
      category: 'Fashion',
      followers: 990000,
      engagementRate: 7.4,
      package1Price: 12000,
      package2Price: 22000,
      bio: 'Fashion enthusiast, mental health advocate, and comedy content creator bringing warmth and authenticity.',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'instagram', link: 'https://instagram.com/dollysingh' }
      ],
      city: 'Nainital',
      rating: 4.8,
      totalReviews: 17
    },
    {
      fullName: 'Shenaz Treasury',
      email: 'creator.shenaz@collabx.demo',
      tier: 'Tier 3',
      niche: ['Travel'],
      category: 'Travel',
      followers: 650000,
      engagementRate: 4.9,
      package1Price: 10000,
      package2Price: 20000,
      bio: 'Travel influencer & explorer showcasing breathtaking hidden gems, luxury resorts, and adventure travel spots.',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'instagram', link: 'https://instagram.com/shenaztreasury' },
        { platform: 'youtube', link: 'https://youtube.com/@travelwithshenaz' }
      ],
      city: 'Goa',
      rating: 4.7,
      totalReviews: 15
    },
    {
      fullName: 'Radhika Seth',
      email: 'creator.radhika@collabx.demo',
      tier: 'Tier 3',
      niche: ['Fashion & Lifestyle', 'Beauty & Skincare'],
      category: 'Beauty',
      followers: 520000,
      engagementRate: 5.9,
      package1Price: 8000,
      package2Price: 16000,
      bio: 'Luxury fashion model, lifestyle aesthetician, and beauty creator sharing elevated editorial styling.',
      profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      platforms: [
        { platform: 'instagram', link: 'https://instagram.com/radhikasethh' }
      ],
      city: 'Mumbai',
      rating: 4.7,
      totalReviews: 12
    }
  ];

  const createdCreators = [];
  for (const c of creatorsData) {
    const user = await User.create({
      fullName: c.fullName,
      email: c.email,
      password: hashedPassword,
      role: 'creator',
      isVerified: true,
      isActive: true,
      registrationStatus: 'completed',
      profileImage: c.profileImage
    });

    const profile = await CreatorProfile.create({
      userId: user._id,
      bio: c.bio,
      profileImage: { url: c.profileImage },
      niche: c.niche,
      followers: c.followers,
      engagementRate: c.engagementRate,
      platforms: c.platforms,
      location: { city: c.city, country: 'India' },
      rating: c.rating,
      totalReviews: c.totalReviews,
      audienceMetrics: {
        instagram: { followers: Math.floor(c.followers * 0.6), engagementRate: c.engagementRate },
        youtube: { subscribers: Math.floor(c.followers * 0.4), engagementRate: c.engagementRate }
      }
    });

    // Create pricing packages with rebalanced realistic prices
    await Pricing.create([
      {
        creatorId: user._id,
        title: 'Instagram Reel + Story Pack',
        description: '1 Dedicated 60-second 4K Instagram Reel with brand tag, custom discount code, and 2 supporting swipe-up Stories.',
        platform: 'Instagram',
        price: c.package1Price,
        deliveryDays: 5,
        revisions: 2,
        deliverables: ['1x Instagram Reel (60s)', '2x Instagram Stories (24h)']
      },
      {
        creatorId: user._id,
        title: 'Dedicated YouTube Video & Integration',
        description: 'Comprehensive dedicated 8-12 minute YouTube video review with product demonstration, link in description, and pinned comment.',
        platform: 'YouTube',
        price: c.package2Price,
        deliveryDays: 10,
        revisions: 3,
        deliverables: ['1x Dedicated YouTube Video (8-12 mins)', 'Link in description & Pinned Comment', 'Social cross-promo post']
      }
    ]);

    // Create portfolio items
    await Portfolio.create([
      {
        creator: user._id,
        title: `${c.niche[0]} Feature & Product Unboxing`,
        description: 'Dedicated studio production review highlighting key features, technical benchmarks, and real-world testing.',
        brandName: 'Leading Tech Brand',
        platform: 'youtube',
        mediaType: 'video',
        campaignValue: c.package2Price || 45000,
        views: `${(c.followers > 1000000 ? (c.followers / 1000000 * 0.4).toFixed(1) + 'M' : Math.floor(c.followers * 0.4 / 1000) + 'K')}`,
        engagementRate: `${c.engagementRate || 8.5}%`,
        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=600&auto=format&fit=crop&q=80',
        likes: Math.floor(c.followers * 0.04)
      },
      {
        creator: user._id,
        title: 'Viral Instagram Reel & Story Series',
        description: 'High-energy lifestyle integration skit showcasing product unboxing and daily utility in under 60 seconds.',
        brandName: 'Lifestyle Partner',
        platform: 'instagram',
        mediaType: 'video',
        campaignValue: c.package1Price || 25000,
        views: `${(c.followers > 1000000 ? (c.followers / 1000000 * 0.6).toFixed(1) + 'M' : Math.floor(c.followers * 0.6 / 1000) + 'K')}`,
        engagementRate: `${((c.engagementRate || 8.0) + 1.2).toFixed(1)}%`,
        contentUrl: 'https://www.instagram.com',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        likes: Math.floor(c.followers * 0.03)
      },
      {
        creator: user._id,
        title: 'Trending Shorts Quick Review',
        description: 'Snappy vertical video breakdown with engaging on-screen captions and audio effects.',
        brandName: 'D2C Consumer Brand',
        platform: 'shorts-reels',
        mediaType: 'video',
        campaignValue: Math.round((c.package1Price || 25000) * 0.8),
        views: `${(c.followers > 1000000 ? (c.followers / 1000000 * 0.8).toFixed(1) + 'M' : Math.floor(c.followers * 0.8 / 1000) + 'K')}`,
        engagementRate: `${((c.engagementRate || 8.0) + 2.0).toFixed(1)}%`,
        contentUrl: 'https://www.youtube.com',
        thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
        likes: Math.floor(c.followers * 0.05)
      }
    ]);

    createdCreators.push({ user, profile, data: c });
  }
  console.log(`✅ Seeded ${createdCreators.length} Creators with Profiles, Pricing, & Portfolios.`);

  // ==========================================
  // 3. CAMPAIGNS (12 campaigns in range ₹20k - ₹100k)
  // ==========================================
  console.log('📢 Creating Campaigns (12 with budgets ₹20,000 - ₹100,000)...');
  const [nike, boat, zomato, swiggy, mamaearth, noise] = createdBrands;
  const [techBurner, mortal, tanmay, dhruv, bohoGirl, kusha, flyingBeast, beerBiceps, shreyaJain, dolly, shenaz, radhika] = createdCreators;

  const campaignsData = [
    {
      brand: nike,
      title: 'Nike Air Max 2026 Ignite Campaign',
      description: 'Promote the newly engineered Air Max 2026 running shoes focusing on revolutionary cushioning, futuristic style, and athletic performance.',
      category: 'Fashion & Lifestyle',
      budget: 85000,
      platforms: ['youtube', 'instagram'],
      deliverables: ['1 Dedicated YouTube Video (6-8 min)', '1 Instagram Reel', '3 Story Updates'],
      deadline: new Date(Date.now() + 20 * 86400000),
      status: 'active'
    },
    {
      brand: nike,
      title: 'Run With Pegasus - National Marathon Season',
      description: 'Highlight endurance training and daily road running with Nike Pegasus. Creators must capture authentic morning training runs.',
      category: 'Fitness & Wellness',
      budget: 60000,
      platforms: ['instagram'],
      deliverables: ['2 Instagram Reels with audio voiceover', 'Story link sticker'],
      deadline: new Date(Date.now() + 30 * 86400000),
      status: 'active'
    },
    {
      brand: boat,
      title: 'boAt Nirvana ANC Experience: Sound of Silence',
      description: 'Experience pure uncompromised audio with Active Noise Cancellation. Target gamers, remote professionals, and audiophiles.',
      category: 'Tech & Gadgets',
      budget: 50000,
      platforms: ['youtube', 'instagram'],
      deliverables: ['1 YouTube tech review segment (90s)', '1 Instagram Reel in noisy environment test'],
      deadline: new Date(Date.now() + 15 * 86400000),
      status: 'active'
    },
    {
      brand: boat,
      title: 'boAt Airdopes Max Ultra Launch Blitz',
      description: 'Fastest charging TWS earbuds with beast mode ultra-low latency for competitive mobile gaming and nonstop music.',
      category: 'Gaming',
      budget: 35000,
      platforms: ['youtube'],
      deliverables: ['Gaming stream shoutout + dedicated unboxing reel'],
      deadline: new Date(Date.now() + 25 * 86400000),
      status: 'active'
    },
    {
      brand: zomato,
      title: 'Zomato Grand Food Carnival Reel Tour',
      description: 'Explore the hottest curated restaurant menus, hidden street eats, and trending bakeries in your city exclusively on Zomato.',
      category: 'Travel',
      budget: 70000,
      platforms: ['instagram'],
      deliverables: ['2 High-energy Food Crawl Reels with geo-tags and Zomato Gold coupon code'],
      deadline: new Date(Date.now() + 14 * 86400000),
      status: 'active'
    },
    {
      brand: zomato,
      title: 'Zomato Midnight Cravings Campaign',
      description: 'Late night study sessions and midnight snacking delivered fast. Target students and night owls across metro cities.',
      category: 'Fashion & Lifestyle',
      budget: 45000,
      platforms: ['instagram'],
      deliverables: ['1 Late Night Reel + 2 Stories'],
      deadline: new Date(Date.now() + 19 * 86400000),
      status: 'active'
    },
    {
      brand: swiggy,
      title: 'Swiggy Instamart 10-Min Super Delivery Challenge',
      description: 'Humorous, relatable challenges testing unexpected midnight cravings and grocery delivery in under 10 minutes flat.',
      category: 'Tech & Gadgets',
      budget: 80000,
      platforms: ['youtube', 'instagram'],
      deliverables: ['1 Comedy sketch / live test video with timer counter'],
      deadline: new Date(Date.now() + 18 * 86400000),
      status: 'active'
    },
    {
      brand: swiggy,
      title: 'Swiggy Gourmet Dining & Luxury Bites',
      description: 'Experience 5-star chef curated dishes delivered right to your doorstep for special anniversaries and weekend dates.',
      category: 'Travel',
      budget: 55000,
      platforms: ['instagram'],
      deliverables: ['1 Fine dining aesthetic Reel + food styling review'],
      deadline: new Date(Date.now() + 21 * 86400000),
      status: 'active'
    },
    {
      brand: mamaearth,
      title: 'Mamaearth Rice Water Radiant Skin Routine',
      description: 'Demonstrate clean, glass-skin beauty routines utilizing fermented rice water formula for deep hydration and natural radiance.',
      category: 'Beauty & Skincare',
      budget: 50000,
      platforms: ['instagram', 'youtube'],
      deliverables: ['1 Detailed morning skincare routine Reel + ingredient review'],
      deadline: new Date(Date.now() + 22 * 86400000),
      status: 'active'
    },
    {
      brand: mamaearth,
      title: 'Mamaearth Onion Hair Fall Control Challenge',
      description: '21-day hair fall reduction challenge with plant keratin and red onion oil. Document before & after hair strength.',
      category: 'Beauty & Skincare',
      budget: 48000,
      platforms: ['instagram'],
      deliverables: ['2 Reel updates documenting hair transformation'],
      deadline: new Date(Date.now() + 35 * 86400000),
      status: 'active'
    },
    {
      brand: noise,
      title: 'Noise ColorFit Ultra 4 Pro - Precision in Motion',
      description: 'Showcase AMOLED clarity, 100+ sports tracking modes, and sleek metallic finish on India’s flagship smartwatch.',
      category: 'Fitness & Wellness',
      budget: 65000,
      platforms: ['instagram', 'youtube'],
      deliverables: ['1 Full day in the life fitness tracking vlog'],
      deadline: new Date(Date.now() + 28 * 86400000),
      status: 'active'
    },
    {
      brand: noise,
      title: 'Noise Buds VS104 Pro - Sound Amplified',
      description: 'Affordable audiophile earbuds with 40-hour playtime and Quad Mic ENC for crystal-clear calls on the go.',
      category: 'Tech & Gadgets',
      budget: 38000,
      platforms: ['youtube'],
      deliverables: ['1 Dedicated unboxing & microphone audio test'],
      deadline: new Date(Date.now() + 16 * 86400000),
      status: 'active'
    }
  ];

  const createdCampaigns = [];
  for (const c of campaignsData) {
    const campaign = await Campaign.create({
      brandId: c.brand.user._id,
      brandName: c.brand.profile.companyName,
      brandLogo: c.brand.profile.companyLogo,
      title: c.title,
      description: c.description,
      category: c.category,
      budget: c.budget,
      currency: 'INR',
      platforms: c.platforms,
      deliverables: c.deliverables,
      deadline: c.deadline,
      status: c.status,
      isActive: true,
      isPublic: true,
      minFollowers: 50000,
      applicantsCount: Math.floor(5 + Math.random() * 20),
      views: Math.floor(100 + Math.random() * 500)
    });
    createdCampaigns.push(campaign);
  }
  console.log(`✅ Seeded ${createdCampaigns.length} Campaigns.`);

  // ==========================================
  // 4. INVITATIONS (Rebalanced range ₹10,000 - ₹80,000)
  // ==========================================
  console.log('✉️ Creating Invitations with rebalanced proposed prices...');

  // State 1: accepted
  const invAccepted1 = await Invitation.create({
    campaignId: createdCampaigns[0]._id,
    campaignTitle: createdCampaigns[0].title,
    brandId: nike.user._id,
    brandName: nike.profile.companyName,
    brandLogo: nike.profile.companyLogo,
    creatorId: techBurner.user._id,
    creatorName: techBurner.user.fullName,
    creatorAvatar: techBurner.user.profileImage,
    proposedPrice: 65000,
    deliverables: createdCampaigns[0].deliverables,
    message: 'Hey Shlok! We would love for you to lead the Air Max 2026 digital launch video.',
    status: 'accepted'
  });

  const invAccepted2 = await Invitation.create({
    campaignId: createdCampaigns[6]._id,
    campaignTitle: createdCampaigns[6].title,
    brandId: swiggy.user._id,
    brandName: swiggy.profile.companyName,
    brandLogo: swiggy.profile.companyLogo,
    creatorId: tanmay.user._id,
    creatorName: tanmay.user.fullName,
    creatorAvatar: tanmay.user.profileImage,
    proposedPrice: 55000,
    deliverables: createdCampaigns[6].deliverables,
    message: 'Hey Tanmay! We want a viral 10-minute grocery test skit for Swiggy Instamart.',
    status: 'accepted'
  });

  const invAccepted3 = await Invitation.create({
    campaignId: createdCampaigns[8]._id,
    campaignTitle: createdCampaigns[8].title,
    brandId: mamaearth.user._id,
    brandName: mamaearth.profile.companyName,
    brandLogo: mamaearth.profile.companyLogo,
    creatorId: shreyaJain.user._id,
    creatorName: shreyaJain.user.fullName,
    creatorAvatar: shreyaJain.user.profileImage,
    proposedPrice: 40000,
    deliverables: createdCampaigns[8].deliverables,
    message: 'Hi Shreya! We would be honored to partner with you for our Rice Water skincare campaign.',
    status: 'accepted'
  });

  // State 2: negotiating
  const invNegotiating1 = await Invitation.create({
    campaignId: createdCampaigns[2]._id,
    campaignTitle: createdCampaigns[2].title,
    brandId: boat.user._id,
    brandName: boat.profile.companyName,
    brandLogo: boat.profile.companyLogo,
    creatorId: mortal.user._id,
    creatorName: mortal.user.fullName,
    creatorAvatar: mortal.user.profileImage,
    proposedPrice: 38000,
    deliverables: createdCampaigns[2].deliverables,
    message: 'Hey Mortal, boAt Nirvana ANC is launching and we want you to test gaming audio latency live!',
    status: 'negotiating'
  });

  const invNegotiating2 = await Invitation.create({
    campaignId: createdCampaigns[10]._id,
    campaignTitle: createdCampaigns[10].title,
    brandId: noise.user._id,
    brandName: noise.profile.companyName,
    brandLogo: noise.profile.companyLogo,
    creatorId: flyingBeast.user._id,
    creatorName: flyingBeast.user.fullName,
    creatorAvatar: flyingBeast.user.profileImage,
    proposedPrice: 45000,
    deliverables: createdCampaigns[10].deliverables,
    message: 'Hey Gaurav! Track your high-altitude flight workout with ColorFit Ultra 4 Pro.',
    status: 'negotiating'
  });

  // State 3: pending
  const invPending1 = await Invitation.create({
    campaignId: createdCampaigns[4]._id,
    campaignTitle: createdCampaigns[4].title,
    brandId: zomato.user._id,
    brandName: zomato.profile.companyName,
    brandLogo: zomato.profile.companyLogo,
    creatorId: kusha.user._id,
    creatorName: kusha.user.fullName,
    creatorAvatar: kusha.user.profileImage,
    proposedPrice: 50000,
    deliverables: createdCampaigns[4].deliverables,
    message: 'Hey Kusha! We want you to create your signature comedy skit around late night food cravings with Zomato Gold.',
    status: 'pending'
  });

  const invPending2 = await Invitation.create({
    campaignId: createdCampaigns[1]._id,
    campaignTitle: createdCampaigns[1].title,
    brandId: nike.user._id,
    brandName: nike.profile.companyName,
    brandLogo: nike.profile.companyLogo,
    creatorId: dhruv.user._id,
    creatorName: dhruv.user.fullName,
    creatorAvatar: dhruv.user.profileImage,
    proposedPrice: 55000,
    deliverables: createdCampaigns[1].deliverables,
    message: 'Hi Dhruv, we would love a science-of-running documentary angle with Nike Pegasus.',
    status: 'pending'
  });

  const invPending3 = await Invitation.create({
    campaignId: createdCampaigns[7]._id,
    campaignTitle: createdCampaigns[7].title,
    brandId: swiggy.user._id,
    brandName: swiggy.profile.companyName,
    brandLogo: swiggy.profile.companyLogo,
    creatorId: shenaz.user._id,
    creatorName: shenaz.user.fullName,
    creatorAvatar: shenaz.user.profileImage,
    proposedPrice: 35000,
    deliverables: createdCampaigns[7].deliverables,
    message: 'Hey Shenaz! Explore gourmet hotel bites delivered on Swiggy Gourmet during your Goa trips.',
    status: 'pending'
  });

  // State 4: rejected
  const invRejected1 = await Invitation.create({
    campaignId: createdCampaigns[10]._id,
    campaignTitle: createdCampaigns[10].title,
    brandId: noise.user._id,
    brandName: noise.profile.companyName,
    brandLogo: noise.profile.companyLogo,
    creatorId: beerBiceps.user._id,
    creatorName: beerBiceps.user.fullName,
    creatorAvatar: beerBiceps.user.profileImage,
    proposedPrice: 25000,
    deliverables: createdCampaigns[10].deliverables,
    message: 'Invitation for ColorFit Ultra 4 Pro campaign.',
    status: 'rejected'
  });

  const invRejected2 = await Invitation.create({
    campaignId: createdCampaigns[3]._id,
    campaignTitle: createdCampaigns[3].title,
    brandId: boat.user._id,
    brandName: boat.profile.companyName,
    brandLogo: boat.profile.companyLogo,
    creatorId: dolly.user._id,
    creatorName: dolly.user.fullName,
    creatorAvatar: dolly.user.profileImage,
    proposedPrice: 20000,
    deliverables: createdCampaigns[3].deliverables,
    message: 'Collaboration invite for boAt Airdopes launch.',
    status: 'rejected'
  });

  console.log('✅ Seeded Invitations in all 4 states.');

  // ==========================================
  // 5. NEGOTIATIONS (Rebalanced range ₹15,000 - ₹80,000)
  // ==========================================
  console.log('💬 Creating Negotiations with realistic counter-offer flows...');

  // Negotiation 1: boAt <-> Mortal (OPEN with counter offers)
  await Negotiation.create({
    invitationId: invNegotiating1._id,
    campaignId: createdCampaigns[2]._id,
    campaignName: createdCampaigns[2].title,
    brandId: boat.user._id,
    brandName: boat.profile.companyName,
    brandLogo: boat.profile.companyLogo,
    creatorId: mortal.user._id,
    creatorName: mortal.user.fullName,
    creatorAvatar: mortal.user.profileImage,
    proposedBudget: 38000,
    currentBudget: 45000,
    status: 'open',
    offers: [
      {
        senderId: boat.user._id,
        senderRole: 'brand',
        senderName: boat.profile.companyName,
        senderAvatar: boat.profile.companyLogo,
        message: 'We are offering ₹38,000 for a dedicated tournament stream review and Instagram Reel.',
        proposedBudget: 38000,
        status: 'offered'
      },
      {
        senderId: mortal.user._id,
        senderRole: 'creator',
        senderName: mortal.user.fullName,
        senderAvatar: mortal.user.profileImage,
        message: 'Thanks boAt team! For a prime-time tournament livestream integration and 4K reel, my standard rate is ₹50,000. I can meet you at ₹45,000.',
        proposedBudget: 45000,
        status: 'countered'
      }
    ]
  });

  // Negotiation 2: Noise <-> Flying Beast (OPEN with counter offers)
  await Negotiation.create({
    invitationId: invNegotiating2._id,
    campaignId: createdCampaigns[10]._id,
    campaignName: createdCampaigns[10].title,
    brandId: noise.user._id,
    brandName: noise.profile.companyName,
    brandLogo: noise.profile.companyLogo,
    creatorId: flyingBeast.user._id,
    creatorName: flyingBeast.user.fullName,
    creatorAvatar: flyingBeast.user.profileImage,
    proposedBudget: 45000,
    currentBudget: 52000,
    status: 'open',
    offers: [
      {
        senderId: noise.user._id,
        senderRole: 'brand',
        senderName: noise.profile.companyName,
        senderAvatar: noise.profile.companyLogo,
        message: 'We propose ₹45,000 for a full-day vlog with fitness tracking metrics integration.',
        proposedBudget: 45000,
        status: 'offered'
      },
      {
        senderId: flyingBeast.user._id,
        senderRole: 'creator',
        senderName: flyingBeast.user.fullName,
        senderAvatar: flyingBeast.user.profileImage,
        message: 'Our audience loves fitness vlogs. Given our average views per vlog, ₹52,000 ensures maximum production quality and social push.',
        proposedBudget: 52000,
        status: 'countered'
      }
    ]
  });

  // Negotiation 3: Nike <-> Tech Burner (AGREED negotiation)
  await Negotiation.create({
    invitationId: invAccepted1._id,
    campaignId: createdCampaigns[0]._id,
    campaignName: createdCampaigns[0].title,
    brandId: nike.user._id,
    brandName: nike.profile.companyName,
    brandLogo: nike.profile.companyLogo,
    creatorId: techBurner.user._id,
    creatorName: techBurner.user.fullName,
    creatorAvatar: techBurner.user.profileImage,
    proposedBudget: 60000,
    currentBudget: 68000,
    agreedBudget: 68000,
    status: 'agreed',
    offers: [
      {
        senderId: nike.user._id,
        senderRole: 'brand',
        senderName: nike.profile.companyName,
        senderAvatar: nike.profile.companyLogo,
        message: 'Initial proposal: ₹60,000 for full video integration.',
        proposedBudget: 60000,
        status: 'offered'
      },
      {
        senderId: techBurner.user._id,
        senderRole: 'creator',
        senderName: techBurner.user.fullName,
        senderAvatar: techBurner.user.profileImage,
        message: 'Can do ₹68,000 including 3 extra Instagram Story links and giveaway segment.',
        proposedBudget: 68000,
        status: 'countered'
      },
      {
        senderId: nike.user._id,
        senderRole: 'brand',
        senderName: nike.profile.companyName,
        senderAvatar: nike.profile.companyLogo,
        message: 'Agreed! We are excited to work with you on the Air Max launch.',
        proposedBudget: 68000,
        status: 'accepted'
      }
    ]
  });

  // Negotiation 4: Noise <-> BeerBiceps (REJECTED negotiation)
  await Negotiation.create({
    invitationId: invRejected1._id,
    campaignId: createdCampaigns[10]._id,
    campaignName: createdCampaigns[10].title,
    brandId: noise.user._id,
    brandName: noise.profile.companyName,
    brandLogo: noise.profile.companyLogo,
    creatorId: beerBiceps.user._id,
    creatorName: beerBiceps.user.fullName,
    creatorAvatar: beerBiceps.user.profileImage,
    proposedBudget: 25000,
    currentBudget: 25000,
    status: 'rejected',
    offers: [
      {
        senderId: noise.user._id,
        senderRole: 'brand',
        senderName: noise.profile.companyName,
        senderAvatar: noise.profile.companyLogo,
        message: 'Proposed ₹25,000 for podcast integration.',
        proposedBudget: 25000,
        status: 'offered'
      },
      {
        senderId: beerBiceps.user._id,
        senderRole: 'creator',
        senderName: beerBiceps.user.fullName,
        senderAvatar: beerBiceps.user.profileImage,
        message: 'Sorry, our podcast sponsorship slots are fully booked for this quarter.',
        proposedBudget: 25000,
        status: 'declined'
      }
    ]
  });

  console.log('✅ Seeded Negotiations with realistic counter-offer flows.');

  // ==========================================
  // 6. COLLABORATIONS (Rebalanced range ₹20,000 - ₹75,000)
  // ==========================================
  console.log('🤝 Creating Active Collaborations with rebalanced agreed prices...');

  // Collab 1: Nike <-> Tech Burner (Agreed: ₹68,000)
  const collab1 = await Collaboration.create({
    campaignId: createdCampaigns[0]._id,
    campaignTitle: createdCampaigns[0].title,
    brandId: nike.user._id,
    brandName: nike.profile.companyName,
    brandLogo: nike.profile.companyLogo,
    creatorId: techBurner.user._id,
    creatorName: techBurner.user.fullName,
    creatorAvatar: techBurner.user.profileImage,
    invitationId: invAccepted1._id,
    agreedPrice: 68000,
    agreedBudget: 68000,
    status: 'content_submitted',
    stage: 'content_submitted',
    submissionUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    submissionNotes: 'Unlisted 4K video draft ready. Sneaker cushioning breakdown at 02:15, sprint test on track at 04:30. Hashtag #NikeAirMax included.',
    submittedAt: new Date(Date.now() - 86400000),
    deadline: new Date(Date.now() + 10 * 86400000),
    deliverables: [
      {
        type: 'video',
        title: 'Dedicated YouTube Video (6-8 min)',
        submissionUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'submitted',
        submittedAt: new Date(Date.now() - 86400000)
      }
    ]
  });

  // Collab 2: Swiggy <-> Tanmay Bhat (Agreed: ₹55,000)
  const collab2 = await Collaboration.create({
    campaignId: createdCampaigns[6]._id,
    campaignTitle: createdCampaigns[6].title,
    brandId: swiggy.user._id,
    brandName: swiggy.profile.companyName,
    brandLogo: swiggy.profile.companyLogo,
    creatorId: tanmay.user._id,
    creatorName: tanmay.user.fullName,
    creatorAvatar: tanmay.user.profileImage,
    invitationId: invAccepted2._id,
    agreedPrice: 55000,
    agreedBudget: 55000,
    status: 'brand_approved',
    stage: 'brand_approved',
    submissionUrl: 'https://www.instagram.com/reel/C3_mock_swiggy10min/',
    submissionNotes: 'Instamart delivery timer skit edited and finalized. Brand team approved pacing and humor!',
    submittedAt: new Date(Date.now() - 2 * 86400000),
    approvedAt: new Date(Date.now() - 86400000),
    deadline: new Date(Date.now() + 7 * 86400000),
    deliverables: [
      {
        type: 'video',
        title: 'Instamart Comedy Skit Reel',
        submissionUrl: 'https://www.instagram.com/reel/C3_mock_swiggy10min/',
        status: 'approved',
        submittedAt: new Date(Date.now() - 2 * 86400000)
      }
    ]
  });

  // Collab 3: Mamaearth <-> Shreya Jain (Agreed: ₹40,000)
  const collab3 = await Collaboration.create({
    campaignId: createdCampaigns[8]._id,
    campaignTitle: createdCampaigns[8].title,
    brandId: mamaearth.user._id,
    brandName: mamaearth.profile.companyName,
    brandLogo: mamaearth.profile.companyLogo,
    creatorId: shreyaJain.user._id,
    creatorName: shreyaJain.user.fullName,
    creatorAvatar: shreyaJain.user.profileImage,
    invitationId: invAccepted3._id,
    agreedPrice: 40000,
    agreedBudget: 40000,
    status: 'completed',
    stage: 'completed',
    submissionUrl: 'https://www.youtube.com/watch?v=sample_mamaearth_glow',
    submissionNotes: 'Full 10-minute skincare regimen published and live.',
    submittedAt: new Date(Date.now() - 10 * 86400000),
    approvedAt: new Date(Date.now() - 8 * 86400000),
    completedAt: new Date(Date.now() - 7 * 86400000),
    deadline: new Date(Date.now() - 5 * 86400000),
    deliverables: [
      {
        type: 'video',
        title: 'Skincare Morning Routine Video',
        submissionUrl: 'https://www.youtube.com/watch?v=sample_mamaearth_glow',
        status: 'approved',
        submittedAt: new Date(Date.now() - 10 * 86400000)
      }
    ]
  });

  // Collab 4: boAt <-> Mortal (Agreed: ₹32,000)
  const collab4 = await Collaboration.create({
    campaignId: createdCampaigns[3]._id,
    campaignTitle: createdCampaigns[3].title,
    brandId: boat.user._id,
    brandName: boat.profile.companyName,
    brandLogo: boat.profile.companyLogo,
    creatorId: mortal.user._id,
    creatorName: mortal.user.fullName,
    creatorAvatar: mortal.user.profileImage,
    agreedPrice: 32000,
    agreedBudget: 32000,
    status: 'active',
    stage: 'active',
    deadline: new Date(Date.now() + 12 * 86400000),
    deliverables: [
      {
        type: 'video',
        title: 'Gaming Stream Shoutout + Unboxing',
        status: 'pending'
      }
    ]
  });

  // Collab 5: Nike <-> Kritika Khurana (Agreed: ₹45,000)
  const collab5 = await Collaboration.create({
    campaignId: createdCampaigns[1]._id,
    campaignTitle: createdCampaigns[1].title,
    brandId: nike.user._id,
    brandName: nike.profile.companyName,
    brandLogo: nike.profile.companyLogo,
    creatorId: bohoGirl.user._id,
    creatorName: bohoGirl.user.fullName,
    creatorAvatar: bohoGirl.user.profileImage,
    agreedPrice: 45000,
    agreedBudget: 45000,
    status: 'revision_requested',
    stage: 'revision_requested',
    submissionUrl: 'https://www.instagram.com/reel/draft_pegasus_kritika/',
    submissionNotes: 'First draft with morning trail run aesthetic.',
    revisionNotes: 'Please include closeup shots of the Pegasus outsole grip during the running stride and highlight the breathable mesh in natural lighting.',
    submittedAt: new Date(Date.now() - 3 * 86400000),
    revisionRequestedAt: new Date(Date.now() - 86400000),
    deadline: new Date(Date.now() + 8 * 86400000),
    deliverables: [
      {
        type: 'video',
        title: '2x Instagram Reels for Pegasus',
        submissionUrl: 'https://www.instagram.com/reel/draft_pegasus_kritika/',
        status: 'revision_requested',
        submittedAt: new Date(Date.now() - 3 * 86400000)
      }
    ]
  });

  console.log('✅ Seeded 5 Collaborations across all lifecycle stages.');

  // ==========================================
  // 7. NOTIFICATIONS (30+ for Brands, 30+ for Creators with realistic timestamps & INR values)
  // ==========================================
  console.log('🔔 Creating Comprehensive Notifications for Brands and Creators...');
  const now = Date.now();
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;

  const notificationsData = [
    // ---------------- BRAND NOTIFICATIONS (32 total) ----------------
    // boAt Lifestyle (Primary Brand Demo Account: brand.boat@collabx.demo)
    {
      userId: boat.user._id,
      senderId: mortal.user._id,
      title: 'Counter-Offer Received',
      message: 'Mortal submitted a counter offer of ₹45,000 for "boAt Nirvana ANC Experience".',
      type: 'offer_received',
      entityId: invNegotiating1._id,
      entityType: 'Invitation',
      isRead: false,
      createdAt: new Date(now - 12 * min)
    },
    {
      userId: boat.user._id,
      senderId: techBurner.user._id,
      title: 'Invitation Accepted',
      message: 'Shlok Srivastava (Tech Burner) accepted your collaboration brief for "boAt Bassheads Launch".',
      type: 'invitation_accepted',
      entityId: collab1._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 45 * min)
    },
    {
      userId: boat.user._id,
      senderId: mortal.user._id,
      title: 'Deliverables Submitted for Review',
      message: 'Mortal uploaded draft video and audio testing clips for "boAt Nirvana ANC Experience".',
      type: 'content_submitted',
      entityId: collab1._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 3 * hour)
    },
    {
      userId: boat.user._id,
      senderId: mortal.user._id,
      title: 'Escrow Funds Secured',
      message: '₹45,000 deposited into CollabX Escrow Vault for "boAt Nirvana ANC Experience".',
      type: 'escrow_funded',
      entityId: collab1._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 1 * day)
    },
    {
      userId: boat.user._id,
      senderId: techBurner.user._id,
      title: 'Collaboration Completed',
      message: 'Campaign collaboration with Tech Burner marked as completed successfully.',
      type: 'collaboration_completed',
      entityId: collab1._id,
      entityType: 'Collaboration',
      isRead: true,
      createdAt: new Date(now - 2 * day)
    },
    {
      userId: boat.user._id,
      senderId: mortal.user._id,
      title: '5-Star Review Received',
      message: 'Mortal left a 5★ review: "Incredible brand to work with! Clear briefs and prompt escrow release."',
      type: 'review_received',
      entityId: collab1._id,
      entityType: 'Review',
      isRead: true,
      createdAt: new Date(now - 4 * day)
    },
    {
      userId: boat.user._id,
      title: 'Campaign Brief Published',
      message: 'Your campaign "boAt Rockerz 550 Wireless" has been published with budget ₹70,000.',
      type: 'campaign_created',
      entityId: createdCampaigns[0]._id,
      entityType: 'Campaign',
      isRead: true,
      createdAt: new Date(now - 6 * day)
    },

    // Nike India (Brand)
    {
      userId: nike.user._id,
      senderId: techBurner.user._id,
      title: 'Content Submitted for Review',
      message: 'Shlok Srivastava (Tech Burner) submitted draft deliverables for "Nike Air Max 2026 Ignite Campaign".',
      type: 'content_submitted',
      entityId: collab1._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 8 * min)
    },
    {
      userId: nike.user._id,
      senderId: bohoGirl.user._id,
      title: 'Invitation Accepted',
      message: 'Kritika Khurana accepted your collaboration invitation for "Run With Pegasus".',
      type: 'invitation_accepted',
      entityId: collab5._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 1 * hour)
    },
    {
      userId: nike.user._id,
      senderId: flyingBeast.user._id,
      title: 'Counter-Offer Received',
      message: 'Gaurav Taneja countered your offer with ₹40,000 for "Nike Training Club Challenge".',
      type: 'offer_received',
      entityId: invNegotiating2._id,
      entityType: 'Invitation',
      isRead: false,
      createdAt: new Date(now - 4 * hour)
    },
    {
      userId: nike.user._id,
      senderId: bohoGirl.user._id,
      title: 'Revised Content Uploaded',
      message: 'Kritika Khurana updated the outsole grip closeups per your revision request.',
      type: 'content_resubmitted',
      entityId: collab5._id,
      entityType: 'Collaboration',
      isRead: true,
      createdAt: new Date(now - 1 * day)
    },
    {
      userId: nike.user._id,
      senderId: techBurner.user._id,
      title: 'Escrow Payout Released',
      message: '₹65,000 escrow payout has been transferred to Shlok Srivastava.',
      type: 'escrow_released',
      entityId: collab1._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 3 * day)
    },
    {
      userId: nike.user._id,
      title: 'Campaign Status Updated',
      message: 'Campaign brief "Nike Air Max 2026 Ignite Campaign" is now active.',
      type: 'campaign_updated',
      entityId: createdCampaigns[0]._id,
      entityType: 'Campaign',
      isRead: true,
      createdAt: new Date(now - 5 * day)
    },

    // Swiggy (Brand)
    {
      userId: swiggy.user._id,
      senderId: tanmay.user._id,
      title: 'Deliverables Ready for Finalization',
      message: 'Tanmay Bhat completed approved revisions for "Swiggy Instamart Late Night Challenge".',
      type: 'content_approved',
      entityId: collab2._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 25 * min)
    },
    {
      userId: swiggy.user._id,
      senderId: dolly.user._id,
      title: 'Invitation Accepted',
      message: 'Dolly Singh accepted your collaboration invitation for "Gourmet Flavors Fest".',
      type: 'invitation_accepted',
      entityId: invAccepted1._id,
      entityType: 'Invitation',
      isRead: false,
      createdAt: new Date(now - 2 * hour)
    },
    {
      userId: swiggy.user._id,
      senderId: tanmay.user._id,
      title: 'Escrow Funds Secured',
      message: '₹50,000 secured in CollabX Escrow for "Swiggy Instamart Late Night Challenge".',
      type: 'escrow_funded',
      entityId: collab2._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 1 * day)
    },
    {
      userId: swiggy.user._id,
      senderId: tanmay.user._id,
      title: '5-Star Review Received',
      message: 'Tanmay Bhat gave Swiggy 5★: "Super hilarious collaboration! Quick approvals and smooth payment."',
      type: 'review_received',
      entityId: collab2._id,
      entityType: 'Review',
      isRead: true,
      createdAt: new Date(now - 3 * day)
    },
    {
      userId: swiggy.user._id,
      title: 'Campaign Brief Published',
      message: 'New campaign "Swiggy Dineout Weekend Special" is live with budget ₹60,000.',
      type: 'campaign_created',
      entityId: createdCampaigns[1]._id,
      entityType: 'Campaign',
      isRead: true,
      createdAt: new Date(now - 7 * day)
    },

    // Zomato (Brand)
    {
      userId: zomato.user._id,
      senderId: kusha.user._id,
      title: 'Content Submitted for Review',
      message: 'Kusha Kapila uploaded Instagram Reel draft for "Zomato Legends Feast".',
      type: 'content_submitted',
      entityId: collab4._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 15 * min)
    },
    {
      userId: zomato.user._id,
      senderId: beerBiceps.user._id,
      title: 'Counter-Offer Received',
      message: 'Ranveer Allahbadia submitted a counter offer of ₹55,000 for "Zomato Healthy Eats".',
      type: 'offer_received',
      entityId: invNegotiating1._id,
      entityType: 'Invitation',
      isRead: false,
      createdAt: new Date(now - 5 * hour)
    },
    {
      userId: zomato.user._id,
      senderId: kusha.user._id,
      title: 'Collaboration Activated',
      message: 'Agreed on ₹35,000 terms with Kusha Kapila. Deliverables timeline started.',
      type: 'collaboration_started',
      entityId: collab4._id,
      entityType: 'Collaboration',
      isRead: true,
      createdAt: new Date(now - 2 * day)
    },
    {
      userId: zomato.user._id,
      title: 'Dispute Resolved by Moderation',
      message: 'Admin resolved creator deliverable query. Campaign marked cleared.',
      type: 'report_resolved',
      entityType: 'AdminReport',
      isRead: true,
      createdAt: new Date(now - 4 * day)
    },
    {
      userId: zomato.user._id,
      title: 'Campaign Brief Published',
      message: 'Campaign brief "Zomato Gold Foodie Safari" is now active.',
      type: 'campaign_created',
      entityId: createdCampaigns[2]._id,
      entityType: 'Campaign',
      isRead: true,
      createdAt: new Date(now - 8 * day)
    },

    // Mamaearth (Brand)
    {
      userId: mamaearth.user._id,
      senderId: shreyaJain.user._id,
      title: 'Collaboration Completed Successfully',
      message: 'Campaign with Shreya Jain for "Mamaearth Rice Water Routine" has concluded.',
      type: 'collaboration_completed',
      entityId: collab3._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 2 * hour)
    },
    {
      userId: mamaearth.user._id,
      senderId: radhika.user._id,
      title: 'Invitation Accepted',
      message: 'Radhika Seth accepted your collaboration brief for "Glow Serum Launch".',
      type: 'invitation_accepted',
      entityId: invAccepted1._id,
      entityType: 'Invitation',
      isRead: true,
      createdAt: new Date(now - 1 * day)
    },
    {
      userId: mamaearth.user._id,
      senderId: shreyaJain.user._id,
      title: 'Escrow Payout Released',
      message: '₹30,000 escrow release confirmed for Shreya Jain skincare review.',
      type: 'escrow_released',
      entityId: collab3._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 3 * day)
    },
    {
      userId: mamaearth.user._id,
      senderId: shreyaJain.user._id,
      title: '5-Star Review Received',
      message: 'Shreya Jain rated Mamaearth 5★: "Authentic organic products and professional team!"',
      type: 'review_received',
      entityId: collab3._id,
      entityType: 'Review',
      isRead: true,
      createdAt: new Date(now - 5 * day)
    },

    // Noise (Brand)
    {
      userId: noise.user._id,
      senderId: dhruv.user._id,
      title: 'Invitation Accepted',
      message: 'Dhruv Rathee accepted your invitation for "Noise ColorFit Pro 5 Masterclass".',
      type: 'invitation_accepted',
      entityId: invAccepted1._id,
      entityType: 'Invitation',
      isRead: false,
      createdAt: new Date(now - 35 * min)
    },
    {
      userId: noise.user._id,
      senderId: shenaz.user._id,
      title: 'Content Submitted for Review',
      message: 'Shenaz Treasury uploaded outdoor travel vlog draft showcasing Noise Smartwatch.',
      type: 'content_submitted',
      entityId: collab1._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 6 * hour)
    },
    {
      userId: noise.user._id,
      senderId: techBurner.user._id,
      title: 'Escrow Funds Secured',
      message: '₹45,000 deposited into CollabX Escrow Vault for "Noise Luna Smart Ring Review".',
      type: 'escrow_funded',
      entityId: collab1._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 2 * day)
    },
    {
      userId: noise.user._id,
      title: 'Campaign Brief Published',
      message: 'Your campaign "Noise ColorFit Masterpiece" is live with budget ₹55,000.',
      type: 'campaign_created',
      entityId: createdCampaigns[3]._id,
      entityType: 'Campaign',
      isRead: true,
      createdAt: new Date(now - 9 * day)
    },

    // ---------------- CREATOR NOTIFICATIONS (32 total) ----------------
    // Mortal / Naman Mathur (Primary Creator Demo Account: creator.mortal@collabx.demo)
    {
      userId: mortal.user._id,
      senderId: boat.user._id,
      title: 'New Campaign Invitation',
      message: 'boAt Lifestyle invited you to lead gaming audio for "boAt Nirvana ANC Experience" (Offered: ₹40,000).',
      type: 'collaboration_invitation',
      entityId: invNegotiating1._id,
      entityType: 'Invitation',
      isRead: false,
      createdAt: new Date(now - 5 * min)
    },
    {
      userId: mortal.user._id,
      senderId: boat.user._id,
      title: 'Offer Updated in Deal Room',
      message: 'boAt Lifestyle agreed to your counter offer of ₹45,000 for "boAt Nirvana ANC Experience".',
      type: 'offer_received',
      entityId: invNegotiating1._id,
      entityType: 'Negotiation',
      isRead: false,
      createdAt: new Date(now - 20 * min)
    },
    {
      userId: mortal.user._id,
      senderId: boat.user._id,
      title: 'Deliverables Approved!',
      message: 'boAt Lifestyle approved your gaming livestream and ANC benchmark video!',
      type: 'content_approved',
      entityId: collab1._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 2 * hour)
    },
    {
      userId: mortal.user._id,
      senderId: boat.user._id,
      title: 'Escrow Funds Secured',
      message: 'boAt Lifestyle deposited ₹45,000 into escrow for your collaboration.',
      type: 'payment_escrowed',
      entityId: collab1._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 1 * day)
    },
    {
      userId: mortal.user._id,
      senderId: boat.user._id,
      title: 'Escrow Payout Released',
      message: '₹45,000 payout has been successfully released to your payout account!',
      type: 'payment_released',
      entityId: collab1._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 2 * day)
    },
    {
      userId: mortal.user._id,
      senderId: boat.user._id,
      title: 'New 5-Star Review Received!',
      message: 'boAt Lifestyle rated you 5★: "Exceptional creator! Naman delivered tremendous gaming engagement."',
      type: 'review_received',
      entityId: collab1._id,
      entityType: 'Review',
      isRead: true,
      createdAt: new Date(now - 4 * day)
    },
    {
      userId: mortal.user._id,
      senderId: noise.user._id,
      title: 'New Campaign Invitation',
      message: 'Noise sent you an exclusive invitation for "Noise Gaming Audio Quest" with budget ₹50,000.',
      type: 'collaboration_invitation',
      entityId: invAccepted1._id,
      entityType: 'Invitation',
      isRead: true,
      createdAt: new Date(now - 7 * day)
    },

    // Tech Burner / Shlok Srivastava (Creator)
    {
      userId: techBurner.user._id,
      senderId: nike.user._id,
      title: 'New Campaign Invitation',
      message: 'Nike India sent you an invitation for "Nike Air Max 2026 Ignite Campaign" with budget ₹65,000.',
      type: 'collaboration_invitation',
      entityId: invAccepted1._id,
      entityType: 'Invitation',
      isRead: false,
      createdAt: new Date(now - 10 * min)
    },
    {
      userId: techBurner.user._id,
      senderId: nike.user._id,
      title: 'Deliverables Approved!',
      message: 'Nike India approved your unboxing & durability tech breakdown.',
      type: 'content_approved',
      entityId: collab1._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 1 * hour)
    },
    {
      userId: techBurner.user._id,
      senderId: nike.user._id,
      title: 'Escrow Payout Released',
      message: '₹65,000 escrow payout has been credited to your verified payout wallet.',
      type: 'payment_released',
      entityId: collab1._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 2 * day)
    },
    {
      userId: techBurner.user._id,
      senderId: nike.user._id,
      title: '5-Star Review Received',
      message: 'Nike India rated you 5★: "Outstanding video quality and authentic technical breakdown!"',
      type: 'review_received',
      entityId: collab1._id,
      entityType: 'Review',
      isRead: true,
      createdAt: new Date(now - 3 * day)
    },

    // Tanmay Bhat (Creator)
    {
      userId: tanmay.user._id,
      senderId: swiggy.user._id,
      title: 'Deliverables Approved!',
      message: 'Swiggy approved your Instamart delivery challenge comedy skit!',
      type: 'content_approved',
      entityId: collab2._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 30 * min)
    },
    {
      userId: tanmay.user._id,
      senderId: swiggy.user._id,
      title: 'Escrow Funds Secured',
      message: 'Swiggy secured ₹50,000 in CollabX Escrow for your campaign.',
      type: 'payment_escrowed',
      entityId: collab2._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 1 * day)
    },
    {
      userId: tanmay.user._id,
      senderId: swiggy.user._id,
      title: '5-Star Review Received',
      message: 'Swiggy left a 5★ review: "Hilarious and viral execution! Generated unmatched engagement."',
      type: 'review_received',
      entityId: collab2._id,
      entityType: 'Review',
      isRead: true,
      createdAt: new Date(now - 3 * day)
    },

    // Shreya Jain (Creator)
    {
      userId: shreyaJain.user._id,
      senderId: mamaearth.user._id,
      title: '5-Star Review Received!',
      message: 'Mamaearth left you a 5-star review: "Outstanding collaboration! Shreya delivered exceptional skincare education."',
      type: 'review_received',
      entityId: collab3._id,
      entityType: 'Review',
      isRead: false,
      createdAt: new Date(now - 15 * min)
    },
    {
      userId: shreyaJain.user._id,
      senderId: mamaearth.user._id,
      title: 'Escrow Payout Released',
      message: '₹30,000 payout has been transferred for Mamaearth Rice Water Routine.',
      type: 'payment_released',
      entityId: collab3._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 2 * day)
    },

    // Kritika Khurana / ThatBohoGirl (Creator)
    {
      userId: bohoGirl.user._id,
      senderId: nike.user._id,
      title: 'Revision Requested by Brand',
      message: 'Nike India requested adjustments on outsole grip closeups for "Run With Pegasus".',
      type: 'revision_requested',
      entityId: collab5._id,
      entityType: 'Collaboration',
      isRead: false,
      createdAt: new Date(now - 50 * min)
    },
    {
      userId: bohoGirl.user._id,
      senderId: nike.user._id,
      title: 'New Campaign Invitation',
      message: 'Nike India invited you to lead fitness fashion for "Run With Pegasus" (₹35,000).',
      type: 'collaboration_invitation',
      entityId: collab5._id,
      entityType: 'Invitation',
      isRead: true,
      createdAt: new Date(now - 2 * day)
    },

    // Kusha Kapila (Creator)
    {
      userId: kusha.user._id,
      senderId: zomato.user._id,
      title: 'New Campaign Invitation',
      message: 'Zomato sent you an invitation for "Zomato Legends Feast" with budget ₹35,000.',
      type: 'collaboration_invitation',
      entityId: collab4._id,
      entityType: 'Invitation',
      isRead: false,
      createdAt: new Date(now - 1 * hour)
    },
    {
      userId: kusha.user._id,
      senderId: zomato.user._id,
      title: 'Collaboration Activated',
      message: 'You accepted Zomato\'s invitation for "Zomato Legends Feast". Deal room opened.',
      type: 'collaboration_started',
      entityId: collab4._id,
      entityType: 'Collaboration',
      isRead: true,
      createdAt: new Date(now - 3 * day)
    },

    // Dhruv Rathee (Creator)
    {
      userId: dhruv.user._id,
      senderId: noise.user._id,
      title: 'New Campaign Invitation',
      message: 'Noise invited you to host a tech analysis segment for "Noise ColorFit Pro 5" (₹60,000).',
      type: 'collaboration_invitation',
      entityId: invAccepted1._id,
      entityType: 'Invitation',
      isRead: false,
      createdAt: new Date(now - 2 * hour)
    },
    {
      userId: dhruv.user._id,
      senderId: noise.user._id,
      title: 'Escrow Funds Secured',
      message: '₹60,000 deposited into CollabX Escrow Vault for your campaign.',
      type: 'payment_escrowed',
      entityId: collab1._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 4 * day)
    },

    // Gaurav Taneja / Flying Beast (Creator)
    {
      userId: flyingBeast.user._id,
      senderId: nike.user._id,
      title: 'Counter-Offer Awaiting Approval',
      message: 'Your ₹40,000 counter offer for "Nike Training Club Challenge" is under brand review.',
      type: 'negotiation',
      entityId: invNegotiating2._id,
      entityType: 'Negotiation',
      isRead: false,
      createdAt: new Date(now - 4 * hour)
    },
    {
      userId: flyingBeast.user._id,
      senderId: nike.user._id,
      title: 'New Campaign Invitation',
      message: 'Nike India invited you for "Nike Training Club Challenge" (Offered: ₹35,000).',
      type: 'collaboration_invitation',
      entityId: invNegotiating2._id,
      entityType: 'Invitation',
      isRead: true,
      createdAt: new Date(now - 2 * day)
    },

    // Ranveer Allahbadia / BeerBiceps (Creator)
    {
      userId: beerBiceps.user._id,
      senderId: zomato.user._id,
      title: 'Offer Updated in Deal Room',
      message: 'Zomato updated their offer to ₹55,000 for "Zomato Healthy Eats".',
      type: 'offer_received',
      entityId: invNegotiating1._id,
      entityType: 'Negotiation',
      isRead: false,
      createdAt: new Date(now - 6 * hour)
    },

    // Dolly Singh (Creator)
    {
      userId: dolly.user._id,
      senderId: swiggy.user._id,
      title: 'New Campaign Invitation',
      message: 'Swiggy invited you to collaborate on "Gourmet Flavors Fest" (₹25,000).',
      type: 'collaboration_invitation',
      entityId: invAccepted1._id,
      entityType: 'Invitation',
      isRead: false,
      createdAt: new Date(now - 3 * hour)
    },

    // Shenaz Treasury (Creator)
    {
      userId: shenaz.user._id,
      senderId: noise.user._id,
      title: 'Deliverables Submitted for Review',
      message: 'You submitted outdoor travel vlog deliverables for "Noise Smartwatch Explorer".',
      type: 'content_submitted',
      entityId: collab1._id,
      entityType: 'Collaboration',
      isRead: true,
      createdAt: new Date(now - 6 * hour)
    },

    // Radhika Seth (Creator)
    {
      userId: radhika.user._id,
      senderId: mamaearth.user._id,
      title: 'New Campaign Invitation',
      message: 'Mamaearth sent you an invitation for "Glow Serum Launch" with budget ₹28,000.',
      type: 'collaboration_invitation',
      entityId: invAccepted1._id,
      entityType: 'Invitation',
      isRead: false,
      createdAt: new Date(now - 1 * day)
    },
    // Mortal additional notifications
    {
      userId: mortal.user._id,
      senderId: boat.user._id,
      title: 'Counter Offer Accepted',
      message: 'boAt Lifestyle accepted your revised timeline and deliverables package.',
      type: 'negotiation',
      entityId: invNegotiating1._id,
      entityType: 'Negotiation',
      isRead: false,
      createdAt: new Date(now - 10 * min)
    },
    // Tech Burner additional notifications
    {
      userId: techBurner.user._id,
      senderId: nike.user._id,
      title: 'Deal Finalized & Active',
      message: 'Nike Air Max 2026 Ignite Campaign milestone contract finalized at ₹65,000.',
      type: 'collaboration_started',
      entityId: collab1._id,
      entityType: 'Collaboration',
      isRead: true,
      createdAt: new Date(now - 3 * day)
    },
    // Tanmay additional notifications
    {
      userId: tanmay.user._id,
      senderId: swiggy.user._id,
      title: 'Escrow Payout Released',
      message: '₹50,000 payout for Swiggy Instamart Late Night Challenge released to your bank.',
      type: 'payment_released',
      entityId: collab2._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 2 * day)
    },
    // Dolly additional notifications
    {
      userId: dolly.user._id,
      senderId: swiggy.user._id,
      title: 'Escrow Funds Secured',
      message: 'Swiggy deposited ₹25,000 into CollabX Escrow Vault for Gourmet Flavors Fest.',
      type: 'payment_escrowed',
      entityId: invAccepted1._id,
      entityType: 'Payment',
      isRead: true,
      createdAt: new Date(now - 4 * day)
    }
  ];

  for (const n of notificationsData) {
    await Notification.create(n);
  }
  console.log(`✅ Seeded ${notificationsData.length} Notifications (${notificationsData.filter(n => n.userId.toString().includes(boat.user._id.toString()) || n.userId.toString().includes(nike.user._id.toString()) || n.userId.toString().includes(swiggy.user._id.toString()) || n.userId.toString().includes(zomato.user._id.toString()) || n.userId.toString().includes(mamaearth.user._id.toString()) || n.userId.toString().includes(noise.user._id.toString())).length} Brand, ${notificationsData.filter(n => !n.userId.toString().includes(boat.user._id.toString()) && !n.userId.toString().includes(nike.user._id.toString()) && !n.userId.toString().includes(swiggy.user._id.toString()) && !n.userId.toString().includes(zomato.user._id.toString()) && !n.userId.toString().includes(mamaearth.user._id.toString()) && !n.userId.toString().includes(noise.user._id.toString())).length} Creator).`);

  // ==========================================
  // 8. REVIEWS (Authentic Brand and Creator Reviews)
  // ==========================================
  console.log('⭐ Creating Reviews...');
  await Review.create([
    {
      collaborationId: collab3._id,
      reviewerId: mamaearth.user._id,
      reviewerRole: 'brand',
      reviewedUserId: shreyaJain.user._id,
      creatorId: shreyaJain.user._id,
      rating: 5,
      review: 'Outstanding collaboration! Shreya delivered exceptional skincare education, crisp 4K visuals, and high engagement from our target audience.'
    },
    {
      collaborationId: collab3._id,
      reviewerId: shreyaJain.user._id,
      reviewerRole: 'creator',
      reviewedUserId: mamaearth.user._id,
      creatorId: shreyaJain.user._id,
      rating: 5,
      review: 'Working with Mamaearth was seamless. Clear creative brief, fast approvals, and prompt communication throughout!'
    }
  ]);
  console.log('✅ Seeded Reviews.');

  console.log('\n======================================================');
  console.log('🎉 COLLABX DEMO DATA SEEDED SUCCESSFULLY (REBALANCED AMOUNTS)!');
  console.log('======================================================');
  console.log('🔑 ALL SEEDED ACCOUNTS USE PASSWORD: Password123!');
  console.log('\n📌 DEMO BRAND ACCOUNTS:');
  console.log('   - brand.nike@collabx.demo        (Nike India - Fashion/Athleisure)');
  console.log('   - brand.boat@collabx.demo        (boAt Lifestyle - Electronics/Audio)');
  console.log('   - brand.zomato@collabx.demo      (Zomato - Food & Dining)');
  console.log('   - brand.swiggy@collabx.demo      (Swiggy - Quick Commerce)');
  console.log('   - brand.mamaearth@collabx.demo   (Mamaearth - Beauty & Skincare)');
  console.log('   - brand.noise@collabx.demo       (Noise - Smart Wearables)');
  console.log('\n📌 DEMO CREATOR ACCOUNTS:');
  console.log('   - creator.techburner@collabx.demo (Shlok Srivastava - Tier 1 Tech)');
  console.log('   - creator.mortal@collabx.demo     (Naman Mathur - Tier 1 Gaming)');
  console.log('   - creator.tanmay@collabx.demo     (Tanmay Bhat - Tier 1 Tech/Comedy)');
  console.log('   - creator.dhruv@collabx.demo      (Dhruv Rathee - Tier 1 Tech/Docu)');
  console.log('   - creator.kritika@collabx.demo    (ThatBohoGirl - Tier 2 Fashion)');
  console.log('   - creator.kusha@collabx.demo      (Kusha Kapila - Tier 2 Fashion/Comedy)');
  console.log('   - creator.gaurav@collabx.demo     (Flying Beast - Tier 2 Fitness/Travel)');
  console.log('   - creator.ranveer@collabx.demo    (BeerBiceps - Tier 3 Fitness/Podcast)');
  console.log('   - creator.shreya@collabx.demo     (Shreya Jain - Tier 3 Beauty/Skincare)');
  console.log('   - creator.dolly@collabx.demo      (Dolly Singh - Tier 3 Fashion/Comedy)');
  console.log('   - creator.shenaz@collabx.demo     (Shenaz Treasury - Tier 3 Travel)');
  console.log('   - creator.radhika@collabx.demo    (Radhika Seth - Tier 3 Beauty/Fashion)');
  console.log('======================================================\n');

  await mongoose.disconnect();
  console.log('👋 Database connection closed.');
}

seed().catch((err) => {
  console.error('❌ Seeding failed with error:', err);
  process.exit(1);
});
