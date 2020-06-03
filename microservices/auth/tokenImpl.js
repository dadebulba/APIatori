const jwt = require('jsonwebtoken');

module.exports = {
    createToken: function(userId, role, educatorIn, collaboratorIn, key) {
        return new Promise((resolve, reject) => {
            let payload = {
                uid: userId,
                role: role,
                educatorIn: educatorIn,
                collaboratorIn: collaboratorIn
            };
    
            let options = {
                expiresIn: '1d',
                algorithm:  "RS256" 
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

            let verifyOptions = {
                expiresIn:  "1d",
                algorithm:  ["RS256"]
               };

            jwt.verify(token, key, verifyOptions, (err, decoded) => {
                if (err)
                    reject(errors.INVALID_TOKEN);
                else
                    resolve([decoded.uid, decoded.role, decoded.educatorIn, decoded.collaboratorIn]);
            });
        });
    }
}