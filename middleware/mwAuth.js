const fetch = require("node-fetch");

let config = {}
if (process.env.PROD || process.env.TESTING) {
    config = require('../config/default.json');
}
else {
    config = require('../../config/default.json');
}

const errors = require('../errorMsg.js');

const TOKEN_BASE =  config.tokenEndpoint;
const TOKEN_PORT =  (process.env.TESTING) ? `1${config.tokenPort}` : config.tokenPort;
const TOKEN_PATH =  config.tokenPath;
const TOKEN_ENDPOINT = `${TOKEN_BASE}:${TOKEN_PORT}${TOKEN_PATH}`;

module.exports = async function (req, res, next) {

    if (req.headers.authorization != undefined)
        req.token = req.headers.authorization.substr(7);
    else 
        return res.status(401).json(errors.INVALID_TOKEN);

    let options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${req.token}`,
            'action': "verifyToken"
        }
    }
    try {
        let idpResponse = await fetch(TOKEN_ENDPOINT, options);
        if (idpResponse.status == 200) {
            let body = await idpResponse.json();

            //Headers MUST be lowercase
            req.headers.uid = body.uid;
            req.headers.role = body.role;
            req.headers.educatorin = JSON.stringify(body.educatorIn);
            req.headers.collaboratorin = JSON.stringify(body.collaboratorIn);
            return next();
        }
        else {
            return res.status(401).json(errors.INVALID_TOKEN);
        }
    } catch (err) {
        next(err)
    }

}
