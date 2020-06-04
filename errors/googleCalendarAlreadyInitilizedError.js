class GoogleCalendarAlreadyInitializedError extends Error {
    constructor(){
        super("Google Calendar API has already been initialized");

        this.status = 500;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = GoogleCalendarAlreadyInitializedError;