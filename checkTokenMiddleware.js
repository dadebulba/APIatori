const fetch = require("node-fetch");
const bearerToken = require('express-bearer-token');
process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config'); 

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

        res['uid'] = body.uid;
        res['gid'] = body.gid;
        res['role'] = body.role;
        res['educatorIn'] = body.educatorIn;
    }
    else {
        res['uid'] = undefined;
        res['gid'] = undefined;
        res['role'] = undefined;
        res['educatorIn'] = undefined;
    }

    return next();
}