const express = require('express');
const bodyParser = require('body-parser');
const apiUtility = require('../../utility.js');
const errors = require('../../errorMsg.js');
const userDataLayer = process.env.PROD ? require("./user_data_layer/userDataLayer") : require("../../data_layer/user_data_layer/userDataLayer");
const http = require('http')

if (process.env.PROD == undefined && process.env.TEST == undefined)
    process.env["NODE_CONFIG_DIR"] = "../../config";

const config = require('config');

const PORT = config.get('usersPort');
const LEVELS = apiUtility.levels;
const app = express();
app.use(bodyParser.json());

//*** ERROR AND AUTH MIDDLEWARE ***/
const mwErrorHandler = require('../../middleware/mwErrorHandler');
app.use(mwErrorHandler);

const mwAuth = require('../../middleware/mwAuth.js');
if(process.env.TEST == undefined)
    app.use(apiUtility.unless(mwAuth, {path: "/users", method: "POST"}));


//*** USERS ENDPOINTS ***//

app.get('/users', async function (req, res, next) {

    if (!apiUtility.validateAuth(req, LEVELS.EDUCATOR))
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

    if (apiUtility.validateParamsUndefined(gid))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!(apiUtility.validateAuth(req, LEVELS.ADMIN) ))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    try {
        const group = await groupDataLayer.getGroup(gid);
        if (group == undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(group)
    } catch (err) {
        next(err);
    }
});


app.post('/users', async function (req, res, next) {
    const name = req.body.name;
    const surname = req.body.surname;
    const nickname = req.body.nickname;
    const birthdate = req.body.birthdate;
    const mail = req.body.mail;
    const password = req.body.password;
    const parents = req.body.parents;
    const phone = req.body.phone;

    if (apiUtility.validateParamsUndefined(name, surname, nickname, 
        birthdate, mail, password, parents, phone))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if(!Array.isArray(parents))
        return res.status(400).json(errors.EMPTY_ARRAY);
    if (apiUtility.validateParamsString(name, surname, nickname, birthdate))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    const groupData = {
        name: name,
        educators: educators,
        collaborators: collabs,
        guys: guys
    }

    try {
        if (!(await apiUtility.validateUsers([...educators, ...collabs, ...guys])))
            return res.status(400).json(errors.WRONG_USERS)

        const newGroup = await groupDataLayer.createGroup(groupData)
        if (newGroup === undefined)
            return res.status(400).json(errors.ALREADY_PRESENT);

        return res.status(201).json(newGroup);
    }
    catch (err) {
        console.log(err)
        next(err);
    }
});

app.put('/groups/:id', async function (req, res, next) {
    const groupId = req.params.id;
    const name = req.body.name;
    const educators = req.body.educators;
    const collabs = req.body.collabs;
    const guys = req.body.guys;

    if (apiUtility.validateParamsUndefined(groupId, name, educators, collabs, guys))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if(!apiUtility.validateParamsArray(educators, guys) || !Array.isArray(collabs))
        return res.status(400).json(errors.EMPTY_ARRAY);
    if (apiUtility.validateParamsString(groupId, name, ...educators, ...collabs, ...guys))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, groupId)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);
    const groupData = {
        name: name,
        educators: educators,
        collaborators: collabs,
        guys: guys
    };
    try {
        if (!await apiUtility.validateUsers([...educators, ...collabs, ...guys]))
            return res.status(400).json(errors.WRONG_USERS)

        const editedGroup = await groupDataLayer.modifyGroup(groupId, groupData)

        if (editedGroup === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(editedGroup);
    }
    catch (err) {
        next(err);
    }

})

app.delete('/groups/:id', async function (req, res, next) {
    const gid = req.params.id;

    if (apiUtility.validateParamsUndefined(gid))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);
    try {
        const isDeleted = await groupDataLayer.deleteGroup(gid)

        if (!isDeleted)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).end();
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
    server_starting: server_starting,
    validateUsers : validateUsers
}