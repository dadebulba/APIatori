const express = require('express');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const fs = require("fs");
const fetch = require("node-fetch");   
const crypto = require('crypto');

const tokenImpl = require('./tokenImpl.js');
const errors = process.env.PROD ? require("./errorMsg.js") : require('../../errorMsg.js');
const apiUtility = process.env.PROD ? require("./utility.js") : require("../../utility.js");
const userDataLayer = process.env.PROD ? require("./user_data_layer/userDataLayer.js") : require("../../data_layer/user_data_layer/userDataLayer.js");

if (process.env.PROD == undefined) process.env["NODE_CONFIG_DIR"] = "../../config";
const config = require('config'); 

const privateKeyPath = (process.env.PROD == undefined) ? "../../config/private.pem" : "./config/private.pem";
const publicKeyPath = (process.env.PROD == undefined) ? "../../config/public.crt" : "./config/public.crt";

const PORT = config.get('tokenPort');
const PRIVATE_KEY = fs.readFileSync(privateKeyPath, "utf8");
const PUBLIC_KEY = fs.readFileSync(publicKeyPath, "utf8");

const app = express();
app.use(bodyParser.json());
app.use(bearerToken());

app.post('/token', async function (req, res) {
    let h_action = req.headers.action;
    
    if (h_action == 'createToken') {
        let body = req.body;
        let b_email = body.email;
        var b_pwd = body.password;

        if (b_pwd != undefined)
            b_pwd = crypto.createHash("sha256").update(b_pwd).digest("hex");

        if (apiUtility.validateParamsUndefined(b_email, b_pwd)){
            console.log("Email",b_email, "Password",b_pwd)
            res.status(400).json(errors.PARAMS_UNDEFINED);
            return;
        }

        try {
            //TODO modificare con nuovo user_data_layer
            let queryURL = config.baseURL + ":" + config.userDataLayerPort + config.userDLPath;
            let response = await fetch(queryURL);
            let responseBody = await response.json();
            
            for (var i=0; i<responseBody.length; i++){
                if (responseBody[i].mail === b_email && responseBody[i].password === b_pwd){
                    let token = await tokenImpl.createToken(responseBody[i].uid, responseBody[i].role, PRIVATE_KEY);
                    res.status(200).send(token);
                    return;
                }
            }

            res.status(401).json(errors.INVALID_CREDENTIALS);
        }
        catch (e) {
            res.status(401).json(errors.INVALID_CREDENTIALS);
        }
    }
    else if(h_action == 'verifyToken'){
        try {
            let result = await tokenImpl.verifyToken(req.token, PUBLIC_KEY);
            res.status(200).json({uid: result[0], role: result[1]});
        }
        catch (e) {
            res.status(401).json(e);
        }
    }
    else {
        res.status(400).json(errors.PARAMS_UNDEFINED);
    }
    
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
});