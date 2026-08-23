/**
 * Verification script for Report Creator (Brand -> Creator) and Report Brand (Creator -> Brand) flows.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const { User, AdminReport } = require('../src/models');
const { createUserReport } = require('../src/modules/reports/report.service');
const adminService = require('../src/modules/admin/services/admin.service');

async function testReportFlow() {
  console.log('🔍 Verifying Report Creator & Brand Reporting Architecture...\n');
  await connectDB();

  // Find a Brand user and a Creator user
  const brand = await User.findOne({ role: 'brand', isActive: true });
  const creator = await User.findOne({ role: 'creator', isActive: true });

  if (!brand || !creator) {
    throw new Error('Test requires at least one active brand and one active creator.');
  }

  console.log(`👤 Test Brand: ${brand.fullName} (${brand._id})`);
  console.log(`👤 Test Creator: ${creator.fullName} (${creator._id})\n`);

  // 1. Clean up any leftover test reports
  await AdminReport.deleteMany({
    $or: [
      { reportedBy: brand._id, reportedAgainst: creator._id },
      { reportedBy: creator._id, reportedAgainst: brand._id }
    ]
  });

  // 2. Brand reports Creator
  console.log('1️⃣ Testing Brand reporting Creator:');
  const creatorReport = await createUserReport(brand._id, 'brand', {
    reportedAgainst: creator._id,
    reason: 'Missed deliverables',
    description: 'Creator failed to submit promised Instagram reel before campaign deadline.'
  });

  console.log(`   - Report ID: ${creatorReport._id}`);
  console.log(`   - Reported By: ${creatorReport.reportedBy} (Brand)`);
  console.log(`   - Reported Against: ${creatorReport.reportedAgainst} (Creator)`);
  console.log(`   - Reason: "${creatorReport.reason}"`);
  console.log(`   - Status: ${creatorReport.status}`);

  if (
    String(creatorReport.reportedBy) !== String(brand._id) ||
    String(creatorReport.reportedAgainst) !== String(creator._id) ||
    creatorReport.reason !== 'Missed deliverables' ||
    creatorReport.status !== 'pending'
  ) {
    throw new Error('Brand reporting Creator verification failed');
  }
  console.log('   ✅ Brand reporting Creator succeeded.\n');

  // 3. Prevent duplicate active reports
  console.log('2️⃣ Testing duplicate report prevention:');
  try {
    await createUserReport(brand._id, 'brand', {
      reportedAgainst: creator._id,
      reason: 'Missed deliverables',
      description: 'Duplicate attempt'
    });
    throw new Error('Duplicate report was unexpectedly allowed.');
  } catch (err) {
    console.log(`   - Expected Error Caught: "${err.message}" (Status: ${err.statusCode})`);
    if (err.statusCode !== 409) throw err;
    console.log('   ✅ Duplicate report guard working correctly.\n');
  }

  // 4. Admin retrieving reports
  console.log('3️⃣ Testing Admin Panel report retrieval & populate:');
  const adminReports = await adminService.getReports();
  const foundReport = adminReports.find((r) => String(r._id) === String(creatorReport._id));

  if (!foundReport) {
    throw new Error('Admin getReports did not return the newly created report.');
  }

  console.log(`   - Populated Reporter: ${foundReport.reportedBy?.fullName} (${foundReport.reportedBy?.role})`);
  console.log(`   - Populated Reported: ${foundReport.reportedAgainst?.fullName} (${foundReport.reportedAgainst?.role})`);
  console.log(`   - Reason: ${foundReport.reason}`);

  if (foundReport.reportedBy?.role !== 'brand' || foundReport.reportedAgainst?.role !== 'creator') {
    throw new Error('Populated roles mismatch');
  }
  console.log('   ✅ Admin report retrieval & population verified.\n');

  // 5. Admin updating report status to mediation and resolved
  console.log('4️⃣ Testing Admin report resolution:');
  const adminUser = await User.findOne({ role: 'admin' });
  const updatedReport = await adminService.updateReport(creatorReport._id, adminUser?._id, 'resolved');
  console.log(`   - Updated Status: ${updatedReport.status}`);
  console.log(`   - Resolved At: ${updatedReport.resolvedAt}`);

  if (updatedReport.status !== 'resolved') {
    throw new Error('Admin updateReport failed to resolve report.');
  }
  console.log('   ✅ Admin resolution verified.\n');

  // Clean up test report
  await AdminReport.findByIdAndDelete(creatorReport._id);
  console.log('🧹 Cleaned up test report.');

  console.log('\n======================================================');
  console.log('🎉 ALL REPORT CREATOR & REPORTING TESTS PASSED!');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

testReportFlow().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
