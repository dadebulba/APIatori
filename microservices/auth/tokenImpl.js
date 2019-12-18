const jwt = require('jsonwebtoken');
const errors = require('../../errorMsg.js');

module.exports = {
    createToken: function(userId, groupId, role, key) {
        return new Promise((resolve, reject) => {
            let payload = {
                uid: userId,
                gid: groupId,
                role: role
            };
    
            let options = {
                expiresIn: '1d'
            }
    
            jwt.sign(payload, key, options, (err, token) => {
                if (err)
                    reject(err);
                else
                    resolve(token);
            });
        });
    },
    verifyToken: function(token, key) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, key, (err, decoded) => {
                if (err)
                    reject(errors.INVALID_TOKEN);
                else
                    resolve([decoded.uid, decoded.gid, decoded.role]);
            });
        });
    }
}