class DatalayerAlreadyInitializedError extends Error {
    constructor(datalayerName){
        super(datalayerName + " has been already initialized");

        this.status = 500;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = DatalayerAlreadyInitializedError;