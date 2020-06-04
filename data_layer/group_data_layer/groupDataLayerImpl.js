const utility = require("../utility.js");
const Group = require("./groupSchema.js")[0];

const ParametersError = require("../../errors/parametersError");
const DatabaseError = require("../../errors/databaseError");
const GroupAlreadyExistsError = require("../../errors/groupAlreadyExistsError");

async function isGroupValid(group){
    if (typeof group !== "object")
        return false;
    if (utility.validateParamsUndefined(group.name, group.educators, group.guys) || group.educators.length == 0)
        return false;
    if (group.calendarId == undefined || typeof group.calendarId !== "string")
        return false;

    if (group.collaborators == undefined)
        group.collaborators = [];

    //Check uid validity
    let allValid = true;

    for (var i=0; i<group.educators.length && allValid; i++)
        if (!utility.isObjectIdValid(group.educators[i]))
            allValid = false;

    for (var i=0; i<group.collaborators.length && allValid; i++)
        if (!utility.isObjectIdValid(group.collaborators[i]))
            allValid = false;

    for (var i=0; i<group.guys.length && allValid; i++)
        if (!utility.isObjectIdValid(group.guys[i]))
            allValid = false;
        
    return allValid;
}

module.exports = {

    loadMockGroups : async function(groups){
        let mockGroups = JSON.parse(groups);

        for (var i=0; i<mockGroups.length; i++){
            let newGroup = new Group(mockGroups[i]);
            await newGroup.save();
        }

        return true;
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

        var result = await isGroupValid(groupInfo);
        if (!result)
            throw new ParametersError();

        //Check that there isn't already a group with the same name
        result = await Group.findOne({name: new RegExp('^'+groupInfo.name+'$', "i")}); // "i" for case-insensitive
        if (result != null && result.length != 0)
            throw new GroupAlreadyExistsError();

        let newGroup = new Group({
            name: groupInfo.name,
            educators: groupInfo.educators,
            collaborators: groupInfo.collaborators,
            guys: groupInfo.guys,
            balance: 0.0,
            transactions: [],
            calendarId: groupInfo.calendarId
        });
        result = await newGroup.save();
        if (result == undefined)
            throw new DatabaseError();
        
        result = JSON.parse(JSON.stringify(result));
        result.gid = result._id;
        delete result._id;
        delete result.__v;
        return result;
    },

    getGroup : async function(gid) {
        if (arguments.length != 1 || !utility.isObjectIdValid(gid))
            throw new ParametersError();

        let result = await Group.findById(gid);
        if (result != null){
            result = JSON.parse(JSON.stringify(result));
            delete result.__v;
            result.gid = result._id;
            delete result._id;
        }

        return (result != null)? result : undefined;
    },

    deleteGroup : async function(gid){
        if (arguments.length != 1 || !utility.isObjectIdValid(gid))
            throw new ParametersError();

        let result = await Group.findByIdAndDelete(gid);
        if (result != null){
            result = JSON.parse(JSON.stringify(result));
            result.gid = result._id;
            delete result._id;
            delete result.__v;
        }

        return (result != null) ? result : undefined;
    },

    modifyGroup : async function(gid, group){
        if (arguments.length != 2 || !utility.isObjectIdValid(gid) || group == undefined)
            throw new ParametersError();

        let result = await isGroupValid(group);
        if (!result || group.balance == undefined)
            throw new ParametersError("'balance' field is required");
            
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
        if (group.calendarId != undefined)
            updateObj.calendarId = group.calendarId;

        result = await Group.findByIdAndUpdate(gid, $set = updateObj, {new: true});
        if (result != null){
            result = JSON.parse(JSON.stringify(result));
            result.gid = result._id;
            delete result.__v;
            delete result._id;
        }

        return (result != null) ? result : undefined;
    }

}