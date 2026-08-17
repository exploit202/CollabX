const Campaign = require("../models/Campaign");
const BrandProfile = require("../models/brandProfile.model");

// =====================================================
// GET /api/discover/campaigns
// Search + Filters
// =====================================================

const getCampaigns = async (req, res, next) => {
  try {
    const {
      search,
      category,
      platform,
      location,
      minBudget,
      maxBudget,
      maxFollowers,
      verified,
      status = "active",
      sort = "newest",
    } = req.query;

    const filter = {};

    // Build BrandProfile query if verified or location filters are supplied
    const brandFilter = {};
    if (verified === "true" || verified === true) {
      brandFilter.verified = true;
    }
    if (location && location !== "All") {
      brandFilter.$or = [
        { country: location },
        { "location.country": location },
      ];
    }

    if (Object.keys(brandFilter).length > 0) {
      const matchingBrands = await BrandProfile.find(brandFilter).select("_id");
      const matchingBrandIds = matchingBrands.map((b) => b._id.toString());
      filter.brandId = { $in: matchingBrandIds };
    }

    // Status
    if (status && status !== "all") {
      filter.status = status;
    }

    // Category
    if (category && category !== "All") {
      filter.category = category;
    }

    // Platform
    if (platform && platform !== "All") {
      filter.targetPlatforms = platform;
    }

    // Search
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");

      // Find any brand matching search text in BrandProfile
      const matchingBrandsBySearch = await BrandProfile.find({
        $or: [
          { name: searchRegex },
          { companyName: searchRegex },
        ],
      }).select("_id");

      const brandIdsFromSearch = matchingBrandsBySearch.map((b) =>
        b._id.toString()
      );

      const searchConditions = [
        { title: searchRegex },
        { brandName: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];

      if (brandIdsFromSearch.length > 0) {
        searchConditions.push({ brandId: { $in: brandIdsFromSearch } });
      }

      filter.$or = searchConditions;
    }

    // Minimum budget
    if (minBudget !== undefined && minBudget !== "") {
      filter.budget = {
        ...(filter.budget || {}),
        $gte: Number(minBudget),
      };
    }

    // Maximum budget
    if (maxBudget !== undefined && maxBudget !== "") {
      filter.budget = {
        ...(filter.budget || {}),
        $lte: Number(maxBudget),
      };
    }

    // Maximum followers
    if (
      maxFollowers !== undefined &&
      maxFollowers !== ""
    ) {
      filter.minFollowers = {
        $lte: Number(maxFollowers),
      };
    }

    // Sorting
    let sortQuery = { createdAt: -1 };

    if (sort === "oldest") {
      sortQuery = { createdAt: 1 };
    } else if (sort === "budgetHigh") {
      sortQuery = { budget: -1 };
    } else if (sort === "budgetLow") {
      sortQuery = { budget: 1 };
    } else if (sort === "followersLow") {
      sortQuery = { minFollowers: 1 };
    }

    const campaigns = await Campaign.find(filter).sort(sortQuery);

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET /api/discover/brands
// =====================================================

const getBrands = async (req, res, next) => {
  try {
    const brands = await BrandProfile.find().sort({
      createdAt: -1,
    });

    // Convert backend BrandProfile
    // into existing frontend BrandProfile structure
    const formattedBrands = brands.map((brand) => ({
      id: brand._id.toString(),

      name: brand.companyName || "",

      email: brand.email || "",

      phone: brand.phone || "",

      role: "brand",

      avatar:
        brand.companyLogo ||
        brand.logo ||
        "",

      verified: brand.verified || false,

      createdAt: brand.createdAt
        ? brand.createdAt.toISOString()
        : new Date().toISOString(),

      companyName: brand.companyName || "",

      industry: brand.industry || "",

      website: brand.website || "",

      logo:
        brand.companyLogo ||
        brand.logo ||
        "",

      description:
        brand.aboutBrand ||
        brand.description ||
        "",

      country:
        brand.location?.country ||
        "",

      activeCampaignsCount:
        brand.activeCampaignsCount || 0,

      totalSpent:
        brand.totalSpent || 0,

      contactName:
        brand.contactName || "",

      contactRole:
        brand.contactRole || "",

      instagramUrl:
        brand.socialLinks?.instagram ||
        brand.instagramUrl ||
        "",

      linkedinUrl:
        brand.socialLinks?.linkedin ||
        brand.linkedinUrl ||
        "",

      targetAudience:
        brand.targetAudience || "",

      preferredCreatorCategories:
        brand.preferredCreatorCategories || [],

      preferredPlatforms:
        brand.preferredPlatforms || [],
    }));

    res.status(200).json({
      success: true,
      count: formattedBrands.length,
      data: formattedBrands,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCampaigns,
  getBrands,
};