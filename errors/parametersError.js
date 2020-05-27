class ParametersError extends Error {
    constructor(msg){
        super("Malformed or missing required parameter -> " + (msg != undefined) ? msg : "Generic parameter error");

        this.status = 400;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ParametersError;