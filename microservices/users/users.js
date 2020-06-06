const express = require('express');
const bodyParser = require('body-parser');
const apiUtility = (process.env.PROD != undefined) ? require("./utility.js") : require('../../utility.js');
const errors = (process.env.PROD != undefined) ? require("./errorMsg.js") : require('../../errorMsg.js');
const userDataLayer = process.env.PROD ? require("./data_layer/user_data_layer/userDataLayer") : require("../../data_layer/user_data_layer/userDataLayer");
const http = require('http')

if (process.env.PROD == undefined && process.env.TEST == undefined)
    process.env["NODE_CONFIG_DIR"] = "../../config";

const config = require('config');

const PORT = config.get('usersPort');
const LEVELS = apiUtility.levels;
const app = express();
app.use(bodyParser.json());

//*** ERROR AND AUTH MIDDLEWARE ***/
const mwErrorHandler = (!process.env.PROD) ? require('../../middleware/mwErrorHandler') : require('./middleware/mwErrorHandler');
app.use(mwErrorHandler);

//*** USERS ENDPOINTS ***//

app.get('/users', async function (req, res, next) {

    if (!apiUtility.validateAuth(req, LEVELS.ADMIN))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    try {
        const users = await userDataLayer.getAllUsers();
        return res.status(200).json(users);
    }
    catch (err) {
        next(err);
    }
});


app.get('/users/:id', async function (req, res, next) {
    const uid = req.params.id;

    if (apiUtility.validateParamsUndefined(uid))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(uid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR)||apiUtility.validateAuth(req, LEVELS.SELF, uid)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    try {
        const user = await userDataLayer.getUser(uid)
        if (user == undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(user)
    } catch (err) {
        next(err);
    }
});


app.post('/users', async function (req, res, next) {
    const name = req.body.name;
    const surname = req.body.surname;
    const mail = req.body.mail;
    const password = req.body.password;
    const phone = req.body.phone;

    if (apiUtility.validateParamsUndefined(name, surname, mail, password, phone))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(name, surname))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if(!apiUtility.validateEmail(mail))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    const userInfo = {
        name: name,
        surname: surname,
        mail: mail,
        password: password,
        phone: phone
    }

    try {
        const newUser = await userDataLayer.createUser(userInfo)
        if (newUser === undefined)
            return res.status(400).json(errors.ALREADY_PRESENT);

        return res.status(201).json(newUser);
    }
    catch (err) {
        next(err);
    }
});

let server = http.createServer(app);

let server_starting = new Promise((resolve, reject) => {
    server.listen(PORT, async () => {
        if (!process.env.TEST) {
            await userDataLayer.init();
        }
        resolve();
    });
});

module.exports = {
    server: server,
    server_starting: server_starting
}