class IntervalOverlapError extends Error {
    constructor(){
        super("Time overlap detected");

        this.status = 409;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = IntervalOverlapError;