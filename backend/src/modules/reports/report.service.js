const mongoose = require('mongoose');
const User = require('../../models/user.model');
const AdminReport = require('../../models/adminReport.model');

const ROLE_TARGETS = {
  brand: 'creator',
  creator: 'brand'
};

const createUserReport = async (reporterId, reporterRole, { reportedAgainst, reason, description }) => {
  const targetRole = ROLE_TARGETS[reporterRole];

  if (!targetRole) {
    const error = new Error('Only Brand and Creator accounts can submit reports.');
    error.statusCode = 403;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(reportedAgainst)) {
    const error = new Error('Invalid report target.');
    error.statusCode = 400;
    throw error;
  }

  if (!reason || !String(reason).trim()) {
    const error = new Error('Report reason is required.');
    error.statusCode = 400;
    throw error;
  }

  const target = await User.findOne({
    _id: reportedAgainst,
    role: targetRole,
    isActive: true
  }).select('_id role');

  if (!target) {
    const error = new Error(`The selected ${targetRole} account could not be found.`);
    error.statusCode = 404;
    throw error;
  }

  if (String(target._id) === String(reporterId)) {
    const error = new Error('You cannot report your own account.');
    error.statusCode = 400;
    throw error;
  }

  // Prevent accidental duplicate pending reports for the same pair/reason.
  const duplicate = await AdminReport.findOne({
    reportedBy: reporterId,
    reportedAgainst: target._id,
    reason: String(reason).trim(),
    status: { $in: ['pending', 'mediation'] }
  });

  if (duplicate) {
    const error = new Error('You already have an active report for this issue.');
    error.statusCode = 409;
    throw error;
  }

  return AdminReport.create({
    reportedBy: reporterId,
    reportedAgainst: target._id,
    reason: String(reason).trim(),
    description: String(description || '').trim()
  });
};

module.exports = { createUserReport };
