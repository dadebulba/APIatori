const express = require('express');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const tokenImpl = require('./tokenImpl.js');
const apiUtility = require('../../utility.js');
const errors = require('../../errorMsg.js');

process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config'); 
//TODO: add DB
const PORT = process.env.SPACES_PORT || config.get('spacesPort');
const key = process.env.API_KEY || config.get('API_KEY');

const app = express();
app.use(bodyParser.json());

//TODO: add middleware for authentication
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
});