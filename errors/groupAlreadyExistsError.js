class GroupAlreadyExistsError extends Error {
    constructor(){
        super("Another group has the same name");

        this.status = 409;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = GroupAlreadyExistsError;