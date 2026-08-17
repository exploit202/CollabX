const service = require('../services/brandnegotiationMessage.service'); const { successResponse } = require('../../../utils/apiResponse');
const sendMessage = async (req,res,next) => { try { return successResponse(res,201,'Message sent successfully.',{message:await service.sendMessage(req.user,req.body)}); } catch(e){next(e);} };
module.exports={sendMessage};
