class ParametersError extends Error {
    constructor(){
        super("Malformed or missing required parameter");

        this.status = 400;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ParametersError;