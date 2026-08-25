const mongoose=require('mongoose');
const schema=new mongoose.Schema({campaignId:{type:mongoose.Schema.Types.ObjectId,ref:'Campaign',required:true,unique:true},action:{type:String,enum:['flagged','cleared'],default:'flagged'},note:{type:String,trim:true,maxlength:1000,default:''},updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}},{timestamps:true});
module.exports=mongoose.models.AdminCampaignAction||mongoose.model('AdminCampaignAction',schema);
