const User=require('../../../models/user.model');const BrandProfile=require('../../../models/brandProfile.model');const CreatorProfile=require('../../../models/creatorProfile.model');const Campaign=require('../../../models/campaign.model');const Collaboration=require('../../../models/collaboration.model');const AdminReport=require('../../../models/adminReport.model');const AdminSettings=require('../../../models/adminSettings.model');const AdminCampaignAction=require('../../../models/adminCampaignAction.model');
const getDashboard=async()=>{const [totalCreators,activeBrands,totalCampaigns,totalCollaborations,pendingReports,revenue]=await Promise.all([User.countDocuments({role:'creator'}),User.countDocuments({role:'brand',isActive:true}),Campaign.countDocuments({}),Collaboration.countDocuments({}),AdminReport.countDocuments({status:{$in:['pending','mediation']}}),Collaboration.aggregate([{$match:{status:{$ne:'cancelled'}}},{$group:{_id:null,total:{$sum:'$agreedPrice'}}}])]);const pendingCreators=await User.find({role:'creator',isVerified:false}).sort({createdAt:-1}).limit(10).lean();return{stats:{totalCreators,activeBrands,totalCampaigns,totalCollaborations,pendingReports,totalRevenue:revenue[0]?.total||0},pendingCreators};};
const getUsers=async({role,search})=>{const f={role:{$in:['creator','brand']}};if(['creator','brand'].includes(role))f.role=role;if(search)f.$or=[{fullName:new RegExp(search.trim(),'i')},{email:new RegExp(search.trim(),'i')}];const users=await User.find(f).sort({createdAt:-1}).limit(200).lean();const ids=users.map(u=>u._id);const [brands,creators]=await Promise.all([BrandProfile.find({userId:{$in:ids}}).lean(),CreatorProfile.find({userId:{$in:ids}}).lean()]);const bm=new Map(brands.map(p=>[String(p.userId),p]));const cm=new Map(creators.map(p=>[String(p.userId),p]));return users.map(u=>({...u,profile:u.role==='brand'?bm.get(String(u._id))||null:cm.get(String(u._id))||null}));};
const updateUser=async(id,field,value)=>{const u=await User.findOneAndUpdate({_id:id,role:{$in:['brand','creator']}},{$set:{[field]:Boolean(value)}},{new:true});if(!u)throw Object.assign(new Error('Brand or Creator user not found.'),{statusCode:404});const o=u.toObject();delete o.password;return o;};
const getCampaigns=async()=>{const cs=await Campaign.find({}).sort({createdAt:-1}).limit(200).lean();const as=await AdminCampaignAction.find({campaignId:{$in:cs.map(c=>c._id)}}).lean();const m=new Map(as.map(a=>[String(a.campaignId),a]));return cs.map(c=>({...c,moderation:m.get(String(c._id))||null}));};
const moderateCampaign=async(id,adminId,action,note='')=>{if(!['flagged','cleared'].includes(action))throw Object.assign(new Error('Invalid moderation action.'),{statusCode:400});if(!await Campaign.exists({_id:id}))throw Object.assign(new Error('Campaign not found.'),{statusCode:404});return AdminCampaignAction.findOneAndUpdate({campaignId:id},{$set:{action,note,updatedBy:adminId}},{new:true,upsert:true,setDefaultsOnInsert:true});};
const getCollaborations=()=>Collaboration.find({}).sort({createdAt:-1}).limit(200).lean();
const getReports=()=>AdminReport.find({}).populate('reportedBy','fullName email role profileImage isVerified isActive').populate('reportedAgainst','fullName email role profileImage isVerified isActive').populate('resolvedBy','fullName email role').sort({createdAt:-1}).limit(200).lean();
const createReport=async(by,d)=>{const target=await User.findOne({_id:d.reportedAgainst,role:{$in:['brand','creator']}});if(!target||String(target._id)===String(by))throw Object.assign(new Error('Invalid report target.'),{statusCode:400});return AdminReport.create({reportedBy:by,reportedAgainst:target._id,reason:d.reason,description:d.description||''});};
const updateReport=async(id,adminId,status)=>{if(!['pending','mediation','resolved','dismissed'].includes(status))throw Object.assign(new Error('Invalid report status.'),{statusCode:400});const u={status};if(['resolved','dismissed'].includes(status)){u.resolvedBy=adminId;u.resolvedAt=new Date();}else{u.resolvedBy=null;u.resolvedAt=null;}const r=await AdminReport.findByIdAndUpdate(id,u,{new:true}).populate('reportedBy','fullName email role').populate('reportedAgainst','fullName email role');if(!r)throw Object.assign(new Error('Report not found.'),{statusCode:404});try{const{createNotification}=require('../../../services/notification.service');if(r.reportedBy?._id){await createNotification(r.reportedBy._id,'Dispute Status Updated',`Admin has marked your report against ${r.reportedAgainst?.fullName||'user'} as "${status}".`,'report_resolved',{entityId:r._id,entityType:'AdminReport'});}if(r.reportedAgainst?._id){await createNotification(r.reportedAgainst._id,'Dispute Notice Updated',`Admin moderation review for your dispute with ${r.reportedBy?.fullName||'user'} is now "${status}".`,'report_resolved',{entityId:r._id,entityType:'AdminReport'});}}catch(e){console.error('Notification error on report update:',e);}return r;};
const getSettings=async()=>{let s=await AdminSettings.findOne({key:'platform'});if(!s)s=await AdminSettings.create({key:'platform'});return s;};const updateSettings=(d)=>AdminSettings.findOneAndUpdate({key:'platform'},{$set:{...(d.brandServiceFee!==undefined&&{brandServiceFee:d.brandServiceFee}),...(d.creatorCommissionFee!==undefined&&{creatorCommissionFee:d.creatorCommissionFee}),...(d.payoutHoldDays!==undefined&&{payoutHoldDays:d.payoutHoldDays})}},{new:true,upsert:true,setDefaultsOnInsert:true,runValidators:true});
const Notification = require('../../../models/notification.model');

const getNotifications = async (adminId) => {
  return Notification.find({
    $or: [{ userId: adminId }, { type: 'system' }]
  })
    .populate('senderId', 'fullName email profileImage')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
};

const markNotificationRead = async (id, adminId) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: id, $or: [{ userId: adminId }, { type: 'system' }] },
    { isRead: true, read: true },
    { new: true }
  );
  if (!notif) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }
  return notif;
};

const markAllNotificationsRead = async (adminId) => {
  await Notification.updateMany(
    { $or: [{ userId: adminId }, { type: 'system' }], isRead: false },
    { isRead: true, read: true }
  );
  return { success: true };
};

module.exports = {
  getDashboard,
  getUsers,
  updateUser,
  getCampaigns,
  moderateCampaign,
  getCollaborations,
  getReports,
  createReport,
  updateReport,
  getSettings,
  updateSettings,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
