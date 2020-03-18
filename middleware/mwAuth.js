const fetch = require("node-fetch");
const express = require('express');
const bearerToken = require('express-bearer-token');
if (process.env.PROD == undefined) process.env["NODE_CONFIG_DIR"] = "../config";
const config = require('config');
const errors = (process.env.PROD != undefined) ? require("./errorMsg.js") : require('../errorMsg.js');

const app = express();
app.use(bearerToken());

const IdP_URL = config.tokenURL + ":" + config.tokenPort + config.tokenPath;

module.exports = async function (req, res, next) {

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

            req['uid'] = body.uid;
            req['role'] = body.role;
            return next();
        }
        else {
            return res.status(401).json(errors.INVALID_TOKEN);
        }
    } catch (err) {
        next(err)
    }

}