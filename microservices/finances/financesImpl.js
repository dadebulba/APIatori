module.exports = {
    validateBookingType : function(type) {
        return bookingType.some(p => p === type);
    },
    getFinances : function (groupId, year) {
        return;
    },    
    addNewHistory : function (groupId,timestamp,amount,causal) {
        return;
    },
    editHistory : function (groupId,timestamp,amount,causal) {
        return;
    },
    deleteHistory : function (groupId,timestamp,amount,causal) {
        return;
    }
}