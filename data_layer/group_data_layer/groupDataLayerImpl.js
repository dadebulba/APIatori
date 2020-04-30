const apiUtility = (process.env.PROD) ? require("./utility.js") : require("../../utility.js");
const Group = require("./groupSchema.js")[0];

async function isGroupValid(group){
    if (apiUtility.validateParamsUndefined(group.name, group.educators, group.guys) || group.educators.length == 0)
        return false;
    if (group.calendarMail != undefined && !apiUtility.validateEmail(group.calendarMail))
        return false;

    if (group.collaborators == undefined)
        group.collaborators = [];

    //Check uid validity
    let allValid = true;

    for (var i=0; i<group.educators.length && allValid; i++)
        if (!apiUtility.isObjectValid(group.educators[i]))
            allValid = false;

    for (var i=0; i<group.collaborators.length && allValid; i++)
        if (!apiUtility.isObjectValid(group.collaborators[i]))
            allValid = false;

    for (var i=0; i<group.guys.length && allValid; i++)
        if (!apiUtility.isObjectValid(group.guys[i]))
            allValid = false;
        
    return allValid;
}

module.exports = {

    loadMockGroups : async function(groups){
        throw new Error("Function not implemented yet");
    },

    retrieveAllGroups : async function(){
        const excludedFields = {
            __v: 0,
            collaborators: 0,
            guys: 0,
            balance: 0,
            transactions: 0
        }

        let groups = await Group.find({}, excludedFields);
        groups = JSON.parse(JSON.stringify(groups));
        groups.forEach((item) => {
            item.gid = item._id;
            delete item._id;
        });

        return groups;
    },

    createGroup : async function(groupInfo){

        let result = await isGroupValid(groupInfo);
        if (!result)
            return undefined;

        let newGroup = new Group({
            name: groupInfo.name,
            educators: groupInfo.educators,
            collaborators: groupInfo.collaborators,
            guys: groupInfo.guys,
            balance: 0.0,
            transactions: [],
            calendarMail: groupInfo.calendarMail
        });
        result = await newGroup.save();
        if (result == undefined)
            throw new Error("Cannot save new group into database");
        
        result = JSON.parse(JSON.stringify(result));
        result.gid = result._id;
        delete result._id;
        delete result.__v;
        return result;
    },

    getGroup : async function(gid) {
        if (gid == undefined || arguments.length != 1)
            return undefined;

        let result = await Group.findById(gid);
        if (result != undefined){
            result = JSON.parse(JSON.stringify(result));
            delete result.__v;
            result.gid = result._id;
            delete result._id;
        }

        return result;
    },

    deleteGroup : async function(gid){
        if (gid == undefined || arguments.length != 1)
            return undefined;

        let result = await Group.findByIdAndDelete(gid);
        return result;
    },

    modifyGroup : async function(gid, group){
        if (gid == undefined || group == undefined || group == "" || arguments.length != 2)
            throw new Error("Bad arguments");

        let result = await isGroupValid(group);
        if (!result || group.balance == undefined)
            throw new Error("Bad group format");

        var updateObj = {
            name: group.name,
            educators: group.educators,
            collaborators: group.collaborators,
            guys: group.guys,
        };

        //Add non-required fields
        if (group.balance != undefined)
            updateObj.balance = group.balance;
        if (group.transactions != undefined)
            updateObj.transactions = group.transactions;
        if (group.calendarMail != undefined)
            updateObj.calendarMail = group.calendarMail;

        result = await Group.findByIdAndUpdate(gid, $set = updateObj);
        if (result != undefined){
            result = JSON.parse(JSON.stringify(result));
            result.gid = result._id;
            delete result.__v;
            delete result._id;
        }

        return result;
    }

}