class DatabaseError extends Error {
    constructor(){
        super("Unable to perform operations on the database");

        this.status(500);
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = DatabaseError;