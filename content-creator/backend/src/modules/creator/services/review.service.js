const mongoose = require("mongoose");
const Review = require("../models/review.model");

const createReview = async (reviewData) => {
  const review = await Review.create(reviewData);
  return review;
};

const getReviewsByCreator = async (creatorId) => {
  return await Review.find({ creatorId });
};

const getAverageRating = async (creatorId) => {
  const result = await Review.aggregate([
    {
      $match: {
        creatorId: new mongoose.Types.ObjectId(creatorId),
      },
    },
    {
      $group: {
        _id: "$creatorId",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  return result;
};

module.exports = {
  createReview,
  getReviewsByCreator,
  getAverageRating,
};