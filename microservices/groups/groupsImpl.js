const groupDataLayer = process.env.PROD ? require("./group_data_layer/groupDataLayer") : require("../../data_layer/group_data_layer/groupDataLayer");
const userDataLayer = process.env.PROD ? require("./user_data_layer/userDataLayer") : require("../../data_layer/user_data_layer/userDataLayer");


module.exports = {
    getGroups: async function (groupId) {
        try {
            let groups;
            if(groupId){
                groups = await groupDataLayer.getGroup(groupId);
            }
            else{
                groups = await groupDataLayer.getAllGroups();
            }
            
            if (groups) {
                return groups;
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    checkUsersValid : function(usersToCheck) {
        try {
            const usersOnDB = await userDataLayer.getAllUsers();
            return usersToCheck.every(user => usersOnDB.includes(user)); 
        }
        catch(err){
            next(err)
        }
    },
    createNewGroup: async function (name, educators, collabs, guys, calendarMail) {
        const groupData = { 
            name: name,
            educators : educators,
            collaborators : collabs,
            guys : guys,
            calendarMail : calendarMail
        };
        try {
            const newGroup = await groupDataLayer.createGroup(groupData)

            if (newGroup) {
                return newGroup;
            }
            else
                return undefined;
        } catch (err) {
            next(err);
        }
    },
    editGroup: async function(groupId, name, educators, collabs, guys, calendarMail) {
        const groupData = { 
            name: name,
            educators : educators,
            collaborators : collabs,
            guys : guys,
            calendarMail : calendarMail
        };
        try {
            const editedGroup = await groupDataLayer.modifyGroup(groupId, groupData)

            if (editedGroup) {
                return editedGroup;
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    deleteGroup: async function (groupId) {
        try {
            const isDeleted = await groupDataLayer.deleteGroup(groupId)

            if (isDeleted) {
                return true;
            }
            else
                return false;

        } catch (err) {
            next(err);
        }
    }
}