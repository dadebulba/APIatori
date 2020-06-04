const express = require('express');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const fs = require("fs");
const http = require('http')

const tokenImpl = require('./tokenImpl.js');
const errors = (process.env.PROD) ? require("./errorMsg.js") : require('../../errorMsg.js');
const apiUtility = (process.env.PROD) ? require("./utility.js") : require("../../utility.js");
const userDataLayer = process.env.PROD ? require("./data_layer/user_data_layer/userDataLayer.js") : require("../../data_layer/user_data_layer/userDataLayer.js");

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

        if (apiUtility.validateParamsUndefined(b_email, b_pwd))
            return res.status(400).json(errors.PARAMS_UNDEFINED);

        try {
            let user = await userDataLayer.login(b_email, b_pwd);
            if (user == undefined)
                return res.status(401).json(errors.INVALID_CREDENTIALS);

            let token = await tokenImpl.createToken(
                user.uid, 
                user.role,
                user.educatorIn,
                user.collaboratorIn,
                PRIVATE_KEY
            );

            return res.status(200).send(token);
        }
        catch (e) {
            return res.status(400).json(errors.PARAMS_WRONG_TYPE);
        }
    }
    else if(h_action == 'verifyToken'){
        try {
            let result = await tokenImpl.verifyToken(req.token, PUBLIC_KEY);
            res.status(200).json({uid: result[0], role: result[1], educatorIn: result[2], collaboratorIn: result[3]});
        }
        catch (e) {
            res.status(401).json(e);
        }
    }
    else {
        res.status(400).json(errors.PARAMS_UNDEFINED);
    }
    
});

let server = http.createServer(app);

let server_starting = new Promise((resolve, reject) => {
    server.listen(PORT, async () => {
        if(!process.env.TEST)
            await userDataLayer.init();
        resolve();
    });
});

module.exports = {
    server: server,
    server_starting: server_starting
}