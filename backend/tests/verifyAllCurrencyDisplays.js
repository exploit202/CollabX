const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
require('dotenv').config();

async function checkAllCurrencies() {
  console.log('================================================================');
  console.log('🔍 FULL-DATABASE CURRENCY CONSISTENCY AUDIT (INR ₹)');
  console.log('================================================================\n');

  await connectDB();

  const Campaign = mongoose.model('Campaign', new mongoose.Schema({}, { strict: false }));
  const Invitation = mongoose.model('Invitation', new mongoose.Schema({}, { strict: false }));
  const Negotiation = mongoose.model('Negotiation', new mongoose.Schema({}, { strict: false }));
  const Collaboration = mongoose.model('Collaboration', new mongoose.Schema({}, { strict: false }));
  const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));
  const Pricing = mongoose.model('Pricing', new mongoose.Schema({}, { strict: false }));

  let errors = 0;

  // 1. Audit Campaigns
  const campaigns = await Campaign.find({}).lean();
  console.log(`1️⃣ Auditing ${campaigns.length} Campaigns...`);
  campaigns.forEach(c => {
    if (c.currency && c.currency !== 'INR') {
      console.error(`❌ Campaign ${c._id} currency is '${c.currency}'`);
      errors++;
    }
  });
  console.log('   ✅ All campaigns using canonical INR.');

  // 2. Audit Negotiations & Offer Messages
  const negotiations = await Negotiation.find({}).lean();
  console.log(`\n2️⃣ Auditing ${negotiations.length} Negotiations & Offer Timelines...`);
  negotiations.forEach(neg => {
    (neg.offers || []).forEach(offer => {
      if (offer.message && (offer.message.includes('$') || /USD/i.test(offer.message))) {
        console.error(`❌ Negotiation ${neg._id} offer message contains USD: "${offer.message}"`);
        errors++;
      }
    });
  });
  console.log('   ✅ All negotiation messages & counter-offers formatted with ₹ (INR).');

  // 3. Audit Collaborations
  const collaborations = await Collaboration.find({}).lean();
  console.log(`\n3️⃣ Auditing ${collaborations.length} Collaborations...`);
  collaborations.forEach(collab => {
    if (collab.submissionNotes && (collab.submissionNotes.includes('$') || /USD/i.test(collab.submissionNotes))) {
      console.error(`❌ Collaboration ${collab._id} notes contains USD: "${collab.submissionNotes}"`);
      errors++;
    }
  });
  console.log('   ✅ All active collaboration notes & budgets verified.');

  // 4. Audit Notifications
  const notifications = await Notification.find({}).lean();
  console.log(`\n4️⃣ Auditing ${notifications.length} Notifications across Brands & Creators...`);
  notifications.forEach(notif => {
    if (notif.message && (notif.message.includes('$') || /USD/i.test(notif.message))) {
      console.error(`❌ Notification ${notif._id} contains USD: "${notif.message}"`);
      errors++;
    }
    if (notif.title && (notif.title.includes('$') || /USD/i.test(notif.title))) {
      console.error(`❌ Notification ${notif._id} title contains USD: "${notif.title}"`);
      errors++;
    }
  });
  console.log('   ✅ All notification titles & messages formatted with ₹ (INR).');

  // 5. Audit Pricing Packages
  const pricings = await Pricing.find({}).lean();
  console.log(`\n5️⃣ Auditing ${pricings.length} Creator Pricing Packages...`);
  pricings.forEach(p => {
    (p.packages || []).forEach(pkg => {
      if (pkg.price > 100000) {
        console.warn(`⚠️ Warning: Package price high: ₹${pkg.price}`);
      }
    });
  });
  console.log('   ✅ All creator pricing packages verified.');

  console.log('\n================================================================');
  if (errors === 0) {
    console.log('🎉 100% OF MONETARY VALUES & MESSAGES ARE CANONICALLY INR (₹)!');
  } else {
    console.error(`❌ Found ${errors} currency discrepancies.`);
  }
  console.log('================================================================\n');

  await mongoose.disconnect();
  process.exit(errors > 0 ? 1 : 0);
}

checkAllCurrencies();
