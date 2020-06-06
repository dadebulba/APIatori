const express = require('express');
const bodyParser = require('body-parser');
const apiUtility = (process.env.PROD != undefined) ? require("./utility.js") : require('../../utility.js');
const errors = (process.env.PROD != undefined) ? require("./errorMsg.js") : require('../../errorMsg.js');
const groupDataLayer = process.env.PROD ? require("./data_layer/group_data_layer/groupDataLayer") : require("../../data_layer/group_data_layer/groupDataLayer");
const userDataLayer = process.env.PROD ? require("./data_layer/user_data_layer/userDataLayer") : require("../../data_layer/user_data_layer/userDataLayer");
const http = require('http');

if (!process.env.TEST){
    var GoogleCalendarAdapter;
    if (process.env.PROD != undefined)
        GoogleCalendarAdapter = require("./adapters/googleCalendarAdapter");
    else
        GoogleCalendarAdapter = require("../../adapters/googleCalendarAdapter");
}

if (process.env.PROD == undefined && process.env.TEST == undefined)
    process.env["NODE_CONFIG_DIR"] = "../../config";

const config = require('config');

const PORT = config.get('groupsPort');
const LEVELS = apiUtility.levels;
const app = express();
app.use(bodyParser.json());

//*** ERROR AND AUTH MIDDLEWARE ***/
const mwErrorHandler = (!process.env.PROD) ? require('../../middleware/mwErrorHandler') : require('./middleware/mwErrorHandler');
app.use(mwErrorHandler);


//*** UTILS ***/
async function validateUsers(usersToCheck) {
    const usersOnDB = await userDataLayer.getAllUsers();
    const uidsOnDB = [];
    usersOnDB.forEach(user => uidsOnDB.push(user.uid));

    let result = usersToCheck.every(uid => uidsOnDB.includes(uid));
    return result;
}

async function addGroupToUsers(gid, educators, collaborators){

    let promises = [];

    for (var i=0; i<educators.length; i++){
        let uid = educators[i];
        let educator = await userDataLayer.getUser(uid);
        let check = educator.educatorIn.every(item => item != gid);

        //If check==false, the gid is already present in that educatorIn array
        if (check){
            educator.educatorIn.push(gid);
            promises.push(userDataLayer.modifyUser(uid, {educatorIn: educator.educatorIn}));
        }
    };

    for (var i=0; i<collaborators.length; i++){
        let uid = collaborators[i];
        let collaborator = await userDataLayer.getUser(uid);
        let check = collaborator.collaboratorIn.every(item => item != gid);

        //If check==false, the gid is already present in that collaboratorIn array
        if (check){
            collaborator.collaboratorIn.push(gid);
            promises.push(userDataLayer.modifyUser(uid, {collaboratorIn: collaborator.collaboratorIn}));
        }
    };

    if (promises.length != 0)
        await Promise.all(promises);

    return true;
}

async function updateGroupToUsers(oldGroup, newEducators, newCollaborators){

    let promises = [];
    const gid = oldGroup.gid;
    const oldEducators = oldGroup.educators;
    const oldCollaborators = oldGroup.collaborators;

    //Delete the old educators
    for (var i=0; i<oldEducators.length; i++){
        let check = newEducators.includes(oldEducators[i]);

        //If it is been deleted from the new educators list...
        if (!check){
            let user = await userDataLayer.getUser(oldEducators[i]);
            
            for (var j=0; j<user.educatorIn.length; j++)
                if (user.educatorIn[j] == gid)
                    user.educatorIn.splice(j,1);

            promises.push(userDataLayer.modifyUser(user.uid, {educatorIn: user.educatorIn}));
        }
    }

    //Add the new educators
    for (var i=0; i<newEducators.length; i++){
        let check = oldEducators.includes(newEducators[i]);

        if (!check){
            let user = await userDataLayer.getUser(newEducators[i]);
            user.educatorIn.push(gid);

            promises.push(userDataLayer.modifyUser(user.uid, {educatorIn: user.educatorIn}));
        }
    }

    //Delete the old collaborators
    for (var i=0; i<oldCollaborators.length; i++){
        let check = newCollaborators.includes(oldCollaborators[i]);

        //If it is been deleted from the new collaborators list...
        if (!check){
            let user = await userDataLayer.getUser(oldCollaborators[i]);

            for (var j=0; j<user.collaboratorIn.length; j++)
                if (user.collaboratorIn[j] == gid)
                    user.collaboratorIn.splice(j,1);

            promises.push(userDataLayer.modifyUser(user.uid, {collaboratorIn: user.collaboratorIn}));
        }
    }

    //Add the new collaborators
    for (var i=0; i<newCollaborators.length; i++){
        let check = oldCollaborators.includes(newCollaborators[i]);

        if (!check){
            let user = await userDataLayer.getUser(newCollaborators[i]);
            user.collaboratorIn.push(gid);

            promises.push(userDataLayer.modifyUser(user.uid, {collaboratorIn: user.collaboratorIn}));
        }
    }

    if (promises.length != 0)
        await Promise.all(promises);

    return true;
}

