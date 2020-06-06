const fetch = require("node-fetch");
if (process.env.PROD == undefined && process.env.TEST == undefined) process.env["NODE_CONFIG_DIR"] = "../config";
const config = require('config');
const errors = require('../errorMsg.js');

const IdP_URL = config.baseURL + ":" + config.tokenPort + config.tokenPath;

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
        let idpResponse = await fetch(IdP_URL, options);
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