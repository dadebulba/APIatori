const apiUtility = require('../../utility.js');
process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config');

const BASE_URL = process.env.baseURL || config.get('baseURL');
const GROUP_DL_PATH = process.env.groupDLPath || config.get('groupDLPath');
const GROUP_DL_PORT = process.env.groupDataLayerPort || config.get('groupDataLayerPort');

const GROUP_DL_ENDPOINT = `${BASE_URL}:${GROUP_DL_PORT}${GROUP_DL_PATH}`;

module.exports = {
    getGroups: async function (groupId) {
        try {
            let res;
            if(groupId){
                res = await fetch(`${GROUP_DL_ENDPOINT}/${groupId}`).then(apiUtility.checkStatus);
            }
            else{
                res = await fetch(GROUP_DL_ENDPOINT).then(apiUtility.checkStatus);
            }
            
            if (res.ok) {
                const groups = await res.json();
                return groups;
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    createNewGroup: async function (name, educators, collabs, guys, calendarMail) {
        const body = { 
            name: name,
            educators : educators,
            collaborators : collabs,
            guys : guys,
            calendarMail : calendarMail
        };
        try {
            const res = await fetch(GROUP_DL_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }

            }).then(apiUtility.checkStatus);

            if (res.ok) {
                const group = await res.json();
                return group;
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    editGroup: async function (name, educators, collabs, guys, calendarMail) {
        const body = { 
            name: name,
            educators : educators,
            collaborators : collabs,
            guys : guys,
            calendarMail : calendarMail
        };
        try {
            const res = await fetch(GROUP_DL_ENDPOINT, {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }

            }).then(apiUtility.checkStatus);

            if (res.ok) {
                const group = await res.json();
                return group;
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    deleteGroup: async function (groupId) {
        try {
            const res = await fetch(`${GROUP_DL_ENDPOINT}/${groupId}`, {
                method: 'DELETE'
            }).then(apiUtility.checkStatus);

            if (res.ok) {
                return true;
            }
            else
                return false;

        } catch (err) {
            next(err);
        }
    }
}