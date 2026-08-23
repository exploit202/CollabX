const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
require('dotenv').config();

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  // Replace patterns like "$55000", "$ 55,000", "$4000", "$10000" with INR format
  return str.replace(/\$\s?(\d[\d,]*)/g, (match, amountStr) => {
    const rawNumber = parseInt(amountStr.replace(/,/g, ''), 10);
    if (isNaN(rawNumber)) return match;
    return `₹${rawNumber.toLocaleString('en-IN')}`;
  });
}

async function sanitizeDatabase() {
  console.log('🔄 Connecting to MongoDB to sanitize all existing database records...');
  await connectDB();

  const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));
  const Negotiation = mongoose.model('Negotiation', new mongoose.Schema({}, { strict: false }));
  const Collaboration = mongoose.model('Collaboration', new mongoose.Schema({}, { strict: false }));
  const Invitation = mongoose.model('Invitation', new mongoose.Schema({}, { strict: false }));
  const Campaign = mongoose.model('Campaign', new mongoose.Schema({}, { strict: false }));

  let notifUpdates = 0;
  let negUpdates = 0;
  let collabUpdates = 0;
  let invUpdates = 0;

  // 1. Sanitize Notifications
  const notifs = await Notification.find({}).lean();
  for (const n of notifs) {
    let changed = false;
    const newTitle = sanitizeString(n.title);
    const newMessage = sanitizeString(n.message);

    if (newTitle !== n.title || newMessage !== n.message) {
      await Notification.updateOne(
        { _id: n._id },
        { $set: { title: newTitle, message: newMessage } }
      );
      notifUpdates++;
    }
  }
  console.log(`✅ Sanitized ${notifUpdates} Notification documents.`);

  // 2. Sanitize Negotiations
  const negotiations = await Negotiation.find({}).lean();
  for (const neg of negotiations) {
    let changed = false;
    const updatedOffers = (neg.offers || []).map(offer => {
      const newMsg = sanitizeString(offer.message);
      const newNotes = sanitizeString(offer.notes);
      if (newMsg !== offer.message || newNotes !== offer.notes) {
        changed = true;
      }
      return {
        ...offer,
        message: newMsg,
        ...(offer.notes ? { notes: newNotes } : {})
      };
    });

    if (changed) {
      await Negotiation.updateOne(
        { _id: neg._id },
        { $set: { offers: updatedOffers } }
      );
      negUpdates++;
    }
  }
  console.log(`✅ Sanitized ${negUpdates} Negotiation documents.`);

  // 3. Sanitize Collaborations
  const collabs = await Collaboration.find({}).lean();
  for (const c of collabs) {
    const newNotes = sanitizeString(c.submissionNotes);
    const newFeedback = sanitizeString(c.brandFeedback);
    if (newNotes !== c.submissionNotes || newFeedback !== c.brandFeedback) {
      await Collaboration.updateOne(
        { _id: c._id },
        { $set: { submissionNotes: newNotes, brandFeedback: newFeedback } }
      );
      collabUpdates++;
    }
  }
  console.log(`✅ Sanitized ${collabUpdates} Collaboration documents.`);

  // 4. Sanitize Invitations
  const invs = await Invitation.find({}).lean();
  for (const inv of invs) {
    const newMsg = sanitizeString(inv.message);
    if (newMsg !== inv.message) {
      await Invitation.updateOne(
        { _id: inv._id },
        { $set: { message: newMsg } }
      );
      invUpdates++;
    }
  }
  console.log(`✅ Sanitized ${invUpdates} Invitation documents.`);

  await mongoose.disconnect();
  console.log('🎉 Database currency sanitization completed successfully!');
}

sanitizeDatabase().catch(err => {
  console.error('Sanitization failed:', err);
  process.exit(1);
});