async function deleteGroupToUsers(gid, educators, collaborators){

    let promises = [];
    var toUpdate;

    for (var i=0; i<educators.length; i++){
        let uid = educators[i];
        let educator = await userDataLayer.getUser(uid);
        toUpdate = false;

        for (var j=0; j<educator.educatorIn.length && !toUpdate; j++)
            if (educator.educatorIn[j] == gid){
                educator.educatorIn.splice(j,1);
                toUpdate = true;
            }

        if (toUpdate)
            promises.push(userDataLayer.modifyUser(uid, {educatorIn: educator.educatorIn}));
    }

    for (var i=0; i<collaborators.length; i++){
        let uid = collaborators[i];
        let collaborator = await userDataLayer.getUser(uid);
        toUpdate = false;

        for (var j=0; j<collaborator.collaboratorIn.length && !toUpdate; j++)
            if (collaborator.collaboratorIn[j] == gid){
                collaborator.collaboratorIn.splice(j,1);
                toUpdate = true;
            }

        if (toUpdate)
            promises.push(userDataLayer.modifyUser(uid, {collaboratorIn: collaborator.collaboratorIn}));
    }

    if (promises.length != 0)
        await Promise.all(promises);

    return true;
}
//*** GROUPS ENDPOINTS ***//

app.get('/groups', async function (req, res, next) {
    if (!(apiUtility.validateAuth(req, LEVELS.USER)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    try {
        const groups = await groupDataLayer.getAllGroups();

        return res.status(200).json(groups);
    }
    catch (err) {
        next(err);
    }
});


app.get('/groups/:id', async function (req, res, next) {
    const gid = req.params.id;

    if (apiUtility.validateParamsUndefined(gid))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, gid) || apiUtility.validateAuth(req, LEVELS.COLLABORATOR, gid)))
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


app.post('/groups', async function (req, res, next) {
    var name = req.body.name;
    const educators = req.body.educators;
    const collabs = req.body.collabs;
    const guys = req.body.guys;

    if (apiUtility.validateParamsUndefined(name, educators, collabs, guys))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if(!apiUtility.validateParamsArray(educators, guys) || !Array.isArray(collabs))
        return res.status(400).json(errors.EMPTY_ARRAY);
    if (apiUtility.validateParamsString(name, ...educators, ...collabs, ...guys))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    //First letter must be uppercase
    name = name.charAt(0).toUpperCase() + name.slice(1);

    const groupData = {
        name: name,
        educators: educators,
        collaborators: collabs,
        guys: guys
    }

    try {
        if (!(await exportFunctions.validateUsers([...educators, ...collabs, ...guys])))
            return res.status(400).json(errors.WRONG_USERS)

        var newGroup = await groupDataLayer.createGroup(groupData)
        if (newGroup === undefined)
            return res.status(400).json(errors.ALREADY_PRESENT);

        //Create the Google Calendar if it isn't running tests and add the id to the data layer
        if (!process.env.TEST){
            let calendarId = await GoogleCalendarAdapter.createCalendar(name);
            if (calendarId != undefined){
                groupData.calendarId = calendarId;

                groupData.balance = newGroup.balance;
                newGroup = await groupDataLayer.modifyGroup(newGroup.gid, groupData);
            }
        }

        //Update educatorIn and collaboratorIn fields of all these users
        await exportFunctions.addGroupToUsers(newGroup.gid, newGroup.educators, newGroup.collaborators);

        return res.status(201).json(newGroup);
    }
    catch (err) {
        next(err);
    }
});

app.put('/groups/:id', async function (req, res, next) {
    const groupId = req.params.id;
    const name = req.body.name;
    const educators = req.body.educators;
    const collabs = req.body.collabs;
    const guys = req.body.guys;
    const balance = req.body.balance;

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
        guys: guys,
        balance: balance
    };
    try {
        if (!(await exportFunctions.validateUsers([...educators, ...collabs, ...guys])))
            return res.status(400).json(errors.WRONG_USERS)

        const oldGroup = await groupDataLayer.getGroup(groupId)
        const editedGroup = await groupDataLayer.modifyGroup(groupId, groupData)

        if (editedGroup === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        //Update educatorIn and collaboratorIn fields of all these users
        await exportFunctions.updateGroupToUsers(oldGroup, editedGroup.educators, editedGroup.collaborators);
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
        const deleted = await groupDataLayer.deleteGroup(gid)

        if (!deleted)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        await exportFunctions.deleteGroupToUsers(gid, deleted.educators, deleted.collaborators);

        return res.status(200).end();
    }
    catch (err) {
        console.log(err);
        next(err);
    }

});

let server = http.createServer(app);

let server_starting = new Promise((resolve, reject) => {
    server.listen(PORT, async () => {
        if (!process.env.TEST) {
            await groupDataLayer.init();
            await userDataLayer.init();
            let gcAdapter = GoogleCalendarAdapter.init();

            if (!gcAdapter)
                reject();
        }
        resolve();
    });
});

const exportFunctions = {
    server: server,
    server_starting: server_starting,
    validateUsers : validateUsers,
    addGroupToUsers: addGroupToUsers,
    deleteGroupToUsers: deleteGroupToUsers,
    updateGroupToUsers: updateGroupToUsers
}

module.exports = exportFunctions;