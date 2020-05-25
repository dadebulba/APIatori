class SpaceAlreadyExistsError extends Error {
    constructor(){
        super("Another space has the same name");

        this.status = 409;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = SpaceAlreadyExistsError;