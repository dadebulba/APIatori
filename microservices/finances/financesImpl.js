const apiUtility = require('../../utility.js');
process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config');

const BASE_URL = process.env.baseURL || config.get('baseURL');
const GROUP_DL_PATH = process.env.groupDLPath || config.get('groupDLPath');
const GROUP_DL_PORT = process.env.groupDataLayerPort || config.get('groupDataLayerPort');

const GROUP_DL_ENDPOINT = `${BASE_URL}:${GROUP_DL_PORT}${GROUP_DL_PATH}`;

module.exports = {
    getFinances: async function (groupId, year) {

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
    addNewHistory: async function (groupId, timestamp, amount, causal) {
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
                    balance : balance,
                    transactions : transactions
                };
                try {
                    const res = await fetch(`${GROUP_DL_ENDPOINT}/${groupId}`, {
                        method: 'POST',
                        body: JSON.stringify(body),
                        headers: { 'Content-Type': 'application/json' }

                    }).then(apiUtility.checkStatus);

                    if (res.ok) {
                        const year = new Date().getFullYear();
                        const yearTimestamp = new Date(year, 0).getTime();

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

            }
            else {
                return undefined;
            }
        }
        catch (err) {
            next(err);
        }
    },
    editHistory: async function (groupId, timestamp, amount, causal) {
        let editedTransaction = {
            timestamp : timestamp,
            amount : amount,
            causal : causal
        }
        try {
            let response = await fetch(`${GROUP_DL_ENDPOINT}/${groupId}`).then(apiUtility.checkStatus);
            if(response.ok) {
                let group = await response.json();
                let transactions = group.transactions;
                
                let searchedTransaction = transactions.findIndex(t => t.timestamp === timestamp);
                if(searchedTransaction === -1)
                    return undefined;
                
                balance -= transactions[searchedTransaction].balance;
                balance += amount;

                transactions[searchedTransaction] = editedTransaction;

                const body = { 
                    name: group.name,
                    educators : group.educators,
                    collaborators : group.collaborators,
                    guys : group.guys,
                    calendarMail : group.calendarMail,
                    balance : balance,
                    transactions : transactions
                };
                try {
                    const res = await fetch(`${GROUP_DL_ENDPOINT}/${groupId}`, {
                        method: 'PUT',
                        body: JSON.stringify(body),
                        headers: { 'Content-Type': 'application/json' }

                    }).then(apiUtility.checkStatus);

                    if (res.ok) {
                        return editedTransaction;
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
    deleteHistory: async function (groupId, timestamp) {
        
        try {
            let response = await fetch(`${GROUP_DL_ENDPOINT}/${groupId}`).then(apiUtility.checkStatus);
            if(response.ok) {
                let group = await response.json();
                let transactions = group.transactions;
                
                let searchedTransaction = transactions.findIndex(t => t.timestamp === timestamp);
                if(searchedTransaction === -1)
                    return undefined;
                
                balance -= transactions[searchedTransaction].balance;

                transactions.splice(searchedTransaction,1);

                const body = { 
                    name: group.name,
                    educators : group.educators,
                    collaborators : group.collaborators,
                    guys : group.guys,
                    calendarMail : group.calendarMail,
                    balance : balance,
                    transactions : transactions
                };
                try {
                    const res = await fetch(`${GROUP_DL_ENDPOINT}/${groupId}`, {
                        method: 'PUT',
                        body: JSON.stringify(body),
                        headers: { 'Content-Type': 'application/json' }

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
            else {
                return undefined;
            }
        }
        catch (err) {
            next(err);
        }
    }
}