let tokenImpl = require('../api/impl/tokenImpl.js');
const errors = require('../api/errorMsg.js');

module.exports = async function(req, res, next) {
    try {
        let userId = await tokenImpl.verifyToken(req.token);
        req['uid'] = userId;
        
        return next();
    }
    catch (e) {
        return res.status(401).json(e);
    }
};