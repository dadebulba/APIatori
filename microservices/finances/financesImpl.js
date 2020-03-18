const apiUtility = require('../../utility.js');
process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config');

const BASE_URL = process.env.baseURL || config.get('baseURL');
const GROUP_DL_PATH = process.env.groupDLPath || config.get('groupDLPath');
const GROUP_DL_PORT = process.env.groupDataLayerPort || config.get('groupDataLayerPort');

const GROUP_DL_ENDPOINT = `${BASE_URL}:${GROUP_DL_PORT}${GROUP_DL_PATH}`;

module.exports = {
    getFinances: function (groupId, year) {

        var yearTimestamp = new Date(year, 0).getTime();

        try {
            const res = await fetch(`${GROUP_DL_ENDPOINT}/${groupId}`).then(apiUtility.checkStatus);
            if (res.ok) {
                let group = await res.json();
                let balance = group.balance;
                let transactions = group.transactions;
                let filteredTransactions = transactions.filter((t) => {
                    return t.timestamp >= yearTimestamp
                })
                return {
                    gid : groupId,
                    total : balance,
                    history : filteredTransactions
                };
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    addNewHistory: function (groupId, timestamp, amount, causal) {
        let newTransaction = {
            timestamp : timestamp,
            amount : amount,
            causal : causal
        }
        try {
            let response = await fetch(`${GROUP_DL_ENDPOINT}/${groupId}`).then(apiUtility.checkStatus);
            if(response.ok) {
                let group = await response.json();
                let balance = group.balance;
                balance += amount;
                let transactions = group.transactions;
                transactions.push(newTransaction);

                const body = { 
                    name: group.name,
                    educators : group.educators,
                    collaborators : group.collaborators,
                    guys : group.guys,
                    calendarMail : group.calendarMail,
                    
                };
                try {
                    const res = await fetch(SPACE_DL_ENDPOINT, {
                        method: 'POST',
                        body: JSON.stringify(body),
                        headers: { 'Content-Type': 'application/json' }

                    }).then(apiUtility.checkStatus);

                    if (res.ok) {
                        const spaces = await res.json();
                        return spaces;
                    }
                    else
                        return undefined;

                } catch (err) {
                    next(err);
                }

            }
            else {
                return undefined;
            }
        }
        catch (err) {
            next(err);
        }
    },
    editHistory: function (groupId, timestamp, amount, causal) {
        return;
    },
    deleteHistory: function (groupId, timestamp, amount, causal) {
        return;
    }
}