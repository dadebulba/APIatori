const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const tokenImpl = require('./tokenImpl.js');
const apiUtility = require('../../utility.js');
const errors = require('../../errorMsg.js');

process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config'); 
//const UserDb = require('../../mock/mockedUser.js');
const PORT = process.env.PORT || config.get('tokenPort');
const key = process.env.API_KEY || config.get('API_KEY');

const app = express();
app.use(bodyParser.json());
app.use(bearerToken());

app.post('/token', async function (req, res) {
    let h_action = req.headers.action;
    console.log(h_action);
    if (h_action !== undefined && h_action == 'createToken') {
        let b_email = req.body.email;
        let b_pwd = req.body.password;

        if (apiUtility.validateParamsUndefined(b_email, b_pwd))
            res.status(400).json(errors.PARAMS_UNDEFINED);

        //TODO: UserDB
        //let userDb = new UserDb();
        try {
            //let userId = await userDb.authenticate(b_email, b_pwd);
            let userId = Math.random() * 100;
            console.log(userId);
            let token = await tokenImpl.createToken(userId, key);
            res.status(200).send(token);
        }
        catch (e) {
            res.status(401).json(errors.INVALID_CREDENTIALS);
        }
    }
    else if(h_action !== undefined && h_action == 'verifyToken'){
        try {
            console.log(req.token);
            let userId = await tokenImpl.verifyToken(req.token, key);
            console.log(userId);
            res.send(`${userId}`);
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