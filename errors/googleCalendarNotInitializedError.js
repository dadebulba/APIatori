class GoogleCalendarNotInitializedError extends Error {
    constructor(){
        super("Google Calendar API not initialized - call init() method");

        this.status = 500;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = GoogleCalendarNotInitializedError;