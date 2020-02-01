const fetch = require("node-fetch");
const express = require('express');
const bearerToken = require('express-bearer-token');
process.env["NODE_CONFIG_DIR"] = "../config/";
const config = require('config'); 
const errors = require('../errorMsg.js');

const app = express();
app.use(bearerToken());

const IdP_URL = config.tokenURL + ":" + config.tokenPort;;

module.exports = async function(req, res, next){

    let options = {
        method: 'POST',
        headers: {  'Authorization': `Bearer ${req.token}`,
                    'action': "verifyToken" 
        }
    }

    let idpResponse = await fetch(IdP_URL, options);
    if (idpResponse.status == 200){
        let body = await idpResponse.json();

        req['uid'] = body.uid;
        req['gid'] = body.gid;
        req['role'] = body.role;
        req['educatorIn'] = body.educatorIn;
        return next();
    }
    else {
        return res.status(401).json(errors.INVALID_TOKEN);
    }

}