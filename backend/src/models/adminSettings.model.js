const mongoose=require('mongoose');
const schema=new mongoose.Schema({key:{type:String,unique:true,default:'platform'},brandServiceFee:{type:Number,min:0,max:100,default:10},creatorCommissionFee:{type:Number,min:0,max:100,default:5},payoutHoldDays:{type:Number,min:0,max:365,default:7}},{timestamps:true});
module.exports=mongoose.models.AdminSettings||mongoose.model('AdminSettings',schema);
