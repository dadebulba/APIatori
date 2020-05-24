class DatalayerNotInitializedError extends Error {
    constructor(datalayerName){
        super(datalayerName + " not initialized yet");

        this.status = 500;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = DatalayerNotInitializedError;