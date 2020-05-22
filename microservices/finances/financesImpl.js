const groupDataLayer = process.env.PROD ? require("./group_data_layer/groupDataLayer") : require("../../data_layer/group_data_layer/groupDataLayer");

module.exports = {
    getFinances: async function (groupId, year) {

        var yearTimestamp = new Date(year, 0).getTime();

        try {
            const group = await groupDataLayer.getGroup(groupId);
            if(group) {
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
            const group = await groupDataLayer.getGroup(groupId);
            if(group) {
                let balance = group.balance;
                balance += amount;
                let transactions = group.transactions;
                transactions.push(newTransaction);

                const groupData = { 
                    name: group.name,
                    educators : group.educators,
                    collaborators : group.collaborators,
                    guys : group.guys,
                    calendarMail : group.calendarMail,
                    balance : balance,
                    transactions : transactions
                };
                try {
                    const modifiedGroup =  await groupDataLayer.modifyGroup(groupId, groupData)

                    if (modifiedGroup) {
                        const year = new Date().getFullYear();
                        const yearTimestamp = new Date(year, 0).getTime();

                        let balance = modifiedGroup.balance;
                        let transactions = modifiedGroup.transactions;
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
            const group = await groupDataLayer.getGroup(groupId);
            if(group) {
                let transactions = group.transactions;
                
                let searchedTransaction = transactions.findIndex(t => t.timestamp === timestamp);
                if(searchedTransaction === -1)
                    return undefined;
                
                balance -= transactions[searchedTransaction].balance;
                balance += amount;

                transactions[searchedTransaction] = editedTransaction;

                const groupData = { 
                    name: group.name,
                    educators : group.educators,
                    collaborators : group.collaborators,
                    guys : group.guys,
                    calendarMail : group.calendarMail,
                    balance : balance,
                    transactions : transactions
                };
                try {
                    const modifiedGroup = await groupDataLayer.modifyGroup(groupId, groupData)

                    if (modifiedGroup) {
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
            const group = await groupDataLayer.getGroup(groupId);
            if(group) {
                let transactions = group.transactions;
                
                let searchedTransaction = transactions.findIndex(t => t.timestamp === timestamp);
                if(searchedTransaction === -1)
                    return undefined;
                
                balance -= transactions[searchedTransaction].balance;

                transactions.splice(searchedTransaction,1);

                const groupData = { 
                    name: group.name,
                    educators : group.educators,
                    collaborators : group.collaborators,
                    guys : group.guys,
                    calendarMail : group.calendarMail,
                    balance : balance,
                    transactions : transactions
                };
                try {
                    const modifiedGroup = await groupDataLayer.modifyGroup(groupId, groupData)

                    if (modifiedGroup) {
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