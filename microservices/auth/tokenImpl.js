const jwt = require('jsonwebtoken');
const errors = require('../../errorMsg.js');

module.exports = {
    createToken: function(userId, key) {
        return new Promise((resolve, reject) => {
            let payload = {
                id: userId
            };
    
            let options = {
                expiresIn: '10d'
            }
    
            jwt.sign(payload, key, options, (err, token) => {
                if (err) {
                    reject(err);
                }
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
                    resolve(decoded.id);
            });
        });
    }
}