const Pricing = require("../models/pricing.model");

// Create
const createPricing = async (data) => {
  return await Pricing.create(data);
};

// Get all packages of a creator
const getPricingByCreator = async (creatorId) => {
  return await Pricing.find({ creatorId, isActive: true }).sort({
    createdAt: -1,
  });
};

// Get one package
const getPricingById = async (id) => {
  return await Pricing.findById(id);
};

// Update
const updatePricing = async (id, data) => {
  return await Pricing.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// Soft Delete (Disable Package)
const togglePricingStatus = async (id) => {
  const pricing = await Pricing.findById(id);

  if (!pricing) return null;

  pricing.isActive = !pricing.isActive;

  await pricing.save();

  return pricing;
};

module.exports = {
  createPricing,
  getPricingByCreator,
  getPricingById,
  updatePricing,
  togglePricingStatus,
};