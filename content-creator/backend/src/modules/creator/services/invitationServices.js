const Invitation = require("../models/Invitation");

const createInvitation = async (data) => {
  return await Invitation.create(data);
};

const getInvitations = async (filter = {}) => {
  return await Invitation.find(filter).sort({ createdAt: -1 });
};

const getInvitationById = async (id) => {
  return await Invitation.findById(id);
};

const updateInvitationStatus = async (id, status) => {
  return await Invitation.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
};

module.exports = {
  createInvitation,
  getInvitations,
  getInvitationById,
  updateInvitationStatus,
};
