const express = require('express');
const bodyParser = require('body-parser');
const groupsImpl = require('./groupsImpl.js');
const apiUtility = require('../../utility.js');
const errors = require('../../errorMsg.js');

process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config');

const PORT = config.get('groupsPort');
const key = config.get('API_KEY');
const basePath = config.get("basePath");
const LEVELS = apiUtility.levels;
const app = express();
app.use(bodyParser.json());

//*** ERROR AND AUTH MIDDLEWARE ***/
const mwErrorHandler = require('../../middleware/mwErrorHandler');
app.use(mwErrorHandler);

const mwAuth = require('../../middleware/mwAuth.js');
app.use(mwAuth);

//*** GROUPS ENDPOINTS ***//

app.get('/groups', async function (req, res) {
    try {
        const groups = await groupsImpl.getGroups();
        if (groups === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(groups);
    }
    catch (err) {
        next(err);
    }
});


app.get('/groups/:id', async function (req, res) {
    const gid = req.params.id;

    if (apiUtility.validateParamsUndefined(gid))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    try {
        if (!await apiUtility.validateGroupId(gid) == false)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        const group = await groupsImpl.getGroups(gid);
        if (group == undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(group)
    } catch (err) {
        next(err);
    }
});


app.post('/groups', async function (req, res) {
    const name = req.body.name;
    const educators = req.body.educators;
    const collabs = req.body.collabs;
    const guys = req.body.guys;
    const calendarMail = req.body.calendarMail;

    if (apiUtility.validateParamsUndefined(name, ...educators,...collabs,...guys, calendarMail))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsString(name, ...educators, ...collabs, ...guys))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if(!apiUtility.validateEmail(calendarMail))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if(!groupsImpl.checkUsersValid([...educators, ...collabs, ...guys]))
    if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    try {
        const newGroup = await groupsImpl.createNewGroup(name, educators, collabs, guys, calendarMail);
        if (newGroup === undefined)
            return res.status(400).json(errors.ALREADY_PRESENT);

        return res.status(201).json(newGroup);
    }
    catch (err) {
        next(err);
    }
});

app.put('/groups/:id', async function (req, res) {
    const groupId = req.params.id;
    const name = req.body.name;
    const educators = req.body.educators;
    const collabs = req.body.collabs;
    const guys = req.body.guys;
    const calendarMail = req.body.calendarMail;

    if (apiUtility.validateParamsUndefined(groupId, name, ...educators,...collabs,...guys, calendarMail))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsString(groupId, name, ...educators, ...collabs, ...guys))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if(!apiUtility.validateEmail(calendarMail))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    try {
        if (!await apiUtility.validateGroupId(groupId))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, groupId)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const editedGroup = await groupsImpl.editGroup(groupId, name, educators, collabs, guys, calendarMail);

        if (editedGroup === undefined)
            return res.status(400).json(errors.ALREADY_PRESENT);

        return res.status(200).json(editedGroup);
    }
    catch (err) {
        next(err);
    }

})

app.delete('/groups/:id', async function (req, res) {
    const gid = req.params.id;

    if (apiUtility.validateParamsUndefined(gid))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsString(gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    try {
        if (!await apiUtility.validateGroupId(gid))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const isDeleted = await groupsImpl.deleteGroup(gid);

        if (!isDeleted)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).end();
    }
    catch (err) {
        next(err);
    }

});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
});