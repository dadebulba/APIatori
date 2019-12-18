const express = require('express');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const tokenImpl = require('./tokenImpl.js');
const apiUtility = require('../../utility.js');
const errors = require('../../errorMsg.js');

process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config'); 

const PORT = process.env.PORT || config.get('tokenPort');
const key = process.env.API_KEY || config.get('API_KEY');

const app = express();
app.use(bodyParser.json());
app.use(bearerToken());

app.post('/token', async function (req, res) {
    let h_action = req.headers.action;
    
    if (h_action == 'createToken') {
        let b_email = req.body.email;
        let b_pwd = req.body.password;

        if (apiUtility.validateParamsUndefined(b_email, b_pwd))
            res.status(400).json(errors.PARAMS_UNDEFINED);

        try {
            //TO-CHANGE
            let uid = Math.floor(Math.random() * 100);
            let gid = Math.floor(Math.random() * 100);
            let role = "ANIMATO";

            let token = await tokenImpl.createToken(uid, gid, role, key);
            res.status(200).send(token);
        }
        catch (e) {
            res.status(401).json(errors.INVALID_CREDENTIALS);
        }
    }
    else if(h_action == 'verifyToken'){
        try {
            let result = await tokenImpl.verifyToken(req.token, key);
            res.status(200).json({uid: result[0], gid: result[1], role: result[2]});
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